import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  type Inventory,
  type InventoryWithProduct,
  type UpdateStockDto,
  type StockMovementWithProduct,
  convertToCsv,
} from '@app/shared';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAllInventory(): Promise<InventoryWithProduct[]> {
    return this.inventoryService.findAll();
  }

  @Get('movements')
  @UseGuards(JwtAuthGuard)
  getAllMovements(): Promise<StockMovementWithProduct[]> {
    return this.inventoryService.getMovements();
  }

  @Get('export')
  async exportInventory(@Res() res: Response) {
    const inventory = await this.inventoryService.findAll();

    const csv = convertToCsv(inventory, [
      { field: 'productId', header: 'ID Produit' },
      { field: 'product.name', header: 'Nom Produit' },
      { field: 'quantity', header: 'Quantité Physique' },
      { field: 'reservedQuantity', header: 'Réservé' },
      { field: 'lastUpdated', header: 'Dernière Mise à Jour' },
    ]);

    res.header('Content-Type', 'text/csv');
    res.attachment(`inventory_${new Date().getTime()}.csv`);
    return res.send(csv);
  }

  @Get('movements/export')
  async exportMovements(@Res() res: Response) {
    const movements = await this.inventoryService.getMovements();

    const csv = convertToCsv(movements, [
      { field: 'id', header: 'ID Move' },
      { field: 'productId', header: 'ID Produit' },
      { field: 'product.name', header: 'Nom Produit' },
      { field: 'type', header: 'Type' },
      { field: 'quantityChanged', header: 'Variation' },
      { field: 'previousQuantity', header: 'Avant' },
      { field: 'newQuantity', header: 'Après' },
      { field: 'reason', header: 'Raison' },
      { field: 'referenceId', header: 'Réf Commande' },
      { field: 'createdAt', header: 'Date' },
    ]);

    res.header('Content-Type', 'text/csv');
    res.attachment(`movements_${new Date().getTime()}.csv`);
    return res.send(csv);
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
  ): Promise<StockMovementWithProduct[]> {
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
