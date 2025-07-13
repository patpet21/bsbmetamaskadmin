import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Wallet } from "lucide-react";

export interface PaymentMethod {
  type: "crypto" | "card";
  cardDetails?: {
    number: string;
    expiry: string;
    cvc: string;
    name: string;
  };
}

interface PaymentMethodSelectorProps {
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod;
}

export default function PaymentMethodSelector({ onPaymentMethodSelect, selectedMethod }: PaymentMethodSelectorProps) {
  const [paymentType, setPaymentType] = useState<"crypto" | "card">(selectedMethod?.type || "crypto");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  const handlePaymentTypeChange = (type: "crypto" | "card") => {
    setPaymentType(type);
    if (type === "crypto") {
      onPaymentMethodSelect({ type: "crypto" });
    }
  };

  const handleCardDetailsChange = (field: keyof typeof cardDetails, value: string) => {
    const newDetails = { ...cardDetails, [field]: value };
    setCardDetails(newDetails);
    
    // Check if all required fields are filled
    if (newDetails.number && newDetails.expiry && newDetails.cvc && newDetails.name) {
      onPaymentMethodSelect({
        type: "card",
        cardDetails: newDetails
      });
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className={`cursor-pointer transition-all ${paymentType === "crypto" ? "ring-2 ring-orange-500" : ""}`} onClick={() => handlePaymentTypeChange("crypto")}>
          <CardHeader className="text-center pb-2">
            <Wallet className="h-8 w-8 mx-auto text-orange-500" />
            <CardTitle className="text-sm">Crypto</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-xs text-gray-600">
            <p>Paga con PRDX o USDC</p>
            <p className="text-green-600 font-medium">10% di sconto!</p>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all ${paymentType === "card" ? "ring-2 ring-blue-500" : ""}`} onClick={() => handlePaymentTypeChange("card")}>
          <CardHeader className="text-center pb-2">
            <CreditCard className="h-8 w-8 mx-auto text-blue-500" />
            <CardTitle className="text-sm">Carta</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-xs text-gray-600">
            <p>Visa, Mastercard, etc.</p>
            <p>Sicuro e veloce</p>
          </CardContent>
        </Card>
      </div>

      {paymentType === "card" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dettagli Carta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cardName">Nome sulla carta</Label>
              <Input
                id="cardName"
                placeholder="Mario Rossi"
                value={cardDetails.name}
                onChange={(e) => handleCardDetailsChange("name", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Numero carta</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => handleCardDetailsChange("number", formatCardNumber(e.target.value))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Scadenza</Label>
                <Input
                  id="expiry"
                  placeholder="MM/AA"
                  value={cardDetails.expiry}
                  onChange={(e) => handleCardDetailsChange("expiry", formatExpiry(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={(e) => handleCardDetailsChange("cvc", e.target.value.replace(/\D/g, '').slice(0, 3))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}