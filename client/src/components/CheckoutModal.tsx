import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, DollarSign, Wallet, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { connectWallet, sendTokenPayment, calculateMetaMaskDiscount, type WalletConnection, type PaymentDetails } from '../lib/crypto';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderComplete: (orderId: string, txHash: string, total: number, discountApplied?: number) => void;
}

export default function CheckoutModal({ isOpen, onClose, onOrderComplete }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    note: '',
  });
  const [selectedPayment, setSelectedPayment] = useState<'PRDX' | 'USDC' | null>(null);
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({ type: 'crypto' });
  
  const { state, clearCart } = useCart();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConnectWallet = async () => {
    try {
      const connection = await connectWallet();
      setWalletConnection(connection);
      // Calculate MetaMask discount
      const discount = calculateMetaMaskDiscount(state.total);
      setPaymentDetails(discount);
      toast({
        title: "Wallet Connected",
        description: `MetaMask connected! You'll get a ${discount.discountPercentage}% discount on your order.`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!walletConnection || !selectedPayment) {
      toast({
        title: "Missing Requirements",
        description: "Please connect your wallet and select a payment method",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer information",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate final amount with MetaMask discount
      const finalAmount = paymentDetails ? paymentDetails.finalAmount : state.total;
      
      // Create order first
      const orderData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        note: formData.note,
        status: 'pending',
        paid: false,
        total: finalAmount.toFixed(2),
        menu_items: state.items.map(item => ({
          id: item.menuItem.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price
        })),
        extras: state.items.flatMap(item => 
          item.extras.map(extra => ({
            id: extra.id,
            name: extra.name,
            price: extra.price
          }))
        ),
        payment_method: selectedPayment,
        discount_applied: paymentDetails ? paymentDetails.discountPercentage : 0,
        original_total: state.total.toFixed(2),
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const order = await orderResponse.json();

      // Send payment with MetaMask discount
      const txHash = await sendTokenPayment(
        walletConnection,
        selectedPayment,
        state.total,
        true // Apply MetaMask discount
      );

      // Update order with payment info
      await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paid: true,
          tx_id: txHash,
          status: 'confirmed',
        }),
      });

      // Clear cart and show success
      clearCart();
      onOrderComplete(order.id, txHash, finalAmount, paymentDetails?.discountPercentage);
      onClose();

    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Checkout</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Order Summary */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {state.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.menuItem.name} x{item.quantity}</span>
                      <span>${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  {paymentDetails && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Subtotal:</span>
                        <span>${paymentDetails.originalAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600 mb-1">
                        <span>MetaMask Discount ({paymentDetails.discountPercentage}%):</span>
                        <span>-${paymentDetails.discountAmount.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-[hsl(142,71%,45%)]">
                      ${(paymentDetails ? paymentDetails.finalAmount : state.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main St"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="note">Special Instructions</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Any special requests or notes..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-colors ${
                  selectedPayment === 'PRDX' ? 'border-[hsl(142,71%,45%)] bg-green-50' : 'hover:border-[hsl(142,71%,45%)]'
                }`}
                onClick={() => setSelectedPayment('PRDX')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">PRDX Token</h5>
                      <p className="text-sm text-gray-600">Pay with PRDX on Base</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Coins className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-colors ${
                  selectedPayment === 'USDC' ? 'border-[hsl(142,71%,45%)] bg-green-50' : 'hover:border-[hsl(142,71%,45%)]'
                }`}
                onClick={() => setSelectedPayment('USDC')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-900">USDC</h5>
                      <p className="text-sm text-gray-600">Pay with USDC on Base</p>
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Wallet Connection */}
          <div>
            <div className="text-center">
              {!walletConnection ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      🎉 Connect your MetaMask wallet to get a <strong>10% discount</strong> on your order!
                    </p>
                  </div>
                  <Button
                    onClick={handleConnectWallet}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect MetaMask Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Connected: {walletConnection.address.slice(0, 6)}...{walletConnection.address.slice(-4)}
                  </div>
                  {paymentDetails && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✅ MetaMask discount applied! Save ${paymentDetails.discountAmount.toFixed(2)} on this order.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={!walletConnection || !selectedPayment || isProcessing}
            className="w-full bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)] disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Place Order & Pay'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
