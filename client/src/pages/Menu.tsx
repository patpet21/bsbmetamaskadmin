import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import CategoryTabs from '../components/CategoryTabs';
import MenuItemCard from '../components/MenuItemCard';
import AddToCartModal from '../components/AddToCartModal';
import CartSidebar from '../components/CartSidebar';
import CheckoutModal from '../components/CheckoutModal';
import OrderConfirmationModal from '../components/OrderConfirmationModal';
import { connectWallet, type WalletConnection } from '../lib/crypto';
import { useToast } from '@/hooks/use-toast';
import type { Menu, Category, Extra } from '@shared/schema';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Menu | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderConfirmationOpen, setIsOrderConfirmationOpen] = useState(false);
  const [walletConnection, setWalletConnection] = useState<WalletConnection | null>(null);
  const [orderConfirmation, setOrderConfirmation] = useState<{
    orderId: string;
    txHash: string;
    total: number;
    discountApplied?: number;
  } | null>(null);
  
  const { toast } = useToast();

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<Menu[]>({
    queryKey: ['/api/menu', activeCategory],
    queryFn: async () => {
      const response = await fetch(`/api/menu?category=${activeCategory}`);
      if (!response.ok) throw new Error('Failed to fetch menu items');
      return response.json();
    },
  });

  const { data: extras = [] } = useQuery<Extra[]>({
    queryKey: ['/api/extras'],
  });

  const handleConnectWallet = async () => {
    try {
      const connection = await connectWallet();
      setWalletConnection(connection);
      toast({
        title: "Wallet Connected",
        description: "Your MetaMask wallet has been connected successfully.",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleOrderComplete = (orderId: string, txHash: string, total: number, discountApplied?: number) => {
    setOrderConfirmation({
      orderId,
      txHash,
      total,
      discountApplied,
    });
    setIsCheckoutOpen(false);
    setIsOrderConfirmationOpen(true);
  };

  const filteredMenuItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_id === parseInt(activeCategory));

  const groupedItems = categories.reduce((acc, category) => {
    acc[category.name] = filteredMenuItems.filter(item => item.category_id === category.id);
    return acc;
  }, {} as Record<string, Menu[]>);

  if (categoriesLoading || menuLoading) {
    return (
      <div className="min-h-screen bg-[hsl(60,4.8%,95.9%)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[hsl(142,71%,45%)]"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(60,4.8%,95.9%)]">
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onConnectWallet={handleConnectWallet}
        isWalletConnected={!!walletConnection}
        walletAddress={walletConnection?.address}
      />
      
      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div 
            className="relative h-64 rounded-2xl overflow-hidden shadow-lg"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 flex items-center justify-center h-full text-center">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">Authentic Sicilian Flavors</h2>
                <p className="text-xl text-white">Fresh ingredients, traditional recipes, delivered to your door</p>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Categories */}
        <div>
          {activeCategory === 'all' ? (
            // Show all categories
            categories.map(category => (
              <section key={category.id} className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                  {category.icon} <span className="ml-3">{category.name}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedItems[category.name]?.map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={setSelectedItem}
                    />
                  ))}
                </div>
              </section>
            ))
          ) : (
            // Show single category
            <section>
              {(() => {
                const category = categories.find(c => c.id === parseInt(activeCategory));
                return category ? (
                  <>
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                      {category.icon} <span className="ml-3">{category.name}</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredMenuItems.map(item => (
                        <MenuItemCard
                          key={item.id}
                          item={item}
                          onAddToCart={setSelectedItem}
                        />
                      ))}
                    </div>
                  </>
                ) : null;
              })()}
            </section>
          )}
        </div>
      </main>

      {/* Modals */}
      <AddToCartModal
        item={selectedItem}
        extras={extras}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
      
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderComplete={handleOrderComplete}
      />
      
      {orderConfirmation && (
        <OrderConfirmationModal
          isOpen={isOrderConfirmationOpen}
          onClose={() => {
            setIsOrderConfirmationOpen(false);
            setOrderConfirmation(null);
          }}
          orderId={orderConfirmation.orderId}
          txHash={orderConfirmation.txHash}
          total={orderConfirmation.total}
          discountApplied={orderConfirmation.discountApplied}
        />
      )}
    </div>
  );
}
