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
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Order Updated",
        description: "Order status has been successfully updated.",
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
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders Control Center</h1>
          <p className="text-gray-600 mt-2">Manage all Best Sicily Bottega orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 md:mb-8">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <Truck className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <Check className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{completedOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center">
                <CreditCard className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                <div className="ml-3 md:ml-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-900">
                    €{orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto md:h-10">
            <TabsTrigger value="pending" className="mb-1 md:mb-0">
              Pending Orders ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="mb-1 md:mb-0">
              In Progress ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Orders to Confirm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[80px]">ID</TableHead>
                        <TableHead className="min-w-[120px]">Customer</TableHead>
                        <TableHead className="min-w-[80px]">Total</TableHead>
                        <TableHead className="min-w-[100px]">Payment</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
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
                            {new Date(order.created_at || '').toLocaleDateString('en-US')}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2">
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Orders in Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Actions</TableHead>
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
                            <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-2">
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
                                  Prepare
                                </Button>
                              )}
                              {order.status === 'preparing' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, 'ready')}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Ready
                                </Button>
                              )}
                              {order.status === 'ready' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStatusUpdate(order.id, 'delivered')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Delivered
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
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
                            {new Date(order.created_at || '').toLocaleDateString('en-US')}
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.delivery_address}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold mb-2">Ordered Items</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {parseMenuItems(selectedOrder.menu_items).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b last:border-0">
                        <span>{item.menuItem?.name || 'Product'} x{item.quantity}</span>
                        <span>€{(item.totalPrice || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Method:</strong> {selectedOrder.payment_method}</p>
                    <p><strong>Total:</strong> {formatAmount(selectedOrder.total_amount)}</p>
                    {selectedOrder.discount_applied && parseFloat(selectedOrder.discount_applied) > 0 && (
                      <p><strong>Discount Applied:</strong> €{parseFloat(selectedOrder.discount_applied).toFixed(2)}</p>
                    )}
                    {selectedOrder.transaction_hash && (
                      <p><strong>Transaction ID:</strong> {selectedOrder.transaction_hash}</p>
                    )}
                    {selectedOrder.card_last4 && (
                      <p><strong>Card:</strong> **** **** **** {selectedOrder.card_last4} ({selectedOrder.card_brand})</p>
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