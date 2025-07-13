import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Eye, Clock, CreditCard, Wallet, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Order } from "@shared/schema";

export default function OrdersAdmin() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Ordine aggiornato",
        description: "Lo stato dell'ordine è stato modificato con successo.",
      });
    },
  });

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateOrderMutation.mutate({ id: orderId, status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentIcon = (paymentMethod: string) => {
    return paymentMethod === 'crypto' ? 
      <Wallet className="h-4 w-4" /> : 
      <CreditCard className="h-4 w-4" />;
  };

  const formatAmount = (amount: string) => {
    return `€${parseFloat(amount).toFixed(2)}`;
  };

  const parseMenuItems = (menuItemsStr: string) => {
    try {
      return JSON.parse(menuItemsStr);
    } catch {
      return [];
    }
  };

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => ['confirmed', 'preparing', 'ready'].includes(order.status || ''));
  const completedOrders = orders.filter(order => ['delivered', 'cancelled'].includes(order.status || ''));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Centro Controllo Ordini</h1>
          <p className="text-gray-600 mt-2">Gestisci tutti gli ordini di Best Sicily Bottega</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ordini Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Lavorazione</p>
                  <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completati Oggi</p>
                  <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Totale Vendite</p>
                  <p className="text-2xl font-bold text-gray-900">
                    €{orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              Ordini da Confermare ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              In Lavorazione ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completati ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Ordini da Confermare</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Totale</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>{formatAmount(order.total_amount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getPaymentIcon(order.payment_method || 'card')}
                            <span className="capitalize">{order.payment_method}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at || '').toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Ordini in Lavorazione</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Totale</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status || '')}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatAmount(order.total_amount)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'preparing')}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Prepara
                              </Button>
                            )}
                            {order.status === 'preparing' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'ready')}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Pronto
                              </Button>
                            )}
                            {order.status === 'ready' && (
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Consegnato
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Ordini Completati</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Totale</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status || '')}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatAmount(order.total_amount)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at || '').toLocaleDateString('it-IT')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Dettagli Ordine #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-2">Informazioni Cliente</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Nome:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>Telefono:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>Indirizzo:</strong> {selectedOrder.delivery_address}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-2">Prodotti Ordinati</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {parseMenuItems(selectedOrder.menu_items).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b last:border-0">
                        <span>{item.menuItem?.name || 'Prodotto'} x{item.quantity}</span>
                        <span>€{(item.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-semibold mb-2">Informazioni Pagamento</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Metodo:</strong> {selectedOrder.payment_method}</p>
                    <p><strong>Totale:</strong> {formatAmount(selectedOrder.total_amount)}</p>
                    {selectedOrder.discount_applied && parseFloat(selectedOrder.discount_applied) > 0 && (
                      <p><strong>Sconto Applicato:</strong> €{parseFloat(selectedOrder.discount_applied).toFixed(2)}</p>
                    )}
                    {selectedOrder.transaction_hash && (
                      <p><strong>Transaction ID:</strong> {selectedOrder.transaction_hash}</p>
                    )}
                    {selectedOrder.card_last4 && (
                      <p><strong>Carta:</strong> **** **** **** {selectedOrder.card_last4} ({selectedOrder.card_brand})</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}