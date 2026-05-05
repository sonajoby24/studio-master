'use client';

import { useState } from 'react';
import { useQuote } from '@/context/quote-context';
import { useOrders } from '@/context/order-context';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Trash2, FileText, ShoppingCart, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AddressForm, type AddressFormValues } from './address-form';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sendQuote } from '@/ai/flows/send-quote-flow';
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function QuoteSheet() {
  const {
    quote,
    isQuoteSheetOpen,
    setIsQuoteSheetOpen,
    updateItemQuantity,
    removeItemFromQuote,
    subTotal,
    grandTotal,
    clearQuote,
    updateQuoteField,
    updateIndicativePricingField,
  } = useQuote();

  const { addOrder } = useOrders();
  const { toast } = useToast();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handlePlaceOrder = (customerData: AddressFormValues) => {
    if (!quote.items) return;

    addOrder(customerData, quote.items, grandTotal);

    toast({
      title: "Order Placed!",
      description: "Your order is being processed.",
    });

    clearQuote();
    setIsCheckoutOpen(false);
    setIsQuoteSheetOpen(false);
  };

  const handleSendQuote = async () => {
    setIsSending(true);

    toast({
      title: 'Generating Document...',
      description: 'Please wait while we prepare the quote.',
    });

    try {
      const emailContent = await sendQuote(quote);

      const plainQuoteObject = JSON.parse(JSON.stringify(quote));
      const quoteDocRef = doc(db, 'quotes', quote.quoteId);

      await setDoc(quoteDocRef, plainQuoteObject);

      await addDoc(collection(db, 'notifications'), {
        customer: {
          email: 'customer@example.com',
          phone: '555-123-4567',
        },
        emailSubject: emailContent.emailSubject,
        emailBody: emailContent.emailBody,
        sentAt: serverTimestamp(),
        quoteId: quote.quoteId,
      });

      updateQuoteField('approvalStatus', 'SentForApproval');

      toast({
        title: 'Document Generated!',
        description: 'Quote saved and ready to share.',
      });

    } catch (error) {
      console.error(error);

      toast({
        title: 'Error',
        description: 'Failed to generate document.',
        variant: 'destructive',
      });

    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={isQuoteSheetOpen} onOpenChange={setIsQuoteSheetOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>Quote Builder</SheetTitle>
        </SheetHeader>

        <Separator />

        {quote.items && quote.items.length > 0 ? (
          <>
            <div className="flex-1 overflow-hidden flex flex-col gap-4">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-1">

                <div className="space-y-2">
                  <Label>Quote ID</Label>
                  <Input value={quote.quoteId} readOnly />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={quote.status} onValueChange={(v) => updateQuoteField('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="InProgress">In Progress</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <Separator />

              <ScrollArea className="h-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {quote.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>

                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                          />
                        </TableCell>

                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>₹{item.price * item.quantity}</TableCell>

                        <TableCell>
                          <Button onClick={() => removeItemFromQuote(item.id)}>
                            <Trash2 />
                          </Button>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <SheetFooter className="mt-auto space-y-4">

              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>₹{grandTotal.toFixed(2)}</p>
              </div>

              <Button onClick={handleSendQuote} disabled={isSending}>
                {isSending ? <Loader2 className="animate-spin" /> : <FileText />}
                Generate Document
              </Button>

              <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <ShoppingCart />
                    Create Order
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Customer Info</DialogTitle>
                    <DialogDescription>Enter details</DialogDescription>
                  </DialogHeader>

                  <AddressForm onSubmit={handlePlaceOrder} />
                </DialogContent>
              </Dialog>

              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>

            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            Empty Quote
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}