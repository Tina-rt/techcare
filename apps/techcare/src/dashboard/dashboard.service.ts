import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { sendAndCatch, DashboardStats } from '@app/shared';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('PRODUCT_MANAGER_SERVICE')
    private readonly productClient: ClientProxy,
    @Inject('ORDER_MANAGER_SERVICE')
    private readonly orderClient: ClientProxy,
  ) {}

  async getDashboardData(): Promise<DashboardStats & { products: number }> {
    try {
      const [productCount, orderStats] = await Promise.all([
        sendAndCatch<number>(this.productClient, 'count_products', {}),
        sendAndCatch<DashboardStats>(this.orderClient, 'get_dashboard_stats', {}),
      ]);

      return {
        ...orderStats,
        products: productCount || 0,
      };
    } catch (error) {
      console.error('[DashboardService] Error aggregating data:', error);
      return {
        totalRevenue: 0,
        totalProductsOrdered: 0,
        orders: [],
        products: 0,
        salesAmountGraph: { labels: [], datasets: [] },
        orderedProductGraph: { labels: [], datasets: [] },
      };
    }
  }
}
