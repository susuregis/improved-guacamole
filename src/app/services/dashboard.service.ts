import { Injectable } from '@angular/core';
import { OrderService } from './order/order.service';
import { ProductService } from './product/product.service';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Serviço centralizado que combina funcionalidades comuns de outros serviços
 * para otimizar o tamanho do bundle
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private dataLoadedSubject = new BehaviorSubject<boolean>(false);
  public dataLoaded$ = this.dataLoadedSubject.asObservable();

  constructor(
    private orderService: OrderService,
    private productService: ProductService
  ) {}

  /**
   * Carrega todos os dados necessários para o dashboard em uma única chamada
   */
  loadDashboardData(): Observable<any> {
    // Centraliza o carregamento de dados em um único lugar
    return new Observable(observer => {
      const dashboardData: any = {
        orders: null,
        products: null,
        ordersByStatus: null,
        orderTimeline: null,
        productsByCategory: null
      };

      // Controla quando todos os dados foram carregados
      let loadedCount = 0;
      const totalToLoad = 5;

      // Função para verificar se todos os dados foram carregados
      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) {
          this.dataLoadedSubject.next(true);
          observer.next(dashboardData);
          observer.complete();
        }
      };

      // Carregar pedidos
      this.orderService.getOrders().subscribe(orders => {
        dashboardData.orders = orders;
        checkAllLoaded();
      });

      // Carregar produtos
      this.productService.getProducts().subscribe(products => {
        dashboardData.products = products;
        checkAllLoaded();
      });

      // Carregar estatísticas de pedidos por status
      this.orderService.getOrdersByStatus().subscribe(ordersByStatus => {
        dashboardData.ordersByStatus = ordersByStatus;
        checkAllLoaded();
      });

      // Carregar linha do tempo de pedidos
      this.orderService.getOrdersTimeline().subscribe(orderTimeline => {
        dashboardData.orderTimeline = orderTimeline;
        checkAllLoaded();
      });

      // Carregar produtos por categoria
      this.productService.getProductsByCategory().subscribe(productsByCategory => {
        dashboardData.productsByCategory = productsByCategory;
        checkAllLoaded();
      });
    });
  }

  /**
   * Formata valor para moeda brasileira
   */
  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /**
   * Formata data para o formato brasileiro
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  /**
   * Traduz status de pedido
   */
  translateStatus(status: string): string {
    const statusMap: {[key: string]: string} = {
      'pending': 'Pendente',
      'processing': 'Em processamento',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado',
      'available': 'Disponível',
      'out_of_stock': 'Sem estoque',
      'discontinued': 'Descontinuado'
    };
    
    return statusMap[status] || status;
  }

  /**
   * Calcula média móvel para valores
   */
  calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const startIndex = Math.max(0, i - Math.floor(windowSize / 2));
      const endIndex = Math.min(data.length - 1, i + Math.floor(windowSize / 2));
      const window = data.slice(startIndex, endIndex + 1);
      
      const sum = window.reduce((acc, val) => acc + val, 0);
      const avg = sum / window.length;
      
      result.push(parseFloat(avg.toFixed(2)));
    }
    
    return result;
  }

  /**
   * Formata data para exibição em gráficos
   */
  formatDateForChart(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
}
