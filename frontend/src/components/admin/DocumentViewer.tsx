'use client';

import { useState } from 'react';
import { FileText, Download, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DocumentViewerProps {
  documentUrl: string | null;
  documentType?: 'image' | 'pdf' | 'other';
  label?: string;
}

export function DocumentViewer({
  documentUrl,
  documentType = 'image',
  label = 'Справка о родстве',
}: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!documentUrl) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span>Документ не прикреплен</span>
      </div>
    );
  }

  // Определяем тип документа по расширению
  const getDocumentType = (url: string): 'image' | 'pdf' | 'other' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  };

  const type = documentType || getDocumentType(documentUrl);

  const handleDownload = () => {
    window.open(documentUrl, '_blank');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="h-3.5 w-3.5" />
            Скачать
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-3.5 w-3.5" />
                Просмотр
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{label}</DialogTitle>
              </DialogHeader>
              <div className="relative max-h-[70vh] overflow-auto">
                {type === 'image' && (
                  <img
                    src={documentUrl}
                    alt={label}
                    className="w-full rounded-lg object-contain"
                  />
                )}
                {type === 'pdf' && (
                  <iframe
                    src={documentUrl}
                    className="h-[70vh] w-full rounded-lg"
                    title={label}
                  />
                )}
                {type === 'other' && (
                  <div className="flex flex-col items-center justify-center gap-4 py-12">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Предварительный просмотр недоступен для этого типа файла
                    </p>
                    <Button onClick={handleDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Скачать документ
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate text-muted-foreground">
          {documentUrl.split('/').pop()}
        </span>
      </div>
    </div>
  );
}
