import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { OrderService } from '../../services/order/order.service';
import { ProductService, Product } from '../../services/product/product.service';
import { AuthService } from '../../services/auth/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { Subscription, interval } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDividerModule,
    NgxChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {  // Dados para estatísticas
  totalProducts = 0;
  totalOrders = 0;
  revenueTotal = 0;
  
  // Dados detalhados de receita
  revenueByCategoryData: any[] = [];
  revenueByProductData: any[] = [];
  // Dados para gráficos
  orderStatusData: any[] = [];
  orderTimelineData: any[] = [];
  productCategoryData: any[] = [];
    // Opções para gráficos
  view: [number, number] = [500, 300];
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  legendPosition = LegendPosition.Below;
  animations = true;
  showDataLabel = true;
  
  colorScheme: Color = {
    name: 'vivid',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#3366CC', '#DC3912', '#FF9900', '#109618', '#990099',
      '#0099C6', '#DD4477', '#66AA00', '#B82E2E', '#316395',
      '#994499', '#22AA99', '#AAAA11', '#6633CC', '#E67300'
    ]
  };
  
  // Para atualização automática
  private updateSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    public authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    
    // Configurar atualização automática a cada 30 segundos
    this.updateSubscription = interval(30000) 
      .pipe(startWith(0)) // Emitir imediatamente na inicialização
      .subscribe(() => {
        this.loadAllData();
      });
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  loadAllData(): void {
    this.loadStatistics();
    this.loadChartData();
  }
  loadStatistics(): void {
    // Primeiro obter todos os produtos para cálculos posteriores
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.totalProducts = products.length;
      
      // Calcular contagem de produtos por status
      const availableProducts = products.filter(p => p.status === 'available').length;
      const outOfStockProducts = products.filter(p => p.status === 'out_of_stock').length;
      const discontinuedProducts = products.filter(p => p.status === 'discontinued').length;
      
      console.log(`Produtos disponíveis: ${availableProducts}, Sem estoque: ${outOfStockProducts}, Descontinuados: ${discontinuedProducts}`);
      
      // Depois obter os pedidos para calcular a receita e outros dados relacionados
      this.orderService.getOrders().subscribe((orders: any[]) => {
        this.totalOrders = orders.length;
        this.revenueTotal = orders.reduce((sum, order) => sum + order.total, 0);
        
        // Calcular contagem de pedidos por status
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const processingOrders = orders.filter(o => o.status === 'processing').length;
        const shippedOrders = orders.filter(o => o.status === 'shipped').length;
        const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
        
        console.log(`Pedidos pendentes: ${pendingOrders}, Em processamento: ${processingOrders}, Enviados: ${shippedOrders}, Entregues: ${deliveredOrders}`);
        
        // Calcular a receita por categoria de produto
        this.calculateRevenueByCategoryAndProduct(orders, products);
      });
    });
  }
  calculateRevenueByCategoryAndProduct(orders: any[], products: Product[]): void {
    // Criar um mapa de ID do produto para obter facilmente as informações do produto
    const productMap = new Map<number, Product>();
    products.forEach(product => {
      productMap.set(product.id, product);
    });
    
    // Mapas para armazenar receita por categoria e por produto
    const revenueByCategory = new Map<string, number>();
    const revenueByProduct = new Map<number, { name: string, revenue: number, quantity: number }>();
    
    // Processar todos os pedidos e itens para calcular receita
    let ordersProcessed = 0;
    let totalRevenue = 0;
    
    orders.forEach(order => {
      if (order.status !== 'cancelled') { // Não considerar pedidos cancelados
        ordersProcessed++;
        totalRevenue += order.total;
        
        order.items.forEach((item: any) => {
          const product = productMap.get(item.productId);
          if (product) {
            // Calcular receita deste item
            const itemRevenue = item.quantity * item.unitPrice;
            
            // Adicionar à receita do produto
            const currentProduct = revenueByProduct.get(product.id) || { 
              name: product.name, 
              revenue: 0, 
              quantity: 0 
            };
            revenueByProduct.set(product.id, {
              name: product.name,
              revenue: currentProduct.revenue + itemRevenue,
              quantity: currentProduct.quantity + item.quantity
            });
            
            // Adicionar à receita da categoria
            const currentCategoryRevenue = revenueByCategory.get(product.category) || 0;
            revenueByCategory.set(product.category, currentCategoryRevenue + itemRevenue);
          }
        });
      }
    });
    
    // Converter os mapas para arrays para o formato necessário para os gráficos
    this.revenueByCategoryData = Array.from(revenueByCategory.entries())
      .map(([category, revenue]) => ({
        name: category,
        value: revenue
      }))
      .sort((a, b) => b.value - a.value); // Ordenar por valor decrescente
    
    this.revenueByProductData = Array.from(revenueByProduct.entries())
      .map(([productId, data]) => ({
        name: data.name,
        value: data.revenue,
        extra: { 
          quantity: data.quantity, 
          avgPrice: (data.revenue / data.quantity).toFixed(2)
        }
      }))
      .sort((a, b) => b.value - a.value) // Ordenar por valor decrescente
      .slice(0, 5); // Pegar apenas os 5 produtos com maior receita
    
    console.log(`Processados ${ordersProcessed} pedidos válidos com receita total de ${this.formatCurrency(totalRevenue)}`);
    console.log('Dados de receita por categoria:', this.revenueByCategoryData);
    console.log('Dados de receita por produto (top 5):', this.revenueByProductData);
  }loadChartData(): void {
    // Carregar dados de status de pedido para o gráfico de pizza
    this.orderService.getOrdersByStatus().subscribe((data: any[]) => {
      this.orderStatusData = data.map(item => ({
        name: this.translateStatus(item.status),
        value: item.count
      }));
    });

    // Carregar dados da linha do tempo de pedidos com melhor formatação e detalhes
    this.orderService.getOrdersTimeline().subscribe((data: any[]) => {
      // Ordenar dados por data para garantir visualização cronológica correta
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calcular média móvel de 3 dias para mostrar tendência suavizada
      const movingAvg = this.calculateMovingAverage(sortedData.map(item => item.total), 3);
      
      this.orderTimelineData = [
        {
          name: 'Pedidos',
          series: sortedData.map(item => ({
            name: this.formatDateForChart(item.date),
            value: item.count
          }))
        },
        {
          name: 'Receita',
          series: sortedData.map(item => ({
            name: this.formatDateForChart(item.date),
            value: item.total
          }))
        },
        {
          name: 'Tendência de Receita (Média 3 dias)',
          series: sortedData.map((item, index) => ({
            name: this.formatDateForChart(item.date),
            value: movingAvg[index] || item.total
          }))
        }
      ];
      
      console.log('Dados de tendência de vendas atualizados:', this.orderTimelineData);
    });

    // Carregar dados de categoria de produtos para o gráfico de barras
    this.productService.getProductsByCategory().subscribe((data: any[]) => {
      this.productCategoryData = data.map(item => ({
        name: item.category,
        value: item.count
      }))
      .sort((a, b) => b.value - a.value); // Ordenar por quantidade descendente
    });
  }
    // Método para calcular média móvel para suavizar tendências
  calculateMovingAverage(data: number[], windowSize: number): number[] {
    return this.dashboardService.calculateMovingAverage(data, windowSize);
  }
  
  // Melhor formatação de data para gráficos
  formatDateForChart(dateString: string): string {
    return this.dashboardService.formatDateForChart(dateString);
  }

  translateStatus(status: string): string {
    return this.dashboardService.translateStatus(status);
  }

  getStatusClass(status: string): string {
    const classMap: {[key: string]: string} = {
      'pending': 'status-pending',
      'processing': 'status-processing',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    
    return classMap[status] || '';
  }
  formatCurrency(value: number): string {
    return this.dashboardService.formatCurrency(value);
  }

  formatDate(dateString: string): string {
    return this.dashboardService.formatDate(dateString);
  }
}
