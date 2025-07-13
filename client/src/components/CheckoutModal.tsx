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
        title: "Wallet Connesso!",
        description: `MetaMask connesso! Riceverai uno sconto del ${discount.discountPercentage}% sul tuo ordine.`,
      });
    } catch (error) {
      toast({
        title: "Connessione Fallita",
        description: error instanceof Error ? error.message : "Impossibile connettere wallet",
        variant: "destructive",
      });
    }
  };

  const processCardPayment = async (cardDetails: any) => {
    // Simulate card payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, you would integrate with a payment processor like Stripe
    const mockTransactionId = 'card_' + Math.random().toString(36).substring(2, 15);
    return {
      transactionId: mockTransactionId,
      last4: cardDetails.number.replace(/\s/g, '').slice(-4),
      brand: cardDetails.number.replace(/\s/g, '').startsWith('4') ? 'visa' : 'mastercard'
    };
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.address) {
      toast({
        title: "Errore",
        description: "Per favore compila tutti i campi obbligatori.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      let orderData: any = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        menu_items: JSON.stringify(state.items),
        total_amount: state.total,
        payment_method: paymentMethod.type,
        status: 'pending'
      };

      if (paymentMethod.type === 'crypto') {
        if (!selectedPayment || !walletConnection) {
          toast({
            title: "Errore",
            description: "Per favore seleziona un metodo di pagamento e connetti il wallet.",
            variant: "destructive",
          });
          return;
        }

        // Process crypto payment
        const finalAmount = paymentDetails?.finalAmount || state.total;
        const txHash = await sendTokenPayment(walletConnection, selectedPayment, finalAmount);
        
        orderData.transaction_hash = txHash;
        orderData.payment_token = selectedPayment;
        orderData.discount_applied = paymentDetails?.discountAmount || 0;
        orderData.total_amount = finalAmount;
        orderData.status = 'completed';
        
      } else if (paymentMethod.type === 'card') {
        if (!paymentMethod.cardDetails) {
          toast({
            title: "Errore",
            description: "Per favore inserisci i dettagli della carta.",
            variant: "destructive",
          });
          return;
        }

        // Process card payment
        const cardResult = await processCardPayment(paymentMethod.cardDetails);
        orderData.transaction_hash = cardResult.transactionId;
        orderData.card_last4 = cardResult.last4;
        orderData.card_brand = cardResult.brand;
        orderData.status = 'completed';
      }

      // Save order to database
      const response = await apiRequest('POST', '/api/orders', orderData);
      const order = await response.json();
      
      const discountAmount = paymentMethod.type === 'crypto' ? (paymentDetails?.discountAmount || 0) : 0;
      const finalAmount = paymentMethod.type === 'crypto' ? (paymentDetails?.finalAmount || state.total) : state.total;
      
      onOrderComplete(order.id.toString(), orderData.transaction_hash, finalAmount, discountAmount);
      clearCart();
      onClose();
      
      toast({
        title: "Ordine Completato!",
        description: `Pagamento di €${finalAmount.toFixed(2)} completato con successo.`,
      });
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      toast({
        title: "Errore nel Pagamento", 
        description: error.message || "Il pagamento non è andato a buon fine.",
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
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Metodo di Pagamento</h4>
            <PaymentMethodSelector 
              onPaymentMethodSelect={setPaymentMethod}
              selectedMethod={paymentMethod}
            />
            
            {/* Show crypto token selection only if crypto is selected */}
            {paymentMethod.type === 'crypto' && (
              <div className="mt-4">
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
            )}
          </div>

          {/* Wallet Connection - only show if crypto payment selected */}
          {paymentMethod.type === 'crypto' && (
            <div>
              <div className="text-center">
                {!walletConnection ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800">
                        🎉 Connetti il tuo wallet MetaMask per ottenere uno <strong>sconto del 10%</strong> sul tuo ordine!
                      </p>
                    </div>
                    <Button
                      onClick={handleConnectWallet}
                      className="bg-gray-900 text-white hover:bg-gray-800"
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connetti MetaMask Wallet
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      Connesso: {walletConnection.address.slice(0, 6)}...{walletConnection.address.slice(-4)}
                    </div>
                    {paymentDetails && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-sm text-green-800">
                          ✅ Sconto MetaMask applicato! Risparmi €{paymentDetails.discountAmount.toFixed(2)} su questo ordine.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Place Order Button */}
          <Button
            onClick={handleSubmit}
            disabled={isProcessing || !formData.name || !formData.email || !formData.address || (paymentMethod.type === 'crypto' && (!selectedPayment || !walletConnection)) || (paymentMethod.type === 'card' && !paymentMethod.cardDetails)}
            className="w-full bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)] disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessing ? 'Elaborazione...' : `Ordina - €${(paymentMethod.type === 'crypto' && paymentDetails ? paymentDetails.finalAmount : state.total).toFixed(2)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
