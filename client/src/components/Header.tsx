import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Wallet, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';

interface HeaderProps {
  onOpenCart: () => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress?: string;
}

export default function Header({ onOpenCart, onConnectWallet, isWalletConnected, walletAddress }: HeaderProps) {
  const { state } = useCart();
  const { connect, connectors, error, isLoading } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleWalletConnect = () => {
    if (isConnected) {
      disconnect();
    } else {
      const metaMaskConnector = connectors.find(c => c.id === 'metaMask');
      if (metaMaskConnector) {
        connect({ connector: metaMaskConnector });
      }
    }
  };

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
              className="relative bg-[hsl(142,71%,45%)] text-white hover:bg-[hsl(142,71%,40%)]"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart ({state.totalItems})
            </Button>
            <Button
              onClick={handleWalletConnect}
              variant="outline"
              className="text-gray-700 hover:bg-gray-100"
              disabled={isLoading}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isLoading ? 'Connecting...' : 
               isConnected ? formatAddress(address || '') : 'Connect MetaMask'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
