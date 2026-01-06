// Trading constants
const ORDER_TYPES = {
  BUY: 'BUY',
  SELL: 'SELL'
};

const ORDER_STYLES = {
  MARKET: 'MARKET',
  LIMIT: 'LIMIT'
};

const ORDER_STATUSES = {
  NEW: 'NEW',
  PLACED: 'PLACED',
  EXECUTED: 'EXECUTED',
  CANCELLED: 'CANCELLED'
};

const EXCHANGES = {
  NSE: 'NSE',
  BSE: 'BSE'
};

const INSTRUMENT_TYPES = {
  EQUITY: 'EQUITY',
  DERIVATIVE: 'DERIVATIVE',
  COMMODITY: 'COMMODITY'
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

// API Response Messages
const MESSAGES = {
  SUCCESS: {
    ORDER_CREATED: 'Order placed successfully',
    ORDER_CANCELLED: 'Order cancelled successfully',
    DATA_RETRIEVED: 'Data retrieved successfully'
  },
  ERROR: {
    INVALID_SYMBOL: 'Invalid instrument symbol',
    INVALID_ORDER_DATA: 'Invalid order data provided',
    ORDER_NOT_FOUND: 'Order not found',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this order',
    MARKET_CLOSED: 'Market is currently closed',
    UNAUTHORIZED: 'Authentication required',
    VALIDATION_FAILED: 'Input validation failed'
  }
};

// Trading limits
const LIMITS = {
  MAX_ORDER_QUANTITY: 10000,
  MIN_ORDER_QUANTITY: 1,
  MAX_ORDER_VALUE: 1000000,
  MIN_ORDER_VALUE: 1
};

module.exports = {
  ORDER_TYPES,
  ORDER_STYLES,
  ORDER_STATUSES,
  EXCHANGES,
  INSTRUMENT_TYPES,
  HTTP_STATUS,
  MESSAGES,
  LIMITS
};
