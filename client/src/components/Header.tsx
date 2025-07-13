import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ShoppingCart, Wallet, Settings } from 'lucide-react';
import { Link } from 'wouter';
import WalletCard from './WalletCard';

interface HeaderProps {
  onOpenCart: () => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress?: string;
}

const onDisconnectWallet = () => {
  // Disconnection logic handled by wallet card
};

export default function Header({ onOpenCart, onConnectWallet, isWalletConnected, walletAddress }: HeaderProps) {
  const { state } = useCart();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Best Sicily Bottega</h1>
            <span className="ml-2 text-sm text-gray-500">Authentic Italian Cuisine</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button
                variant="outline"
                className="text-gray-700 hover:bg-gray-100"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
            <Button
              onClick={onOpenCart}
              className="relative bg-orange-500 text-white hover:bg-orange-600"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrello ({state.totalItems})
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="text-gray-700 hover:bg-gray-100"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isWalletConnected ? `${walletAddress?.slice(0, 6)}...${walletAddress?.slice(-4)}` : "Wallet"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" side="bottom" align="end">
                <WalletCard 
                  walletAddress={walletAddress || ""}
                  onConnect={onConnectWallet}
                  onDisconnect={onDisconnectWallet}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </header>
  );
}
