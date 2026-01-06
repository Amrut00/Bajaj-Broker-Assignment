const { v4: uuidv4 } = require('uuid');

// In-memory storage for all trading data
class MemoryStore {
  constructor() {
    // Initialize data stores
    this.instruments = new Map();
    this.orders = new Map();
    this.trades = new Map();
    this.portfolio = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  // Initialize sample instruments
  initializeSampleData() {
    const sampleInstruments = [
      {
        id: 'RELIANCE',
        symbol: 'RELIANCE',
        exchange: 'NSE',
        instrumentType: 'EQUITY',
        lastTradedPrice: 2450.75,
        companyName: 'Reliance Industries Ltd'
      },
      {
        id: 'TCS',
        symbol: 'TCS',
        exchange: 'NSE',
        instrumentType: 'EQUITY',
        lastTradedPrice: 3890.20,
        companyName: 'Tata Consultancy Services Ltd'
      },
      {
        id: 'INFY',
        symbol: 'INFY',
        exchange: 'NSE',
        instrumentType: 'EQUITY',
        lastTradedPrice: 1756.85,
        companyName: 'Infosys Ltd'
      },
      {
        id: 'HDFC',
        symbol: 'HDFC',
        exchange: 'NSE',
        instrumentType: 'EQUITY',
        lastTradedPrice: 1642.30,
        companyName: 'HDFC Bank Ltd'
      },
      {
        id: 'ICICIBANK',
        symbol: 'ICICIBANK',
        exchange: 'NSE',
        instrumentType: 'EQUITY',
        lastTradedPrice: 1198.45,
        companyName: 'ICICI Bank Ltd'
      }
    ];

    sampleInstruments.forEach(instrument => {
      this.instruments.set(instrument.symbol, instrument);
    });

    console.log(`📊 Initialized ${sampleInstruments.length} sample instruments`);
  }

  // Instrument operations
  getAllInstruments() {
    return Array.from(this.instruments.values());
  }

  getInstrumentBySymbol(symbol) {
    return this.instruments.get(symbol);
  }

  updateInstrumentPrice(symbol, price) {
    const instrument = this.instruments.get(symbol);
    if (instrument) {
      instrument.lastTradedPrice = price;
      this.instruments.set(symbol, instrument);
      return true;
    }
    return false;
  }

  // Order operations
  createOrder(orderData) {
    const orderId = uuidv4();
    const order = {
      id: orderId,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.orders.set(orderId, order);
    return order;
  }

  getOrderById(orderId) {
    return this.orders.get(orderId);
  }

  updateOrderStatus(orderId, status, executionData = {}) {
    const order = this.orders.get(orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      if (executionData.executedPrice) {
        order.executedPrice = executionData.executedPrice;
      }
      if (executionData.executedQuantity) {
        order.executedQuantity = executionData.executedQuantity;
      }
      this.orders.set(orderId, order);
      return order;
    }
    return null;
  }

  getAllOrders(userId) {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  // Trade operations
  createTrade(tradeData) {
    const tradeId = uuidv4();
    const trade = {
      id: tradeId,
      ...tradeData,
      createdAt: new Date()
    };
    this.trades.set(tradeId, trade);
    return trade;
  }

  getAllTrades(userId) {
    return Array.from(this.trades.values()).filter(trade => trade.userId === userId);
  }

  // Portfolio operations
  updatePortfolio(userId, symbol, quantity, price, orderType) {
    const portfolioKey = `${userId}_${symbol}`;
    let holding = this.portfolio.get(portfolioKey);

    if (!holding) {
      // New holding
      holding = {
        userId,
        symbol,
        quantity: 0,
        totalInvestment: 0,
        averagePrice: 0,
        updatedAt: new Date()
      };
    }

    // Calculate new values based on order type
    if (orderType === 'BUY') {
      const totalInvestment = holding.totalInvestment + (quantity * price);
      const totalQuantity = holding.quantity + quantity;
      
      holding.quantity = totalQuantity;
      holding.totalInvestment = totalInvestment;
      holding.averagePrice = totalInvestment / totalQuantity;
    } else if (orderType === 'SELL') {
      // For sell, reduce quantity but keep average price same
      holding.quantity = Math.max(0, holding.quantity - quantity);
      if (holding.quantity === 0) {
        holding.totalInvestment = 0;
        holding.averagePrice = 0;
      }
    }

    holding.updatedAt = new Date();
    this.portfolio.set(portfolioKey, holding);
    
    return holding;
  }

  getPortfolio(userId) {
    const userHoldings = Array.from(this.portfolio.values()).filter(holding => 
      holding.userId === userId && holding.quantity > 0
    );

    // Add current values
    return userHoldings.map(holding => {
      const instrument = this.getInstrumentBySymbol(holding.symbol);
      const currentPrice = instrument ? instrument.lastTradedPrice : 0;
      const currentValue = holding.quantity * currentPrice;
      
      return {
        ...holding,
        currentPrice,
        currentValue,
        totalReturn: currentValue - holding.totalInvestment,
        totalReturnPercentage: holding.totalInvestment > 0 ? 
          ((currentValue - holding.totalInvestment) / holding.totalInvestment * 100).toFixed(2) : 0
      };
    });
  }

  // Utility methods
  clearAllData() {
    this.orders.clear();
    this.trades.clear();
    this.portfolio.clear();
    this.initializeSampleData();
  }

  getStats() {
    return {
      instruments: this.instruments.size,
      orders: this.orders.size,
      trades: this.trades.size,
      portfolioHoldings: this.portfolio.size
    };
  }
}

// Create singleton instance
const memoryStore = new MemoryStore();

module.exports = memoryStore;
