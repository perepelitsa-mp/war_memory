import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - получить список зажёгших свечу и информацию о текущем пользователе
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    // Получаем текущего пользователя
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Получаем список всех зажёгших свечу с информацией о пользователях
    const { data: candleLights, error } = await supabase
      .from('candle_lights')
      .select(
        `
        id,
        created_at,
        user:users!candle_lights_user_id_fkey(id, full_name, avatar_url)
      `
      )
      .eq('fallen_id', fallenId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching candle lights:', error)
      return NextResponse.json({ error: 'Failed to fetch candle lights' }, { status: 500 })
    }

    // Проверяем, зажёг ли текущий пользователь свечу
    const currentUserLit = user
      ? candleLights?.some((cl: any) => cl.user?.id === user.id)
      : false

    return NextResponse.json({
      count: candleLights?.length || 0,
      lights: candleLights || [],
      currentUserLit,
    })
  } catch (error) {
    console.error('Error in candles API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - зажечь или погасить свечу (toggle)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id: fallenId } = params

    // Проверяем авторизацию
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Проверяем, существует ли уже свеча от этого пользователя
    const { data: existing, error: checkError } = await supabase
      .from('candle_lights')
      .select('id')
      .eq('fallen_id', fallenId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking candle light:', checkError)
      return NextResponse.json({ error: 'Failed to check candle light' }, { status: 500 })
    }

    if (existing) {
      // Если свеча уже зажжена - гасим (удаляем)
      const { error: deleteError } = await supabase
        .from('candle_lights')
        .delete()
        .eq('id', existing.id)

      if (deleteError) {
        console.error('Error deleting candle light:', deleteError)
        return NextResponse.json({ error: 'Failed to delete candle light' }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'extinguished' })
    } else {
      // Если свечи нет - зажигаем (создаём)
      const { error: insertError } = await supabase.from('candle_lights').insert({
        fallen_id: fallenId,
        user_id: user.id,
      })

      if (insertError) {
        console.error('Error inserting candle light:', insertError)
        return NextResponse.json({ error: 'Failed to light candle' }, { status: 500 })
      }

      return NextResponse.json({ success: true, action: 'lit' })
    }
  } catch (error) {
    console.error('Error in candles POST API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
