import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import type { Menu, Extra } from '@shared/schema';

interface AddToCartModalProps {
  item: Menu | null;
  extras: Extra[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToCartModal({ item, extras, isOpen, onClose }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedExtras([]);
    }
  }, [isOpen]);

  if (!item) return null;

  const basePrice = parseFloat(item.price);
  const extrasTotal = selectedExtras.reduce((sum, extra) => sum + parseFloat(extra.price), 0);
  const totalPrice = (basePrice + extrasTotal) * quantity;

  const handleExtraToggle = (extra: Extra, checked: boolean) => {
    if (checked) {
      setSelectedExtras([...selectedExtras, extra]);
    } else {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    }
  };

  const handleAddToCart = () => {
    addItem(item, quantity, selectedExtras);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <img 
              src={item.image_url} 
              alt={item.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          <p className="text-gray-600">{item.description}</p>

          {/* Quantity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Extras Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Extras
            </label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {extras.map((extra) => (
                <div key={extra.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`extra-${extra.id}`}
                      checked={selectedExtras.some(e => e.id === extra.id)}
                      onCheckedChange={(checked) => handleExtraToggle(extra, checked as boolean)}
                    />
                    <label 
                      htmlFor={`extra-${extra.id}`}
                      className="text-sm font-medium text-gray-700"
                    >
                      {extra.name}
                    </label>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    +${parseFloat(extra.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price and Add Button */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-[hsl(142,71%,45%)]">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]"
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
