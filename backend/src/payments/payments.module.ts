import { Module } from "@nestjs/common";
import { PaymentController } from "./payments.controller";
import { PaymentService } from "./payments.service";

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
