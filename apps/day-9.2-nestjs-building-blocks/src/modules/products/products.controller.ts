import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all products" })
  @ApiOkResponse({ description: "Returns all products" })
  @ApiResponse({ status: 200, description: "Returns all products" })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Returns the product" })
  @ApiResponse({ status: 404, description: "Product not found" })
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: "Create a new product" })
  @ApiCreatedResponse({ description: "Product created successfully" })
  @ApiResponse({ status: 201, description: "Product created successfully" })
  @ApiResponse({ status: 400, description: "Validation failed" })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Put(":id")
  @Public()
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product updated successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a product" })
  @ApiNoContentResponse({ description: "Delete a product" })
  @ApiParam({ name: "id", description: "Product ID" })
  @ApiResponse({ status: 204, description: "Product deleted successfully" })
  @ApiResponse({ status: 404, description: "Product not found" })
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
  }
}
