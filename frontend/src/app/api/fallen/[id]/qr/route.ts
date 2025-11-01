import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'

// GET - получить QR-код для карточки героя
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: fallenId } = params
    const supabase = await createClient()

    // Проверяем, существует ли карточка
    const { data: fallen, error } = await supabase
      .from('fallen')
      .select('id, first_name, last_name, middle_name')
      .eq('id', fallenId)
      .single()

    if (error || !fallen) {
      return NextResponse.json({ error: 'Fallen not found' }, { status: 404 })
    }

    // Получаем полный URL карточки
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const cardUrl = `${baseUrl}/fallen/${fallenId}`

    // Генерируем QR-код как Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(cardUrl, {
      errorCorrectionLevel: 'H', // Высокая устойчивость к повреждениям
      type: 'image/png',
      quality: 1,
      margin: 2,
      width: 400,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    // Возвращаем QR-код и данные героя
    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      url: cardUrl,
      fallen: {
        id: fallen.id,
        fullName: `${fallen.last_name} ${fallen.first_name}${fallen.middle_name ? ` ${fallen.middle_name}` : ''}`,
      },
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
