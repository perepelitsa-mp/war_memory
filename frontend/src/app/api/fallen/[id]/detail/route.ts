import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Fetch fallen data
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (fallenError || !fallen) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // Check if user is owner or if card is approved (for viewing)
    const isOwner = fallen.owner_id === user.id;
    if (!isOwner && fallen.status !== 'approved') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch timeline items (show all if owner, only approved otherwise)
    const timelineQuery = supabase
      .from('timeline_items')
      .select('*')
      .eq('fallen_id', id)
      .eq('is_deleted', false)
      .order('year', { ascending: true })
      .order('date_exact', { ascending: true });

    if (!isOwner) {
      timelineQuery.eq('status', 'approved');
    }

    const { data: timeline } = await timelineQuery;

    // Fetch memory items (show all if owner, only approved otherwise)
    const memoryQuery = supabase
      .from('memory_items')
      .select(`
        *,
        author:users!memory_items_created_by_fkey(id, full_name, avatar_url)
      `)
      .eq('fallen_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!isOwner) {
      memoryQuery.eq('status', 'approved');
    }

    const { data: memories } = await memoryQuery;

    // Fetch awards (show all if owner, only approved otherwise)
    const awardsQuery = supabase
      .from('fallen_awards')
      .select(`
        *,
        award:awards(*)
      `)
      .eq('fallen_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!isOwner) {
      awardsQuery.eq('status', 'approved');
    }

    const { data: fallenAwards } = await awardsQuery;

    // Filter out awards with null award data and sort by sort_order
    const awards = (fallenAwards || [])
      .filter((fa: any) => fa.award)
      .sort((a: any, b: any) => (b.award.sort_order || 0) - (a.award.sort_order || 0));

    return NextResponse.json({
      fallen,
      timeline: timeline || [],
      memories: memories || [],
      awards: awards || [],
    });
  } catch (error) {
    console.error('Error in detail API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
