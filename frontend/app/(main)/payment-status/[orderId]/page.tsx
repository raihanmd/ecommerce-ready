"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { usePaymentStatus } from "@/lib/queries/useOrders";
import { PaymentStatus } from "@/types";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PaymentStatusPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  // snapStatus = hint dari snap callback (untuk UX awal sebelum webhook masuk)
  const snapStatus = searchParams.get("status") as
    | "success"
    | "pending"
    | "error"
    | null;

  // ✅ Polling aktif ke backend — berhenti otomatis saat status terminal
  const { data: payment, isLoading } = usePaymentStatus(orderId, true);

  // Resolve status yang ditampilkan:
  // Prioritaskan data DB (dari webhook), fallback ke snap hint
  const dbStatus = payment?.status;
  const isTerminal =
    dbStatus &&
    ["SETTLEMENT", "CAPTURE", "CANCEL", "EXPIRE", "FAILURE", "DENY"].includes(
      dbStatus,
    );

  const displayStatus: "loading" | "success" | "pending" | "failed" = (() => {
    if (!dbStatus && isLoading) return "loading";

    if (
      dbStatus === PaymentStatus.SETTLEMENT ||
      dbStatus === PaymentStatus.CAPTURE
    ) {
      return "success";
    }
    if (
      dbStatus === PaymentStatus.CANCEL ||
      dbStatus === PaymentStatus.EXPIRE ||
      dbStatus === PaymentStatus.FAILURE ||
      dbStatus === PaymentStatus.DENY
    ) {
      return "failed";
    }
    if (dbStatus === PaymentStatus.PENDING) {
      // Gunakan snap hint sementara polling
      if (snapStatus === "success") return "success";
      return "pending";
    }

    // Fallback sebelum DB update
    if (snapStatus === "success") return "success";
    if (snapStatus === "pending") return "pending";
    return "loading";
  })();

  const config = {
    loading: {
      icon: <Loader2 className="h-16 w-16 animate-spin text-blue-500" />,
      title: "Memverifikasi Pembayaran...",
      description:
        "Mohon tunggu, kami sedang memverifikasi status pembayaran Anda.",
      color: "text-blue-600",
    },
    success: {
      icon: <CheckCircle2 className="h-16 w-16 text-green-500" />,
      title: "Pembayaran Berhasil!",
      description: "Pembayaran Anda telah diterima. Pesanan sedang diproses.",
      color: "text-green-600",
    },
    pending: {
      icon: <Clock className="h-16 w-16 text-yellow-500" />,
      title: "Menunggu Pembayaran",
      description:
        "Pembayaran Anda sedang diproses. Kami akan update status secara otomatis.",
      color: "text-yellow-600",
    },
    failed: {
      icon: <XCircle className="h-16 w-16 text-red-500" />,
      title: "Pembayaran Gagal",
      description:
        "Pembayaran tidak berhasil atau dibatalkan. Silakan coba lagi.",
      color: "text-red-600",
    },
  };

  const current = config[displayStatus];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">{current.icon}</div>
          <CardTitle className={`text-2xl ${current.color}`}>
            {current.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">{current.description}</p>

          {/* Info payment type jika ada */}
          {payment?.payment_type && (
            <div className="rounded-lg bg-muted p-3 text-sm">
              <span className="text-muted-foreground">Metode: </span>
              <span className="font-medium capitalize">
                {payment.payment_type.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Polling indicator — tampil selama masih pending & belum terminal */}
          {displayStatus === "pending" && !isTerminal && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Memperbarui status secara otomatis...
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {displayStatus === "success" && (
              <Button asChild>
                <Link href={`/`}>Kembali ke Beranda</Link>
              </Button>
            )}

            {displayStatus === "failed" && (
              <>
                {/* Arahkan ke order confirmation agar bisa coba bayar lagi */}
                <Button asChild>
                  <Link href={`/order-confirmation/${orderId}`}>
                    Coba Bayar Lagi
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Kembali ke Beranda</Link>
                </Button>
              </>
            )}

            {displayStatus === "pending" && (
              <Button variant="outline" asChild>
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            )}

            {displayStatus === "loading" && (
              <Button variant="outline" asChild>
                <Link href="/">Kembali ke Beranda</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
