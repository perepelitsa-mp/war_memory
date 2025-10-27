import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const resolveBooleanFlag = (value: FormDataEntryValue | null): boolean => {
  if (!value) {
    return false;
  }
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
};

const normalizeDate = (value: FormDataEntryValue | null): string | null => {
  if (!value) {
    return null;
  }
  const raw = String(value).trim();
  return raw.length === 0 ? null : raw;
};

const uploadTimelineMedia = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  fallenId: string,
  userId: string,
  title: string,
) => {
  const extension = file.name.split('.').pop() || 'jpg';
  const storagePath = `${fallenId}/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('fallen-photos')
    .upload(storagePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error('Не удалось загрузить файл.');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('fallen-photos').getPublicUrl(uploadData.path);

  const { data: mediaRecord, error: mediaError } = await supabase
    .from('fallen_media')
    .insert({
      fallen_id: fallenId,
      media_type: 'photo',
      file_url: publicUrl,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: userId,
      status: 'approved',
      alt_text: title,
    })
    .select('id')
    .single();

  if (mediaError || !mediaRecord) {
    throw new Error('Не удалось сохранить информацию о файле.');
  }

  return mediaRecord.id as string;
};

const markMediaAsDeleted = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  mediaId: string,
  userId: string,
) => {
  await supabase
    .from('fallen_media')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
    } as any)
    .eq('id', mediaId);
};

const resolvePermissions = async (
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  fallenId: string,
  authorId: string,
) => {
  const [{ data: userRecord }, { data: fallenRecord }] = await Promise.all([
    supabase.from('users').select('role').eq('id', userId).maybeSingle(),
    supabase.from('fallen').select('owner_id').eq('id', fallenId).maybeSingle(),
  ]);

  if (!fallenRecord) {
    throw new Error('NOT_FOUND');
  }

  const isOwner = fallenRecord.owner_id === userId;
  const isAuthor = authorId === userId;
  const isAdmin = userRecord
    ? ['superadmin', 'admin', 'moderator'].includes(userRecord.role || '')
    : false;

  if (!isOwner && !isAuthor && !isAdmin) {
    throw new Error('FORBIDDEN');
  }

  return { isOwner, isAuthor, isAdmin };
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timelineId = params.id;

    const { data: timelineItem, error: timelineError } = await supabase
      .from('timeline_items')
      .select('*')
      .eq('id', timelineId)
      .eq('is_deleted', false)
      .single();

    if (timelineError || !timelineItem) {
      return NextResponse.json({ error: 'Timeline item not found' }, { status: 404 });
    }

    try {
      await resolvePermissions(supabase, user.id, timelineItem.fallen_id, timelineItem.created_by);
    } catch (permissionError) {
      if (permissionError instanceof Error && permissionError.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Fallen card not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Недостаточно прав для редактирования события.' },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const dateExact = normalizeDate(formData.get('date_exact'));
    const removeMedia = resolveBooleanFlag(formData.get('remove_media'));
    const fileCandidate = formData.get('file');
    const file = fileCandidate instanceof File && fileCandidate.size > 0 ? fileCandidate : null;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 },
      );
    }

    if (file) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds 5MB limit' },
          { status: 400 },
        );
      }
    }

    const shouldRemoveExisting = removeMedia || Boolean(file);
    let mediaIdToUse: string | null = timelineItem.media_id;

    if (shouldRemoveExisting && timelineItem.media_id) {
      await markMediaAsDeleted(supabase, timelineItem.media_id, user.id);
      mediaIdToUse = null;
    }

    if (file) {
      mediaIdToUse = await uploadTimelineMedia(
        supabase,
        file,
        timelineItem.fallen_id,
        user.id,
        String(title),
      );
    }

    let updatedYear: number | null = timelineItem.year;
    if (dateExact) {
      const parsedDate = new Date(dateExact);
      updatedYear = Number.isNaN(parsedDate.getTime())
        ? timelineItem.year
        : parsedDate.getFullYear();
    } else if (!timelineItem.date_exact) {
      updatedYear = timelineItem.year ?? null;
    }

    const { data: updatedTimeline, error: updateError } = await supabase
      .from('timeline_items')
      .update({
        title: String(title).trim(),
        description_md: String(description).trim(),
        date_exact: dateExact,
        year: updatedYear,
        media_id: mediaIdToUse,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', timelineId)
      .select()
      .single();

    if (updateError || !updatedTimeline) {
      console.error('Error updating timeline item:', updateError);
      return NextResponse.json(
        { error: 'Не удалось обновить событие. Проверьте права доступа.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, item: updatedTimeline });
  } catch (error) {
    console.error('Unexpected error updating timeline item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timelineId = params.id;

    const { data: timelineItem, error: timelineError } = await supabase
      .from('timeline_items')
      .select('*')
      .eq('id', timelineId)
      .eq('is_deleted', false)
      .single();

    if (timelineError || !timelineItem) {
      return NextResponse.json({ error: 'Timeline item not found' }, { status: 404 });
    }

    try {
      await resolvePermissions(supabase, user.id, timelineItem.fallen_id, timelineItem.created_by);
    } catch (permissionError) {
      if (permissionError instanceof Error && permissionError.message === 'NOT_FOUND') {
        return NextResponse.json({ error: 'Fallen card not found' }, { status: 404 });
      }
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления события.' },
        { status: 403 },
      );
    }

    const now = new Date().toISOString();

    if (timelineItem.media_id) {
      await markMediaAsDeleted(supabase, timelineItem.media_id, user.id);
    }

    const { error: deleteError } = await supabase
      .from('timeline_items')
      .update({
        is_deleted: true,
        deleted_at: now,
        deleted_by: user.id,
        status: 'archived',
      } as any)
      .eq('id', timelineId);

    if (deleteError) {
      console.error('Error deleting timeline item:', deleteError);
      return NextResponse.json(
        { error: 'Не удалось удалить событие.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error deleting timeline item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
