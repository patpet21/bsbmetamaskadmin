import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";
import MenuPage from "./pages/Menu";
import AdminPage from "./pages/Admin";
import OrdersAdmin from "./pages/OrdersAdmin";
import NotFound from "@/pages/not-found";
import { WagmiProvider } from 'wagmi';
import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';
import { QueryClient } from '@tanstack/react-query';

const wagmiConfig = createConfig({
  chains: [base],
  connectors: [metaMask()],
  transports: {
    [base.id]: http(),
  },
});

const wagmiQueryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={MenuPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/centro-controllo-sicilia-2025" component={OrdersAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
