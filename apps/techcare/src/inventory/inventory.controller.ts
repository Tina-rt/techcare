import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  getAllInventory() {
    return this.inventoryService.findAll();
  }

  @Get(':productId')
  getStock(@Param('productId') productId: string) {
    return this.inventoryService.getStock(productId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  updateStock(@Body() payload: { productId: string; quantity: number }) {
    return this.inventoryService.updateStock(
      payload.productId,
      payload.quantity,
    );
  }
}
