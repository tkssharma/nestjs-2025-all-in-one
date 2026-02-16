import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

@Injectable()
export class ProductEventsListener {
  private readonly logger = new Logger(ProductEventsListener.name);

  @OnEvent("product.created")
  handleProductCreated(payload: {
    productId: string;
    name: string;
    price: number;
  }) {
    this.logger.log(
      `Product created: ${payload.name} (ID: ${payload.productId}) - $${payload.price}`
    );
  }

  @OnEvent("product.updated")
  handleProductUpdated(payload: {
    productId: string;
    changes: any;
    oldValues: any;
  }) {
    this.logger.log(`Product updated: ${payload.productId}`);
    this.logger.debug(`Changes: ${JSON.stringify(payload.changes)}`);
  }

  @OnEvent("product.deleted")
  handleProductDeleted(payload: { productId: string; name: string }) {
    this.logger.log(
      `Product deleted: ${payload.name} (ID: ${payload.productId})`
    );
  }

  @OnEvent("product.**")
  handleAllProductEvents(payload: any) {
    this.logger.verbose(`Product event received: ${JSON.stringify(payload)}`);
  }
}
