import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { MidtransService } from "src/_common/midtrans/midtrans.service";
import { PrismaService } from "src/_common/prisma/prisma.service";
import { OrderStatus, PaymentStatus } from "src/generated/prisma/enums";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly midtrans: MidtransService,
  ) {}

  /**
   * Initiate payment - buat Snap token dan simpan ke DB
   * Dipanggil saat user melanjutkan ke pembayaran
   */
  async initiatePayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        order_items: { include: { product: true } },
        payment: true,
      },
    });

    if (!order) throw new NotFoundException("Order tidak ditemukan");

    // Cek apakah sudah ada payment yang active
    if (
      order.payment &&
      order.payment.status === PaymentStatus.PENDING &&
      order.payment.expiry_time &&
      order.payment.expiry_time > new Date()
    ) {
      // Return token yang sudah ada (masih valid)
      return {
        snap_token: order.payment.snap_token,
        redirect_url: order.payment.snap_redirect_url,
        payment_id: order.payment.id,
        expires_at: order.payment.expiry_time,
      };
    }

    // Buat midtrans_order_id yang unik
    // Format: ORDER_NUMBER-TIMESTAMP untuk menghindari duplicate
    const midtransOrderId = `${order.order_number}-${Date.now()}`;
    const expiryMinutes = 60;
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Siapkan item details - total harus match gross_amount
    const itemDetails = order.order_items.map((item) => ({
      id: item.product_id,
      price: Number(item.price_at_time),
      quantity: item.quantity,
      name: item.product.name,
    }));

    // Buat Snap Token dari Midtrans
    const snapResponse = await this.midtrans.createSnapToken({
      orderId: midtransOrderId,
      grossAmount: Number(order.total_amount),
      customerDetails: {
        firstName: order.customer_name,
        phone: order.customer_phone,
      },
      itemDetails,
      expiryDuration: expiryMinutes,
    });

    // Simpan/update payment record di DB
    const payment = await this.prisma.payment.upsert({
      where: { order_id: orderId },
      create: {
        order_id: orderId,
        midtrans_order_id: midtransOrderId,
        snap_token: snapResponse.token,
        snap_redirect_url: snapResponse.redirect_url,
        gross_amount: order.total_amount,
        status: PaymentStatus.PENDING,
        expiry_time: expiryTime,
      },
      update: {
        midtrans_order_id: midtransOrderId,
        snap_token: snapResponse.token,
        snap_redirect_url: snapResponse.redirect_url,
        status: PaymentStatus.PENDING,
        expiry_time: expiryTime,
      },
    });

    this.logger.log(
      `Payment initiated for order ${orderId} -> midtrans_id: ${midtransOrderId}`,
    );

    return {
      snap_token: payment.snap_token,
      redirect_url: payment.snap_redirect_url,
      payment_id: payment.id,
      expires_at: expiryTime,
    };
  }

  /**
   * Handle webhook notification dari Midtrans
   * KRITIS: Verifikasi signature, idempotent, cek status
   */
  async handleMidtransNotification(notificationBody: Record<string, any>) {
    // 1. Verifikasi & parse notifikasi (otomatis cek signature_key)
    const statusResponse =
      await this.midtrans.handleNotification(notificationBody);

    const midtransOrderId: string = statusResponse.order_id;
    const transactionStatus: string = statusResponse.transaction_status;
    const fraudStatus: string | undefined = statusResponse.fraud_status;
    const transactionId: string = statusResponse.transaction_id;
    const paymentType: string = statusResponse.payment_type;
    const statusCode: string = statusResponse.status_code;

    this.logger.log(
      `Notification received - order: ${midtransOrderId}, status: ${transactionStatus}, fraud: ${fraudStatus}`,
    );

    // 2. Cari payment berdasarkan midtrans_order_id
    const payment = await this.prisma.payment.findUnique({
      where: { midtrans_order_id: midtransOrderId },
      include: { order: true },
    });

    if (!payment) {
      this.logger.warn(
        `Payment not found for midtrans_order_id: ${midtransOrderId}`,
      );
      return; // Return 200 agar Midtrans tidak retry
    }

    // 3. Determine payment status (sesuai best practice Midtrans)
    const { paymentStatus, orderStatus } = this.resolveStatus(
      transactionStatus,
      fraudStatus,
    );

    // 4. Idempotency check - jangan proses ulang status yang sama
    // Juga ignore "out of order" notifications (e.g. settlement sebelum pending)
    if (this.shouldIgnoreNotification(payment.status, paymentStatus)) {
      this.logger.warn(
        `Ignoring notification - current: ${payment.status}, incoming: ${paymentStatus}`,
      );
      return;
    }

    // 5. Update payment dan order status dalam satu transaction DB
    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          transaction_id: transactionId,
          payment_type: paymentType,
          fraud_status: fraudStatus,
          status_code: statusCode,
        },
      });

      await tx.order.update({
        where: { id: payment.order_id },
        data: { status: orderStatus },
      });
    });

    this.logger.log(
      `Payment ${payment.id} updated to ${paymentStatus}, order ${payment.order_id} updated to ${orderStatus}`,
    );

    return { processed: true };
  }

  /**
   * Map Midtrans transaction_status + fraud_status ke internal PaymentStatus
   * Sesuai Midtrans Transaction Status Cycle
   */
  private resolveStatus(
    transactionStatus: string,
    fraudStatus?: string,
  ): { paymentStatus: PaymentStatus; orderStatus: OrderStatus } {
    switch (transactionStatus) {
      case "capture":
        // Credit card: capture bisa ACCEPT atau CHALLENGE
        if (fraudStatus === "accept") {
          return {
            paymentStatus: PaymentStatus.CAPTURE,
            orderStatus: OrderStatus.APPROVED,
          };
        }
        // fraudStatus === 'challenge' - tunggu merchant review
        return {
          paymentStatus: PaymentStatus.CAPTURE,
          orderStatus: OrderStatus.PENDING,
        };

      case "settlement":
        // Pembayaran berhasil (bank transfer, ewallet, dll)
        return {
          paymentStatus: PaymentStatus.SETTLEMENT,
          orderStatus: OrderStatus.APPROVED,
        };

      case "pending":
        return {
          paymentStatus: PaymentStatus.PENDING,
          orderStatus: OrderStatus.PENDING,
        };

      case "deny":
        return {
          paymentStatus: PaymentStatus.DENY,
          orderStatus: OrderStatus.REJECTED,
        };

      case "cancel":
        return {
          paymentStatus: PaymentStatus.CANCEL,
          orderStatus: OrderStatus.CANCELLED,
        };

      case "expire":
        return {
          paymentStatus: PaymentStatus.EXPIRE,
          orderStatus: OrderStatus.CANCELLED,
        };

      case "failure":
        return {
          paymentStatus: PaymentStatus.FAILURE,
          orderStatus: OrderStatus.REJECTED,
        };

      default:
        this.logger.warn(`Unknown transaction_status: ${transactionStatus}`);
        return {
          paymentStatus: PaymentStatus.PENDING,
          orderStatus: OrderStatus.PENDING,
        };
    }
  }

  /**
   * Cek apakah notifikasi harus diabaikan (idempotency + out-of-order)
   * Jangan downgrade status yang sudah terminal
   */
  private shouldIgnoreNotification(
    currentStatus: PaymentStatus,
    incomingStatus: PaymentStatus,
  ): boolean {
    const terminalStatuses = [
      PaymentStatus.SETTLEMENT,
      PaymentStatus.CANCEL,
      PaymentStatus.EXPIRE,
      PaymentStatus.FAILURE,
      PaymentStatus.DENY,
    ];

    // @ts-ignore
    if (terminalStatuses.includes(currentStatus)) {
      return currentStatus !== incomingStatus; // abaikan jika berbeda
    }

    return false;
  }

  /**
   * Get payment status untuk order tertentu
   */
  async getPaymentStatus(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { order_id: orderId },
    });

    if (!payment) {
      return null;
    }

    // Jika masih pending, cek aktif ke Midtrans (opsional - untuk polling)
    if (payment.status === PaymentStatus.PENDING && payment.midtrans_order_id) {
      try {
        const midtransStatus = await this.midtrans.getTransactionStatus(
          payment.midtrans_order_id,
        );
        // Return status dari Midtrans langsung (tidak update DB - biarkan webhook)
        return {
          ...payment,
          midtrans_status: midtransStatus.transaction_status,
        };
      } catch {
        // Jika gagal fetch, return status DB saja
      }
    }

    return payment;
  }
}
