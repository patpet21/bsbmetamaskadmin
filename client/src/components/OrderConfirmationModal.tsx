import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  txHash: string;
  total: number;
  discountApplied?: number;
}

export default function OrderConfirmationModal({ 
  isOpen, 
  onClose, 
  orderId, 
  txHash, 
  total,
  discountApplied = 0
}: OrderConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-[hsl(142,71%,45%)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h3>
          <p className="text-gray-600 mb-6">
            Thank you for your order. Your payment has been processed successfully.
          </p>
          
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="text-sm text-gray-600 mb-2">Transaction Hash:</div>
              <div className="text-xs font-mono bg-gray-50 p-2 rounded border break-all">
                {txHash}
              </div>
            </CardContent>
          </Card>
          
          <div className="text-left mb-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold">#{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-[hsl(142,71%,45%)]">
                ${total.toFixed(2)}
              </span>
            </div>
            {discountApplied > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount Applied:</span>
                <span className="font-semibold text-green-600">
                  {discountApplied}%
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-green-600 font-semibold">Confirmed</span>
            </div>
          </div>
          
          <Button
            onClick={onClose}
            className="w-full bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]"
          >
            Continue Shopping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
