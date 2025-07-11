import { Button } from '@/components/ui/button';
import type { Category } from '@shared/schema';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4">
          <Button
            variant="ghost"
            onClick={() => onCategoryChange('all')}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${
              activeCategory === 'all'
                ? 'text-[hsl(142,71%,45%)] border-b-2 border-[hsl(142,71%,45%)]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ⭐ All Items
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => onCategoryChange(category.id.toString())}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium ${
                activeCategory === category.id.toString()
                  ? 'text-[hsl(142,71%,45%)] border-b-2 border-[hsl(142,71%,45%)]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>
      </div>
    </nav>
  );
}
