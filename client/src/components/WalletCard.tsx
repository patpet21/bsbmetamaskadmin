import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Copy, LogOut, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import { PRDX_TOKEN, USDC_TOKEN } from "@/lib/crypto";

interface WalletCardProps {
  walletAddress: string;
  onDisconnect: () => void;
  onConnect: () => void;
}

export default function WalletCard({ walletAddress, onDisconnect, onConnect }: WalletCardProps) {
  const { toast } = useToast();
  const [balances, setBalances] = useState<{ prdx: string; usdc: string; eth: string }>({
    prdx: "0.00",
    usdc: "0.00", 
    eth: "0.00"
  });
  const [loading, setLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Indirizzo copiato!",
      description: "L'indirizzo del wallet è stato copiato negli appunti.",
    });
  };

  const loadBalances = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get ETH balance
      const ethBalance = await provider.getBalance(walletAddress);
      const ethFormatted = ethers.formatEther(ethBalance);
      
      // Get PRDX balance
      const prdxContract = new ethers.Contract(PRDX_TOKEN.address, [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ], provider);
      const prdxBalance = await prdxContract.balanceOf(walletAddress);
      const prdxFormatted = ethers.formatUnits(prdxBalance, PRDX_TOKEN.decimals);
      
      // Get USDC balance
      const usdcContract = new ethers.Contract(USDC_TOKEN.address, [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ], provider);
      const usdcBalance = await usdcContract.balanceOf(walletAddress);
      const usdcFormatted = ethers.formatUnits(usdcBalance, USDC_TOKEN.decimals);
      
      setBalances({
        eth: parseFloat(ethFormatted).toFixed(4),
        prdx: parseFloat(prdxFormatted).toFixed(2),
        usdc: parseFloat(usdcFormatted).toFixed(2)
      });
      
    } catch (error) {
      console.error("Error loading balances:", error);
      toast({
        title: "Errore nel caricamento",
        description: "Impossibile caricare i saldi del wallet.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      loadBalances();
    }
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Wallet className="h-12 w-12 mx-auto text-gray-400" />
          <CardTitle>Connetti Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={onConnect} className="w-full">
            Connetti MetaMask
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-lg">Il Mio Wallet</CardTitle>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Connesso
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Indirizzo</p>
            <p className="font-mono text-lg">{formatAddress(walletAddress)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={copyAddress}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* Balances */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Saldi</h3>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadBalances}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded">
              <span className="text-sm font-medium">ETH</span>
              <span className="font-mono">
                {showBalance ? balances.eth : "•••••"} ETH
              </span>
            </div>
            
            <div className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded">
              <span className="text-sm font-medium">PRDX</span>
              <span className="font-mono">
                {showBalance ? balances.prdx : "•••••"} PRDX
              </span>
            </div>
            
            <div className="flex justify-between p-2 bg-white dark:bg-gray-800 rounded">
              <span className="text-sm font-medium">USDC</span>
              <span className="font-mono">
                {showBalance ? balances.usdc : "•••••"} USDC
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onConnect} className="flex-1">
            Cambia Account
          </Button>
          <Button variant="outline" onClick={onDisconnect} className="flex-1">
            <LogOut className="h-4 w-4 mr-2" />
            Disconnetti
          </Button>
        </div>

        {/* Discount Notice */}
        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 text-center">
            🎉 <strong>10% di sconto</strong> sui pagamenti crypto!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}