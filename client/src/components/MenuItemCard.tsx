import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Menu } from '@shared/schema';

interface MenuItemCardProps {
  item: Menu;
  onAddToCart: (item: Menu) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img 
        src={item.image_url} 
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-[hsl(142,71%,45%)]">
            ${parseFloat(item.price).toFixed(2)}
          </span>
          <Button
            onClick={() => onAddToCart(item)}
            className="bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
