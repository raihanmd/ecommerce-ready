"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCreateOrder } from "@/lib/queries/useOrders";
import { CreateOrderPayload, DeliverySchedule, PaymentMethod } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MapPin, CheckCircle2, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const geolocation = useGeolocation();
  const createOrderMutation = useCreateOrder();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    delivery_schedule: "siang" as DeliverySchedule,
    payment_method: "cod" as PaymentMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.push("/cart");
    }
  }, [cart.items.length, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Name is required";
    } else if (formData.customer_name.length < 3) {
      newErrors.customer_name = "Name must be at least 3 characters";
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "Phone number is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.customer_phone)) {
      newErrors.customer_phone = "Invalid phone number format";
    }

    if (!formData.customer_address.trim()) {
      newErrors.customer_address = "Address is required";
    } else if (formData.customer_address.length < 10) {
      newErrors.customer_address = "Address must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRequestGeolocation = () => {
    geolocation.requestLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const orderPayload: CreateOrderPayload = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      latitude: geolocation.latitude || undefined,
      longitude: geolocation.longitude || undefined,
      delivery_schedule: formData.delivery_schedule,
      payment_method: formData.payment_method,
      items: cart.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    };

    createOrderMutation.mutate(orderPayload, {
      onSuccess: (data) => {
        const orderNumber = data.order_number;
        cart.clearCart();
        toast.success("Order placed successfully!");
        router.push(`/order-confirmation/${orderNumber}`);
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to create order. Please try again.";
        toast.error(errorMessage);
        console.error("Failed to create order:", error);
      },
    });
  };

  if (cart.items.length === 0) {
    return null;
  }

  const isLoading = createOrderMutation.isPending;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="customer_name"
                  className="text-sm font-semibold"
                >
                  Name *
                </Label>
                <Input
                  id="customer_name"
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  disabled={isLoading}
                  className={errors.customer_name ? "border-destructive" : ""}
                />
                {errors.customer_name && (
                  <p className="text-destructive text-sm">
                    {errors.customer_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="customer_phone"
                  className="text-sm font-semibold"
                >
                  Phone Number *
                </Label>
                <Input
                  id="customer_phone"
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  disabled={isLoading}
                  className={errors.customer_phone ? "border-destructive" : ""}
                />
                {errors.customer_phone && (
                  <p className="text-destructive text-sm">
                    {errors.customer_phone}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="customer_address"
                  className="text-sm font-semibold"
                >
                  Address *
                </Label>
                <Textarea
                  id="customer_address"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Enter your full address"
                  disabled={isLoading}
                  className={
                    errors.customer_address ? "border-destructive" : ""
                  }
                />
                {errors.customer_address && (
                  <p className="text-destructive text-sm">
                    {errors.customer_address}
                  </p>
                )}
              </div>

              {/* Geolocation */}
              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  onClick={handleRequestGeolocation}
                  disabled={geolocation.loading || isLoading}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {geolocation.loading
                    ? "Getting location..."
                    : "Get My Location"}
                </Button>
                {geolocation.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{geolocation.error}</AlertDescription>
                  </Alert>
                )}
                {geolocation.latitude && geolocation.longitude && (
                  <Alert className="border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800">
                      Location obtained (Lat: {geolocation.latitude.toFixed(4)},
                      Lng: {geolocation.longitude.toFixed(4)})
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.delivery_schedule}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    delivery_schedule: value as DeliverySchedule,
                  }))
                }
                disabled={isLoading}
              >
                <div className="space-y-3">
                  {[
                    {
                      value: "pagi",
                      label: "Pagi (06:00 - 09:00)",
                      description: "Early morning delivery",
                    },
                    {
                      value: "siang",
                      label: "Siang (11:00 - 14:00)",
                      description: "Midday delivery",
                    },
                    {
                      value: "sore",
                      label: "Sore (17:00 - 20:00)",
                      description: "Evening delivery",
                    },
                  ].map((schedule) => (
                    <div
                      key={schedule.value}
                      className="flex items-start gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-accent transition"
                    >
                      <RadioGroupItem
                        value={schedule.value}
                        id={`schedule-${schedule.value}`}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`schedule-${schedule.value}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-semibold text-foreground">
                          {schedule.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.description}
                        </p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.payment_method}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    payment_method: value as PaymentMethod,
                  }))
                }
                disabled={isLoading}
              >
                <div className="space-y-3">
                  {[
                    {
                      value: "cod",
                      label: "Cash on Delivery",
                      description: "Pay when order arrives",
                    },
                    {
                      value: "transfer",
                      label: "Bank Transfer",
                      description: "Transfer to bank account",
                    },
                    {
                      value: "ewallet",
                      label: "E-Wallet",
                      description: "Pay using e-wallet apps",
                    },
                  ].map((method) => (
                    <div
                      key={method.value}
                      className="flex items-start gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-accent transition"
                    >
                      <RadioGroupItem
                        value={method.value}
                        id={`method-${method.value}`}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`method-${method.value}`}
                        className="flex-1 cursor-pointer"
                      >
                        <p className="font-semibold text-foreground">
                          {method.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/cart">Back to Cart</Link>
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </form>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 pb-6 border-b border-border">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.product.name}{" "}
                      <span className="font-semibold">×{item.quantity}</span>
                    </span>
                    <span className="font-semibold">
                      $
                      {(parseFloat(item.product.price) * item.quantity).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ${cart.getTotalPrice().toFixed(2)}
                </span>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Your order will be pending approval. Once approved, your items
                  will be shipped.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
