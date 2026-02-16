import { Injectable, NotFoundException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { v4 as uuidv4 } from "uuid";
import { Product } from "./entities/product.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Injectable()
export class ProductsService {
  private products: Product[] = [
    {
      id: "1",
      name: "MacBook Pro",
      description: "Apple M3 Pro chip laptop",
      price: 1999.99,
      category: "Electronics",
      stock: 50,
      isAvailable: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      name: "iPhone 15 Pro",
      description: "Latest iPhone with titanium design",
      price: 1199.99,
      category: "Electronics",
      stock: 100,
      isAvailable: true,
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      id: "3",
      name: "AirPods Pro",
      description: "Wireless earbuds with noise cancellation",
      price: 249.99,
      category: "Audio",
      stock: 200,
      isAvailable: true,
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date("2024-02-01"),
    },
  ];

  constructor(private eventEmitter: EventEmitter2) {}

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  create(createProductDto: CreateProductDto): Product {
    const newProduct: Product = {
      id: uuidv4(),
      ...createProductDto,
      stock: createProductDto.stock ?? 0,
      isAvailable: createProductDto.isAvailable ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.push(newProduct);

    // Emit product created event
    this.eventEmitter.emit("product.created", {
      productId: newProduct.id,
      name: newProduct.name,
      price: newProduct.price,
    });

    return newProduct;
  }

  update(id: string, updateProductDto: UpdateProductDto): Product {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const oldProduct = { ...this.products[productIndex] };

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updateProductDto,
      updatedAt: new Date(),
    };

    // Emit product updated event
    this.eventEmitter.emit("product.updated", {
      productId: id,
      changes: updateProductDto,
      oldValues: oldProduct,
    });

    return this.products[productIndex];
  }

  remove(id: string): void {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    const deletedProduct = this.products[productIndex];
    this.products.splice(productIndex, 1);

    // Emit product deleted event
    this.eventEmitter.emit("product.deleted", {
      productId: id,
      name: deletedProduct.name,
    });
  }

  findByCategory(category: string): Product[] {
    return this.products.filter((p) => p.category === category);
  }
}
