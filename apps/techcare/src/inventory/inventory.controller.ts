import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  type Inventory,
  type InventoryWithProduct,
  type UpdateStockDto,
  type StockMovement,
} from '@app/shared';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getAllInventory(): Promise<InventoryWithProduct[]> {
    return this.inventoryService.findAll();
  }

  @Get('movements')
  getAllMovements(): Promise<StockMovement[]> {
    return this.inventoryService.getMovements();
  }

  @Get(':productId')
  getStock(
    @Param('productId') productId: string,
  ): Promise<InventoryWithProduct | null> {
    return this.inventoryService.getStock(productId);
  }

  @Get(':productId/movements')
  getProductMovements(
    @Param('productId') productId: string,
  ): Promise<StockMovement[]> {
    return this.inventoryService.getMovements(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  updateStock(@Body() payload: UpdateStockDto): Promise<Inventory[]> {
    return this.inventoryService.updateStock(
      payload.productId,
      payload.quantity,
    );
  }
}
