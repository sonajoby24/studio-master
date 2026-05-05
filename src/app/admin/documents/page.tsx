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
  <MessageCircle className="h-5 w-5" />
);

export default function DocumentsPage() {
  const { notifications } = useNotifications();
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  // ✅ Remove HTML tags
  const stripHtml = (html: string) => {
    if (typeof document !== 'undefined') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    }
    return html.replace(/<[^>]*>/g, '');
  };

  // ✅ Copy link
  const handleCopyLink = (quoteId: string) => {
    const link = `${window.location.origin}/quote/${quoteId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({
        title: "Link Copied!",
        description: "Copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    });
  };

  // ✅ Convert to PDF
  const handleConvertToPdf = async (htmlContent: string, fileName: string) => {
    setIsConverting(true);
    try {
      const contentElement = document.createElement('div');
      contentElement.innerHTML = htmlContent;

      contentElement.style.position = 'absolute';
      contentElement.style.left = '-9999px';
      contentElement.style.width = '794px';
      contentElement.style.padding = '20px';
      contentElement.style.backgroundColor = 'white';
      contentElement.style.color = 'black';

      document.body.appendChild(contentElement);

      const canvas = await html2canvas(contentElement, { scale: 2 });
      document.body.removeChild(contentElement);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();

      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold">Generated Documents</h1>
        <p className="text-muted-foreground">All generated customer documents</p>
      </header>

      {notifications.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-4">
          {notifications.map((notification) => (
            <AccordionItem
              key={notification.id}
              value={`item-${notification.id}`}
              className="border rounded-lg px-4"
            >
              <AccordionTrigger>
                <div className="flex justify-between w-full items-center">
                  <div>
                    <p className="font-semibold">{notification.emailSubject}</p>
                    <p className="text-sm text-muted-foreground">
                      To: {notification.customer.email}
                    </p>
                  </div>

                  <div className="text-right">
                    {notification.quoteId && (
                      <Badge variant="secondary">
                        {notification.quoteId}
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(notification.sentAt, "PPP p")}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Email Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="p-3 border rounded bg-muted/20"
                      dangerouslySetInnerHTML={{
                        __html: notification.emailBody,
                      }}
                    />
                  </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2 justify-end">
                  {/* Copy link */}
                  {notification.quoteId && (
                    <Button
                      variant="outline"
                      onClick={() => handleCopyLink(notification.quoteId!)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                  )}

                  {/* PDF */}
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleConvertToPdf(
                        notification.emailBody,
                        notification.quoteId || `doc_${notification.id}`
                      )
                    }
                    disabled={isConverting}
                  >
                    {isConverting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <FileDown className="h-4 w-4 mr-1" />
                    )}
                    PDF
                  </Button>

                  {/* Email */}
                  <a
                    href={`mailto:${notification.customer.email}?subject=${encodeURIComponent(notification.emailSubject)}&body=${encodeURIComponent(stripHtml(notification.emailBody))}`}
                    className="border px-3 py-1 rounded flex items-center"
                  >
                    <Mail className="mr-1 h-4 w-4" />
                    Email
                  </a>

                  {/* WhatsApp */}
                  {notification.customer.phone && (
                    <a
                      href={`https://wa.me/${notification.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(stripHtml(notification.emailBody))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border px-3 py-1 rounded flex items-center bg-green-100"
                    >
                      <WhatsAppIcon />
                      <span className="ml-1">WhatsApp</span>
                    </a>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="text-center py-10 text-muted-foreground">
            <FileText className="mx-auto mb-2" />
            No documents found
          </CardContent>
        </Card>
      )}
    </div>
  );
}