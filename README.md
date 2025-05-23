# Dashboard Administrativo

Um painel de controle administrativo moderno e responsivo construído com Angular, oferecendo visualizações avançadas de dados e estatísticas em tempo real.


## 📋 Conteúdo

- [Visão Geral](#visão-geral)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)


## 🔍 Visão Geral

Este dashboard administrativo foi desenvolvido para fornecer uma interface intuitiva e visualmente atraente para gerenciar produtos, pedidos e usuários. Oferece insights valiosos através de gráficos interativos e estatísticas em tempo real, permitindo tomadas de decisão baseadas em dados.

## 🛠️ Tecnologias Utilizadas

- **Angular 19**: Framework front-end de última geração para construção de aplicações web modernas
  - _Por que_: Oferece componentização robusta, alta performance e ferramentas de desenvolvimento avançadas

- **Angular Material**: Biblioteca de componentes UI para Angular baseada no Material Design
  - _Por que_: Fornece componentes prontos, acessíveis e visualmente consistentes, acelerando o desenvolvimento

- **ngx-charts**: Biblioteca de visualização de dados baseada em D3.js
  - _Por que_: Oferece gráficos interativos, responsivos e com animações que melhoram a compreensão dos dados

- **RxJS**: Biblioteca para programação reativa
  - _Por que_: Facilita o gerenciamento de fluxos de dados assíncronos e atualizações em tempo real

- **TypeScript**: Superset tipado do JavaScript
  - _Por que_: Adiciona tipagem estática, melhorando a manutenção e prevenção de erros

- **SCSS**: Pré-processador CSS avançado
  - _Por que_: Permite escrever estilos mais organizados e reutilizáveis com recursos como variáveis, mixins e funções

## ✨ Funcionalidades

### Dashboard Principal
- **Cartões de Estatísticas**: Exibe métricas-chave como receita total, número de pedidos, produtos e valor médio por pedido
- **Gráficos de Status**: Visualiza a distribuição de pedidos por status usando gráficos de pizza avançados
- **Tendências de Vendas**: Acompanha a evolução das vendas ao longo do tempo com gráficos de linha
- **Análise de Categorias**: Mostra a distribuição de produtos por categoria com gráficos de barras
- **Top Produtos**: Exibe os produtos mais rentáveis em gráficos horizontais

### Gerenciamento de Produtos
- Listagem, adição, edição e remoção de produtos
- Filtros e ordenação avançada
- Gestão de estoque e categorias

### Gerenciamento de Pedidos
- Acompanhamento de status de pedidos
- Histórico detalhado
- Processamento de pedidos

### Gerenciamento de Usuários
- Controle de acesso e permissões
- Cadastro e edição de usuários
- Monitoramento de atividades



## 📋 Pré-requisitos

- Node.js (v18.x ou superior)
- npm (v9.x ou superior)
- Angular CLI (v19.x)

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/admin-dashboard.git
cd admin-dashboard
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

4. Acesse a aplicação em seu navegador:



## 📦 Comandos Disponíveis

- `npm start`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria a versão de produção padrão
- `npm run build:prod`: Cria a versão de produção otimizada usando tsconfig.build.json
- `npm run build:optimize`: Cria uma versão ainda mais otimizada com configurações avançadas
- `npm run watch`: Compila e observa alterações no código
- `npm test`: Executa os testes unitários
- `npm run serve:ssr:admin-dashboard`: Executa a versão Server-Side Rendering (SSR)

## 📁 Estrutura do Projeto

```
admin-dashboard/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── guards/          # Guardas de rota para proteção
│   │   ├── pages/           # Páginas principais da aplicação
│   │   ├── services/        # Serviços para lógica de negócios
│   │   └── styles/          # Estilos globais e variáveis
│   ├── assets/              # Recursos estáticos
│   └── environments/        # Configurações de ambiente
├── public/                  # Arquivos públicos
└── [arquivos de configuração]
```



### Técnicas Aplicadas

1. **Otimização de CSS**:
   - Uso de variáveis SCSS para centralizar valores comuns
   - Implementação de loops `@each` para reduzir código repetitivo
   - Criação de arquivo `_dashboard-variables.scss` para compartilhar estilos



2. **Otimização de JavaScript**:
   - Criação do `DashboardService` para centralizar funções comuns
   - Configuração específica em `tsconfig.build.json` para produção
   - Uso de importações seletivas para reduzir tree-shaking

3. **Configurações Angular**:
   - Ajuste de limites no `angular.json`
   - Habilitação de otimizações avançadas
   - Scripts de build otimizados (`npm run optimize`)





Desenvolvido com ❤️ para uma experiência administrativa moderna e eficiente.
