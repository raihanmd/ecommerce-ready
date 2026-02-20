// src/payment/midtrans.service.ts
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as MidtransClient from "midtrans-client";

interface MidtransSnap extends MidtransClient.Snap {
  transaction: {
    notification: (body: Record<string, any>) => Promise<any>;
    status: (orderId: string) => Promise<any>;
    cancel: (orderId: string) => Promise<any>;
    approve: (orderId: string) => Promise<any>;
    deny: (orderId: string) => Promise<any>;
    expire: (orderId: string) => Promise<any>;
    refund: (orderId: string, param?: Record<string, any>) => Promise<any>;
  };
}

export interface SnapTransactionParam {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    firstName: string;
    lastName?: string;
    email?: string;
    phone: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
  expiryDuration?: number;
}

export interface SnapTokenResponse {
  token: string;
  redirect_url: string;
}

@Injectable()
export class MidtransService {
  private readonly logger = new Logger(MidtransService.name);
  private snap: MidtransSnap;

  constructor(private readonly configService: ConfigService) {
    const isProduction =
      this.configService.get("MIDTRANS_IS_PRODUCTION") === "true";

    this.snap = new MidtransClient.Snap({
      isProduction,
      serverKey: this.configService.getOrThrow("MIDTRANS_SERVER_KEY"),
      clientKey: this.configService.getOrThrow("MIDTRANS_CLIENT_KEY"),
    }) as MidtransSnap;
  }

  async createSnapToken(
    param: SnapTransactionParam,
  ): Promise<SnapTokenResponse> {
    const expiryMinutes = param.expiryDuration ?? 60;

    const parameter = {
      transaction_details: {
        order_id: param.orderId,
        gross_amount: Math.round(param.grossAmount),
      },
      customer_details: {
        first_name: param.customerDetails.firstName,
        last_name: param.customerDetails.lastName ?? "",
        phone: param.customerDetails.phone,
        ...(param.customerDetails.email && {
          email: param.customerDetails.email,
        }),
      },
      item_details: param.itemDetails.map((item) => ({
        id: item.id,
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
      credit_card: { secure: true },
      expiry: { unit: "minutes", duration: expiryMinutes },
    };

    try {
      const response = await this.snap.createTransaction(parameter);
      this.logger.log(`Snap token created for order: ${param.orderId}`);
      return { token: response.token, redirect_url: response.redirect_url };
    } catch (error: any) {
      this.logger.error(
        `Failed to create snap token: ${param.orderId}`,
        error?.ApiResponse ?? error,
      );
      throw error;
    }
  }

  async handleNotification(notificationBody: Record<string, any>) {
    try {
      return await this.snap.transaction.notification(notificationBody);
    } catch (error) {
      this.logger.error("Failed to verify notification", error);
      throw error;
    }
  }

  async getTransactionStatus(midtransOrderId: string) {
    return this.snap.transaction.status(midtransOrderId);
  }

  async cancelTransaction(midtransOrderId: string) {
    return this.snap.transaction.cancel(midtransOrderId);
  }
}
