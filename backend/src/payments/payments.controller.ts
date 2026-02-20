import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { PaymentService } from "./payments.service";

@Controller("payment")
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * POST /payment/initiate/:orderId
   * Dipanggil dari FE saat user klik "Bayar Sekarang"
   * Return: snap_token untuk Snap popup atau redirect_url
   */
  @Post("initiate/:orderId")
  async initiatePayment(@Param("orderId") orderId: string) {
    return this.paymentService.initiatePayment(orderId);
  }

  /**
   * POST /payment/notification
   * Endpoint ini didaftarkan di Midtrans Dashboard:
   * Settings > Configuration > Payment Notification URL
   *
   * WAJIB:
   * - Tidak perlu auth header (Midtrans tidak support)
   * - Harus return HTTP 200 segera
   * - Proses update DB secara async jika perlu
   */
  @Post("notification")
  @HttpCode(HttpStatus.OK) // WAJIB return 200 agar Midtrans tidak retry
  async handleNotification(@Body() notificationBody: Record<string, any>) {
    this.logger.log(
      `Webhook received: ${JSON.stringify({
        order_id: notificationBody.order_id,
        transaction_status: notificationBody.transaction_status,
      })}`,
    );

    try {
      await this.paymentService.handleMidtransNotification(notificationBody);
    } catch (error) {
      // Log error tapi tetap return 200
      // Jika return 4xx/5xx, Midtrans akan terus retry
      this.logger.error("Error processing notification", error);
    }

    return { status: "ok" };
  }

  /**
   * GET /payment/status/:orderId
   * Polling status dari FE setelah redirect dari Midtrans
   */
  @Get("status/:orderId")
  async getPaymentStatus(@Param("orderId") orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }
}
