"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useCreateOrder, useInitiatePayment } from "@/lib/queries/useOrders";
import { useSnap } from "@/hooks/useSnap";
import {
  CreateOrderPayload,
  DeliverySchedule,
  PaymentMethod,
  Order,
} from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  MapPin,
  CheckCircle2,
  Loader2,
  CreditCard,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Redirect ke WhatsApp owner setelah pembayaran Midtrans sukses.
 * Format pesan: nama, nomor order, total, jadwal, alamat.
 */
function redirectToOwnerWhatsApp(order: Order) {
  const ownerPhone = process.env.NEXT_PUBLIC_OWNER_WHATSAPP ?? "";
  if (!ownerPhone) {
    console.warn("NEXT_PUBLIC_OWNER_WHATSAPP belum di-set di .env.local");
    return;
  }

  const total = parseFloat(order.total_amount).toLocaleString("id-ID");
  const scheduleMap: Record<string, string> = {
    pagi: "Pagi (06:00–09:00)",
    siang: "Siang (11:00–14:00)",
    sore: "Sore (17:00–20:00)",
  };

  const message = [
    `Halo, saya sudah melakukan pembayaran untuk pesanan berikut:`,
    ``,
    `📋 *Nomor Order:* ${order.order_number}`,
    `👤 *Nama:* ${order.customer_name}`,
    `📱 *Telepon:* ${order.customer_phone}`,
    `📍 *Alamat:* ${order.customer_address}`,
    `🕐 *Jadwal Kirim:* ${scheduleMap[order.delivery_schedule] ?? order.delivery_schedule}`,
    `💰 *Total:* Rp ${total}`,
    ``,
    `Pembayaran telah berhasil melalui Midtrans. Mohon konfirmasi pesanan saya. Terima kasih! 🙏`,
  ].join("\n");

  const encoded = encodeURIComponent(message);
  // Buka di tab baru agar tidak mengganggu SPA
  window.open(`https://wa.me/${ownerPhone}?text=${encoded}`, "_blank");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const geolocation = useGeolocation();
  const createOrderMutation = useCreateOrder();
  const initiatePaymentMutation = useInitiatePayment();
  const { openSnap } = useSnap();

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    delivery_schedule: "siang" as DeliverySchedule,
    payment_method: PaymentMethod.MIDTRANS, // default Midtrans karena satu-satunya
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (cart.items.length === 0) router.push("/cart");
  }, [cart.items.length, router]);

  // ─── Validation ─────────────────────────────────────────────────────────────

  const validateForm = (): boolean => {
    const e: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      e.customer_name = "Nama wajib diisi";
    } else if (formData.customer_name.length < 3) {
      e.customer_name = "Nama minimal 3 karakter";
    }

    if (!formData.customer_phone.trim()) {
      e.customer_phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.customer_phone)) {
      e.customer_phone = "Format nomor telepon tidak valid";
    }

    if (!formData.customer_address.trim()) {
      e.customer_address = "Alamat wajib diisi";
    } else if (formData.customer_address.length < 10) {
      e.customer_address = "Alamat minimal 10 karakter";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Harap perbaiki form terlebih dahulu");
      return;
    }

    const orderPayload: CreateOrderPayload = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      customer_address: formData.customer_address,
      latitude: geolocation.latitude ?? undefined,
      longitude: geolocation.longitude ?? undefined,
      delivery_schedule: formData.delivery_schedule,
      payment_method: formData.payment_method,
      items: cart.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    };

    // Step 1: Buat order → stock otomatis berkurang di backend
    createOrderMutation.mutate(orderPayload, {
      onSuccess: async (order) => {
        cart.clearCart();

        try {
          // Step 2: Minta snap token dari backend
          const paymentData = await initiatePaymentMutation.mutateAsync(
            order.id,
          );

          // Step 3: Buka Snap popup
          openSnap(paymentData.snap_token, {
            onSuccess: () => {
              toast.success("Pembayaran berhasil!");
              // Step 4: Redirect WA owner setelah bayar sukses
              redirectToOwnerWhatsApp(order);
              // Step 5: Arahkan ke payment-status untuk konfirmasi visual
              router.push(`/payment-status/${order.id}?status=success`);
            },
            onPending: () => {
              toast("Pembayaran pending. Selesaikan pembayaran Anda.", {
                icon: "⏳",
              });
              router.push(`/payment-status/${order.id}?status=pending`);
            },
            onError: () => {
              toast.error(
                "Pembayaran gagal. Silakan coba lagi dari halaman order.",
              );
              router.push(`/order-confirmation/${order.order_number}`);
            },
            onClose: () => {
              // User tutup popup → order sudah ada, bisa bayar lagi nanti
              toast(
                "Pembayaran ditutup. Selesaikan pembayaran dari halaman order.",
                {
                  icon: "ℹ️",
                  duration: 4000,
                },
              );
              router.push(`/order-confirmation/${order.order_number}`);
            },
          });
        } catch {
          // Gagal initiate payment — order sudah dibuat, arahkan ke confirmation
          toast.error(
            "Gagal memulai pembayaran. Silakan coba dari halaman order.",
          );
          router.push(`/order-confirmation/${order.order_number}`);
        }
      },
      onError: (error: any) => {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Gagal membuat order. Silakan coba lagi.";
        toast.error(msg);
      },
    });
  };

  if (cart.items.length === 0) return null;

  const isCreatingOrder = createOrderMutation.isPending;
  const isInitiatingPayment = initiatePaymentMutation.isPending;
  const isLoading = isCreatingOrder || isInitiatingPayment;

  const submitLabel = isInitiatingPayment
    ? "Mempersiapkan pembayaran..."
    : isCreatingOrder
      ? "Membuat order..."
      : "Lanjut ke Pembayaran";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="customer_name"
                  className="text-sm font-semibold"
                >
                  Nama *
                </Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  type="text"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
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
                  Nomor Telepon *
                </Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  type="number"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="Contoh: 08123456789"
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
                  Alamat Lengkap *
                </Label>
                <Textarea
                  id="customer_address"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Jl. Contoh No. 1, Kelurahan, Kecamatan, Kota"
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

              {/* Geolocation — optional */}
              <div className="pt-2 space-y-2">
                <Button
                  type="button"
                  onClick={geolocation.requestLocation}
                  disabled={geolocation.loading || isLoading}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {geolocation.loading
                    ? "Mendapatkan lokasi..."
                    : "Gunakan Lokasi Saya (Opsional)"}
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
                      Lokasi didapatkan: {geolocation.latitude.toFixed(5)},{" "}
                      {geolocation.longitude.toFixed(5)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.delivery_schedule}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    delivery_schedule: v as DeliverySchedule,
                  }))
                }
                disabled={isLoading}
              >
                <div className="space-y-3">
                  {[
                    { value: "pagi", label: "Pagi", time: "06:00 – 09:00" },
                    { value: "siang", label: "Siang", time: "11:00 – 14:00" },
                    { value: "sore", label: "Sore", time: "17:00 – 20:00" },
                  ].map((s) => (
                    <div
                      key={s.value}
                      className="flex items-center gap-3 p-3 border border-input rounded-lg cursor-pointer hover:bg-accent transition"
                    >
                      <RadioGroupItem
                        value={s.value}
                        id={`schedule-${s.value}`}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor={`schedule-${s.value}`}
                        className="flex-1 cursor-pointer"
                      >
                        <span className="font-semibold">{s.label}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({s.time})
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment — hanya Midtrans */}
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-blue-200 bg-blue-50">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Pembayaran dilakukan secara online melalui{" "}
                  <strong>Midtrans</strong>. Mendukung GoPay, DANA, OVO,
                  ShopeePay, Transfer Bank, Kartu Kredit, dan lainnya. Halaman
                  pembayaran akan terbuka setelah order dibuat.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/cart">Kembali ke Cart</Link>
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Ringkasan Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3 pb-4 border-b border-border">
                {cart.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {item.product.name}{" "}
                      <span className="font-semibold text-foreground">
                        ×{item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold">
                      Rp{" "}
                      {(
                        parseFloat(item.product.price) * item.quantity
                      ).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">
                  Rp {cart.getTotalPrice().toLocaleString("id-ID")}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Setelah bayar, Anda akan diarahkan ke WhatsApp untuk konfirmasi
                ke pemilik toko.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
