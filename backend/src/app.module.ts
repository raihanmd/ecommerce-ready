import { Module } from "@nestjs/common";
import { CommonModule } from "./_common/common.module";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { AdminModule } from "./admin/admin.module";
import { PaymentModule } from "./payments/payments.module";

@Module({
  imports: [
    CommonModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    AdminModule,
    PaymentModule,
  ],
})
export class AppModule {}
