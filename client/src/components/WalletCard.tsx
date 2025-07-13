import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react";

interface WalletCardProps {
  walletAddress: string;
  onDisconnect: () => void;
  onConnect: () => void;
}

export default function WalletCard({ walletAddress, onDisconnect, onConnect }: WalletCardProps) {
  const handleDisconnect = () => {
    // Clear wallet state
    localStorage.removeItem('walletConnected');
    window.location.reload();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">MetaMask Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {walletAddress ? (
          <>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Connected Address</p>
                  <p className="text-xs text-gray-500 font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigator.clipboard.writeText(walletAddress)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PRDX Balance</span>
                <span className="text-sm font-mono">1,250.50</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">USDC Balance</span>
                <span className="text-sm font-mono">89.25</span>
              </div>
            </div>

            <Separator />

            <div className="flex space-x-2">
              <Button
                onClick={handleDisconnect}
                variant="outline"
                className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
              <Button
                onClick={() => window.open(`https://basescan.org/address/${walletAddress}`, '_blank')}
                variant="outline"
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">No Wallet Connected</p>
              <p className="text-xs text-gray-500">Connect MetaMask to pay with crypto and get discounts</p>
            </div>
            <Button 
              onClick={onConnect}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect MetaMask
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}