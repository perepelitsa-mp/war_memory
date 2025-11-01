'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QrCode, Download, Printer, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface QRCodePrintProps {
  fallenId: string
  falleName: string
  birthDate?: string
  deathDate?: string
  rank?: string
  unit?: string
}

export function QRCodePrint({
  fallenId,
  falleName,
  birthDate,
  deathDate,
  rank,
  unit,
}: QRCodePrintProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [cardUrl, setCardUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const loadQRCode = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/fallen/${fallenId}/qr`)
      if (!response.ok) {
        throw new Error('Failed to generate QR code')
      }

      const data = await response.json()
      setQrCodeDataUrl(data.qrCode)
      setCardUrl(data.url)
    } catch (error) {
      console.error('Error loading QR code:', error)
      alert('Не удалось загрузить QR-код')
    } finally {
      setLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    if (!qrCodeDataUrl) {
      loadQRCode()
    }
  }

  const handleDownload = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement('a')
    link.download = `qr-code-${fallenId}.png`
    link.href = qrCodeDataUrl
    link.click()
  }

  const handlePrint = () => {
    if (!qrCodeDataUrl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const lifeYears =
      birthDate && deathDate
        ? `${new Date(birthDate).getFullYear()} - ${new Date(deathDate).getFullYear()}`
        : ''

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR-код - ${falleName}</title>
          <style>
            @page {
              size: A5 portrait;
              margin: 1cm;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .container {
              text-align: center;
              max-width: 400px;
            }
            h1 {
              font-size: 24px;
              font-weight: bold;
              margin: 0 0 10px 0;
              color: #000;
            }
            .years {
              font-size: 18px;
              color: #666;
              margin: 0 0 10px 0;
            }
            .details {
              font-size: 14px;
              color: #444;
              margin: 0 0 20px 0;
            }
            .qr-code {
              margin: 20px 0;
            }
            .qr-code img {
              width: 250px;
              height: 250px;
              border: 2px solid #000;
            }
            .description {
              font-size: 12px;
              color: #666;
              margin-top: 20px;
              line-height: 1.5;
            }
            .url {
              font-size: 11px;
              color: #999;
              margin-top: 10px;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${falleName}</h1>
            ${lifeYears ? `<p class="years">${lifeYears}</p>` : ''}
            ${rank || unit ? `<p class="details">${[rank, unit].filter(Boolean).join(', ')}</p>` : ''}

            <div class="qr-code">
              <img src="${qrCodeDataUrl}" alt="QR-код" />
            </div>

            <p class="description">
              Отсканируйте QR-код, чтобы узнать больше<br>
              о жизни и подвиге героя
            </p>

            <p class="url">${cardUrl}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className="w-full gap-2"
      >
        <QrCode className="h-4 w-4" />
        <span className="text-xs">QR-код</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <QrCode className="h-5 w-5" />
              QR-код для памятника
            </DialogTitle>
            <DialogDescription className="text-sm">
              Отсканируйте QR-код на смартфоне, чтобы перейти на страницу памяти героя.
              Распечатайте и разместите на памятнике.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : qrCodeDataUrl ? (
              <>
                <div className="flex justify-center rounded-lg border border-border bg-white p-3 sm:p-4">
                  <Image
                    src={qrCodeDataUrl}
                    alt="QR-код"
                    width={200}
                    height={200}
                    className="h-[200px] w-[200px] rounded border-2 border-black sm:h-[250px] sm:w-[250px]"
                  />
                </div>

                <div className="space-y-2 rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="font-semibold">{falleName}</p>
                  {birthDate && deathDate && (
                    <p className="text-muted-foreground">
                      {new Date(birthDate).getFullYear()} -{' '}
                      {new Date(deathDate).getFullYear()}
                    </p>
                  )}
                  {(rank || unit) && (
                    <p className="text-muted-foreground">
                      {[rank, unit].filter(Boolean).join(', ')}
                    </p>
                  )}
                  <p className="break-all text-xs text-muted-foreground">{cardUrl}</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={handlePrint} className="w-full gap-2 sm:flex-1">
                    <Printer className="h-4 w-4" />
                    <span className="text-sm">Печать</span>
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full gap-2 sm:flex-1"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Скачать</span>
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
