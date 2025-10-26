import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch all awards ordered by sort_order
    const { data: awards, error } = await supabase
      .from('awards')
      .select('*')
      .order('sort_order', { ascending: false });

    if (error) {
      console.error('Error fetching awards:', error);
      return NextResponse.json({ error: 'Failed to fetch awards' }, { status: 500 });
    }

    return NextResponse.json({ awards: awards || [] });
  } catch (error) {
    console.error('Error in awards API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
