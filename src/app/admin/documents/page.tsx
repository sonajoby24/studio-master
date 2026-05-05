'use client';

import { useNotifications } from '@/context/notification-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from 'date-fns';
import { FileText, Mail, FileDown, Loader2, Copy, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';

const WhatsAppIcon = () => (
  <MessageCircle className="h-6 w-6" />
);

export default function DocumentsPage() {
  const { notifications } = useNotifications();
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const stripHtml = (html: string) => {
    if (typeof document !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
    return html.replace(/<[^>]*>/g, '');
  };

  const handleCopyLink = (quoteId: string) => {
    const link = `${window.location.origin}/quote/${quoteId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link Copied!",
        description: "Copied to clipboard",
      });
    });
  };

  const handleConvertToPdf = async (htmlContent: string, fileName: string) => {
    setIsConverting(true);
    try {
      const contentElement = document.createElement('div');
      contentElement.innerHTML = htmlContent;
      contentElement.style.position = 'absolute';
      contentElement.style.left = '-9999px';
      contentElement.style.width = '794px';
      document.body.appendChild(contentElement);

      const canvas = await html2canvas(contentElement, { scale: 2 });
      document.body.removeChild(contentElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 180, 0);
      pdf.save(`${fileName}.pdf`);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Generated Documents</h1>

      {notifications.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {notifications.map((notification) => (
            <AccordionItem key={notification.id} value={`item-${notification.id}`}>
              <AccordionTrigger>
                {notification.emailSubject}
              </AccordionTrigger>

              <AccordionContent className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      dangerouslySetInnerHTML={{ __html: notification.emailBody }}
                    />
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  {notification.quoteId && (
                    <Button onClick={() => handleCopyLink(notification.quoteId)}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                  )}

                  <Button
                    onClick={() =>
                      handleConvertToPdf(
                        notification.emailBody,
                        notification.quoteId || notification.id
                      )
                    }
                    disabled={isConverting}
                  >
                    {isConverting ? <Loader2 className="animate-spin" /> : <FileDown />}
                    PDF
                  </Button>

                  <a
                    href={`mailto:${notification.customer.email}`}
                    className="border px-3 py-1 rounded"
                  >
                    <Mail className="inline mr-1" />
                    Email
                  </a>

                  {notification.customer.phone && (
                    <a
                      href={`https://wa.me/${notification.customer.phone}`}
                      target="_blank"
                    >
                      <WhatsAppIcon />
                    </a>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p>No documents found</p>
      )}
    </div>
  );
}