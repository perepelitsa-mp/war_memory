import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Allowed fields that can be updated
const ALLOWED_FIELDS = [
  'first_name',
  'last_name',
  'middle_name',
  'birth_date',
  'death_date',
  'service_type',
  'service_start_date',
  'service_end_date',
  'rank',
  'military_unit',
  'hometown',
  'burial_location',
  'hero_photo_url',
] as const

type AllowedField = typeof ALLOWED_FIELDS[number]

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user role and info
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get fallen card
    const { data: fallen, error: fallenError } = await supabase
      .from('fallen')
      .select('owner_id, editors, status')
      .eq('id', fallenId)
      .eq('is_deleted', false)
      .single()

    if (fallenError || !fallen) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    // Check permissions
    const isOwner = fallen.owner_id === user.id
    const isEditor = Array.isArray(fallen.editors) && fallen.editors.includes(user.id)
    const isModerator = ['moderator', 'admin', 'superadmin'].includes(userData.role)
    const canEdit = isOwner || isEditor || isModerator

    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden: No permission to edit' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { field, value } = body

    // Validate field name
    if (!ALLOWED_FIELDS.includes(field as AllowedField)) {
      return NextResponse.json({ error: 'Invalid field name' }, { status: 400 })
    }

    // Validate value type based on field
    let processedValue: any = value

    if (field === 'birth_date' || field === 'death_date' || field === 'service_start_date' || field === 'service_end_date') {
      // Validate date format
      if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 })
      }
    }

    if (field === 'service_type') {
      // Validate service type enum
      const validServiceTypes = ['mobilized', 'volunteer', 'pmc', 'professional']
      if (value && !validServiceTypes.includes(value)) {
        return NextResponse.json({ error: 'Invalid service type' }, { status: 400 })
      }
    }

    // Update the field
    const { error: updateError } = await supabase
      .from('fallen')
      .update({
        [field]: processedValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fallenId)

    if (updateError) {
      console.error('Error updating field:', updateError)
      return NextResponse.json(
        { error: 'Failed to update field' },
        { status: 500 }
      )
    }

    // Log to audit
    await supabase.from('audit_log').insert({
      table_name: 'fallen',
      record_id: fallenId,
      action: 'UPDATE',
      old_values: null,
      new_values: { [field]: processedValue },
      user_id: user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Field updated successfully',
    })
  } catch (error) {
    console.error('Error in update-field API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
