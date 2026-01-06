const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: 'v1',
  
  // Mock user for authentication
  mockUser: {
    id: 'user_001',
    name: 'Test User',
    email: 'testuser@example.com'
  },

  // Trading configuration
  trading: {
    maxOrderQuantity: 10000,
    minOrderQuantity: 1,
    supportedOrderTypes: ['BUY', 'SELL'],
    supportedOrderStyles: ['MARKET', 'LIMIT'],
    supportedOrderStates: ['NEW', 'PLACED', 'EXECUTED', 'CANCELLED']
  }
};

module.exports = config;
