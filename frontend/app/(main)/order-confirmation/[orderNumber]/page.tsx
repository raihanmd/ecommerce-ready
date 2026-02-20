"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOrderByNumber, useInitiatePayment } from "@/lib/queries/useOrders";
import { useSnap } from "@/hooks/useSnap";
import { PaymentMethod, PaymentStatus } from "@/types";
import { FaCheckCircle } from "react-icons/fa";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const deliveryScheduleLabels: Record<string, string> = {
  pagi: "Pagi (06:00 - 09:00)",
  siang: "Siang (11:00 - 14:00)",
  sore: "Sore (17:00 - 20:00)",
};

const paymentMethodLabels: Record<string, string> = {
  cod: "Cash on Delivery",
  transfer: "Transfer Bank",
  ewallet: "E-Wallet",
  midtrans: "Online Payment (Midtrans)",
};

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();
  const { openSnap } = useSnap();
  const initiatePaymentMutation = useInitiatePayment();
  const [paymentError, setPaymentError] = useState("");

  const { data: order, isLoading } = useOrderByNumber(orderNumber);

  // Cek apakah perlu tampilkan tombol bayar Midtrans
  const isMidtransOrder = order?.payment_method === PaymentMethod.MIDTRANS;
  const paymentStatus = order?.payment?.status;
  const isPaymentPending =
    !paymentStatus || paymentStatus === PaymentStatus.PENDING;
  const isPaymentSettled =
    paymentStatus === PaymentStatus.SETTLEMENT ||
    paymentStatus === PaymentStatus.CAPTURE;
  const showPayButton = isMidtransOrder && isPaymentPending;

  const handlePayNow = async () => {
    if (!order) return;
    setPaymentError("");

    try {
      const paymentData = await initiatePaymentMutation.mutateAsync(order.id);

      openSnap(paymentData.snap_token, {
        onSuccess: (result) => {
          toast.success("Pembayaran berhasil!");
          router.push(
            `/payment-status/${order.id}?status=success&ref=${result.order_id}`,
          );
        },
        onPending: (result) => {
          toast("Menunggu pembayaran...", { icon: "⏳" });
          router.push(
            `/payment-status/${order.id}?status=pending&ref=${result.order_id}`,
          );
        },
        onError: () => {
          setPaymentError("Pembayaran gagal. Silakan coba lagi.");
          toast.error("Pembayaran gagal.");
        },
        onClose: () => {
          toast("Pembayaran ditutup. Klik tombol bayar untuk melanjutkan.", {
            icon: "ℹ️",
          });
        },
      });
    } catch {
      setPaymentError("Gagal memulai pembayaran. Silakan coba lagi.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-gray-600 text-center">Order tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success Message */}
      <div className="text-center mb-12">
        <FaCheckCircle className="text-6xl text-green-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Order Dikonfirmasi!
        </h1>
        <p className="text-xl text-gray-600">Terima kasih atas pesanan Anda</p>
      </div>

      {/* ✅ Banner Midtrans — tampil jika payment_method=midtrans dan belum bayar */}
      {showPayButton && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-amber-800">
                Menunggu Pembayaran
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Order Anda sudah dibuat. Silakan selesaikan pembayaran untuk
                melanjutkan proses.
              </p>
            </div>
          </div>
          {paymentError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{paymentError}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handlePayNow}
            disabled={initiatePaymentMutation.isPending}
            className="w-full gap-2"
            size="lg"
          >
            {initiatePaymentMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mempersiapkan pembayaran...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Bayar Sekarang
              </>
            )}
          </Button>
        </div>
      )}

      {/* Banner jika sudah lunas */}
      {isMidtransOrder && isPaymentSettled && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <FaCheckCircle className="text-green-600 shrink-0" />
          <p className="text-green-800 font-semibold">
            Pembayaran telah berhasil diterima
          </p>
        </div>
      )}

      {/* Order Details */}
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Informasi Order
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Nomor Order</p>
                <p className="text-lg font-mono font-semibold text-gray-900">
                  {order.order_number}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Tanggal Order</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(order.created_at).toLocaleDateString("id-ID")} pukul{" "}
                  {new Date(order.created_at).toLocaleTimeString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-semibold">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Total Pembayaran
            </h3>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              Rp {parseFloat(order.total_amount).toLocaleString("id-ID")}
            </p>
            <div className="bg-blue-50 p-4 rounded text-sm text-gray-600">
              <p>
                <strong>Status:</strong>{" "}
                {isMidtransOrder
                  ? isPaymentSettled
                    ? "Pembayaran diterima. Order sedang diproses."
                    : "Selesaikan pembayaran untuk melanjutkan proses order."
                  : "Order Anda menunggu persetujuan pemilik toko."}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Informasi Pengiriman
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Nama</p>
              <p className="font-semibold text-gray-900">
                {order.customer_name}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Nomor Telepon</p>
              <p className="font-semibold text-gray-900">
                {order.customer_phone}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600 text-sm mb-1">Alamat</p>
              <p className="font-semibold text-gray-900">
                {order.customer_address}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Jadwal Pengiriman</p>
              <p className="font-semibold text-gray-900">
                {deliveryScheduleLabels[order.delivery_schedule]}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Metode Pembayaran</p>
              <p className="font-semibold text-gray-900">
                {paymentMethodLabels[order.payment_method]}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
            Item Pesanan
          </h3>
          <div className="space-y-3">
            {order?.order_items?.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item?.product?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × Rp{" "}
                    {parseFloat(item.price_at_time).toLocaleString("id-ID")}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  Rp{" "}
                  {(
                    parseFloat(item.price_at_time) * item.quantity
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between text-lg font-bold text-gray-900 pt-4 border-t border-gray-200">
          <span>Total</span>
          <span className="text-blue-600">
            Rp {parseFloat(order.total_amount).toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href="/"
          className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition text-center font-semibold"
        >
          Lanjut Belanja
        </Link>
      </div>

      {/* Next Steps */}
      <div className="mt-12 pt-12 border-t border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Langkah Selanjutnya
        </h3>
        <div className="space-y-4 text-gray-600">
          {[
            isMidtransOrder
              ? "Selesaikan pembayaran melalui Midtrans"
              : "Order Anda menunggu persetujuan pemilik toko",
            "Anda akan mendapat notifikasi setelah order disetujui",
            "Item akan dikirim sesuai jadwal pengiriman yang dipilih",
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
