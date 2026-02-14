"use client";

import { useState } from "react";
import {
  useAdminOrders,
  useApproveOrderAdmin,
  useRejectOrderAdmin,
  useUpdateOrderStatusAdmin,
} from "@/lib/queries/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Order } from "@/types";
import toast from "react-hot-toast";

const statusColors: Record<string, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  SHIPPED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  DELIVERED:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useAdminOrders();
  const approveOrder = useApproveOrderAdmin();
  const rejectOrder = useRejectOrderAdmin();
  const updateStatus = useUpdateOrderStatusAdmin();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleApprove = async (id: string) => {
    try {
      await approveOrder.mutateAsync(id);
      toast.success("Order approved successfully");
      setIsDetailOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to approve order",
      );
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectOrder.mutateAsync(id);
      toast.success("Order rejected");
      setIsDetailOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reject order",
      );
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId: id, status });
      toast.success("Order status updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update status",
      );
    }
  };

  const viewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 mb-4" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load orders</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders?.filter((o: Order) => o.status === "PENDING").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders?.filter((o: Order) => o.status === "APPROVED").length ||
                0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({orders?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      Rp{" "}
                      {parseFloat(order.total_amount).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {order.payment_method}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(order.id)}
                              disabled={approveOrder.isPending}
                            >
                              {approveOrder.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(order.id)}
                              disabled={rejectOrder.isPending}
                            >
                              {rejectOrder.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                        {order.status === "APPROVED" && (
                          <Select
                            onValueChange={(value) =>
                              handleStatusChange(order.id, value)
                            }
                            disabled={updateStatus.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SHIPPED">Shipped</SelectItem>
                              <SelectItem value="DELIVERED">
                                Delivered
                              </SelectItem>
                            </SelectContent>
                          </Select>
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

      {/* Order Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Name:</strong> {selectedOrder.customer_name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedOrder.customer_phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedOrder.customer_address}
                  </p>
                  <p>
                    <strong>Delivery:</strong> {selectedOrder.delivery_schedule}
                  </p>
                  <p>
                    <strong>Payment:</strong> {selectedOrder.payment_method}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder?.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 border rounded"
                    >
                      <div>
                        <p className="font-medium">{item?.product?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × Rp{" "}
                          {parseFloat(
                            item.price_at_time.toString(),
                          ).toLocaleString("id-ID")}
                        </p>
                      </div>
                      <p className="font-semibold">
                        Rp{" "}
                        {(
                          item.quantity *
                          parseFloat(item.price_at_time.toString())
                        ).toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    Rp{" "}
                    {parseFloat(selectedOrder.total_amount).toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
