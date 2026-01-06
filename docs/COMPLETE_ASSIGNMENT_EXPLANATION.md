# Complete Assignment Explanation - Bajaj Trading SDK

## 📚 Table of Contents
1. [What is This Assignment?](#what-is-this-assignment)
2. [Understanding Trading Concepts](#understanding-trading-concepts)
3. [System Architecture](#system-architecture)
4. [Project Structure Explained](#project-structure-explained)
5. [How Everything Works Together](#how-everything-works-together)
6. [Request Flow - Step by Step](#request-flow---step-by-step)
7. [File-by-File Explanation](#file-by-file-explanation)
8. [Key Features Implementation](#key-features-implementation)
9. [Trading Workflow Explained](#trading-workflow-explained)
10. [Interview Preparation Points](#interview-preparation-points)

---

## What is This Assignment?

### The Problem
You need to build a **Trading SDK** - a backend system that simulates a stock trading platform (like Bajaj Broking). Users should be able to:
1. View available stocks (instruments)
2. Place buy/sell orders
3. Check order status
4. View their trading history (trades)
5. See their current portfolio (holdings)

### What is a Trading SDK?
An SDK (Software Development Kit) is a set of tools/APIs that developers can use. In this case, it's a **wrapper around trading APIs** - meaning you're creating simplified APIs that wrap around trading functionality.

### Key Requirements
- **RESTful APIs** - Standard HTTP methods (GET, POST, PUT)
- **In-memory storage** - No database needed, use JavaScript objects/Maps
- **Mock authentication** - Simple token-based auth (not real)
- **Trading simulation** - Not connected to real markets, just simulates trading

---

## Understanding Trading Concepts

### 1. Instruments (Stocks)
**What**: Financial instruments you can trade (stocks, bonds, etc.)
**In our system**: 5 sample stocks - RELIANCE, TCS, INFY, HDFC, ICICIBANK
**Fields**:
- `symbol`: Stock code (e.g., "RELIANCE")
- `exchange`: Where it's traded (NSE - National Stock Exchange)
- `instrumentType`: Type (EQUITY = stocks)
- `lastTradedPrice`: Current market price

### 2. Orders
**What**: A request to buy or sell stocks
**Types**:
- **BUY Order**: You want to purchase stocks
- **SELL Order**: You want to sell stocks you own

**Styles**:
- **MARKET Order**: Execute immediately at current price
- **LIMIT Order**: Execute only at a specific price or better

**Status Flow**:
```
NEW → PLACED → EXECUTED (or CANCELLED)
```

### 3. Trades
**What**: Completed orders (when an order is executed, it becomes a trade)
**Key Point**: Only EXECUTED orders create trade records

### 4. Portfolio
**What**: Your current holdings (stocks you own)
**Fields**:
- `symbol`: Which stock
- `quantity`: How many shares
- `averagePrice`: What you paid on average
- `currentValue`: Current worth (quantity × current price)

---

## System Architecture

### MVC Pattern (Model-View-Controller)
We use **MVC architecture** to organize code:

```
Request → Routes → Controllers → Services → Database
                ↓
            Response
```

**Flow**:
1. **Routes** (`routes/`) - Define API endpoints
2. **Controllers** (`controllers/`) - Handle HTTP requests/responses
3. **Services** (`services/`) - Business logic (trading rules)
4. **Database** (`database/`) - Data storage (in-memory)
5. **Models** (`models/`) - Data validation and structure

### Why This Architecture?
- **Separation of Concerns**: Each layer has a specific job
- **Maintainability**: Easy to find and fix code
- **Testability**: Can test each layer independently
- **Scalability**: Easy to add new features

---

## Project Structure Explained

```
backend/
├── config/              # Configuration settings
│   └── config.js        # Server config, user settings, trading rules
│
├── controllers/         # Request handlers (what to do when API is called)
│   ├── instrumentController.js
│   ├── orderController.js
│   ├── tradeController.js
│   └── portfolioController.js
│
├── services/            # Business logic (how trading works)
│   ├── instrumentService.js
│   ├── orderService.js
│   ├── tradeService.js
│   └── portfolioService.js
│
├── routes/              # API endpoint definitions
│   ├── index.js         # Main router, combines all routes
│   ├── instruments.js
│   ├── orders.js
│   ├── trades.js
│   └── portfolio.js
│
├── middleware/          # Functions that run before/after requests
│   ├── auth.js          # Authentication check
│   ├── validation.js    # Input validation
│   └── errorHandler.js  # Error handling
│
├── models/              # Data structure definitions
│   ├── Instrument.js
│   ├── Order.js
│   ├── Trade.js
│   └── Portfolio.js
│
├── database/            # In-memory data storage
│   └── memoryStore.js   # All data stored here (Maps)
│
├── utils/               # Helper functions
│   ├── constants.js     # Fixed values (order types, statuses)
│   └── helpers.js       # Utility functions
│
├── server.js            # Main entry point (starts the server)
└── package.json         # Dependencies and scripts
```

---

## How Everything Works Together

### Complete Request Flow

**Example: User wants to place a BUY order**

```
1. User sends POST request to /api/v1/orders
   ↓
2. server.js receives request
   ↓
3. Routes (routes/orders.js) matches the endpoint
   ↓
4. Middleware (middleware/auth.js) checks authentication
   ↓
5. Middleware (middleware/validation.js) validates input
   ↓
6. Controller (controllers/orderController.js) receives request
   ↓
7. Controller calls Service (services/orderService.js)
   ↓
8. Service uses Database (database/memoryStore.js) to store order
   ↓
9. Service calls Trade Service to create trade record
   ↓
10. Service calls Portfolio Service to update holdings
    ↓
11. Response goes back: Controller → Routes → server.js → User
```

---

## Request Flow - Step by Step

### Example: Placing a BUY Order

#### Step 1: Request Arrives
**File**: `server.js`
- Express server listens on port 3000
- Request comes to `/api/v1/orders`

#### Step 2: Route Matching
**File**: `routes/index.js` → `routes/orders.js`
- Main router (`routes/index.js`) sees `/api/v1/orders`
- Forwards to `routes/orders.js`
- Matches `POST /orders` route

#### Step 3: Authentication Check
**File**: `middleware/auth.js`
- Checks for `Authorization: Bearer mock-token` header
- If missing/invalid → Returns 401 Unauthorized
- If valid → Adds `req.user` object and continues

#### Step 4: Input Validation
**File**: `middleware/validation.js`
- Validates request body using Joi library
- Checks:
  - `symbol` exists and is valid
  - `orderType` is "BUY" or "SELL"
  - `orderStyle` is "MARKET" or "LIMIT"
  - `quantity` > 0
  - `price` present if LIMIT order
- If invalid → Returns 400 Bad Request with error details

#### Step 5: Controller Processing
**File**: `controllers/orderController.js`
- `placeOrder` function receives validated data
- Adds `userId` from authenticated user
- Calls `orderService.placeOrder()`

#### Step 6: Service Logic
**File**: `services/orderService.js`
- Validates instrument exists (calls `instrumentService`)
- Creates order in database (`memoryStore.createOrder()`)
- Sets status to "PLACED"
- Attempts to execute order immediately (for MARKET orders)
- If executed:
  - Updates order status to "EXECUTED"
  - Creates trade record (`tradeService.createTrade()`)
  - Updates portfolio (`portfolioService.updatePortfolioAfterTrade()`)

#### Step 7: Database Operations
**File**: `database/memoryStore.js`
- Stores order in `orders` Map
- Stores trade in `trades` Map
- Updates portfolio in `portfolio` Map

#### Step 8: Response
- Service returns order object
- Controller wraps in response format
- Returns JSON with status 201 Created

---

## File-by-File Explanation

### 1. `server.js` - Main Entry Point

**Purpose**: Starts the Express server and sets up middleware

**What it does**:
```javascript
// 1. Imports Express and other packages
const express = require('express');
const cors = require('cors');        // Allows cross-origin requests
const helmet = require('helmet');    // Security headers
const morgan = require('morgan');    // Request logging

// 2. Creates Express app
const app = express();

// 3. Sets up middleware (runs on every request)
app.use(helmet());      // Security
app.use(cors());        // Allow frontend to call APIs
app.use(morgan());      // Log requests
app.use(express.json()); // Parse JSON request bodies

// 4. Mounts routes
app.use('/api/v1', routes); // All API routes under /api/v1

// 5. Starts server on port 3000
app.listen(3000);
```

**Key Points**:
- This is where the server starts
- All requests come through here first
- Middleware runs before routes

---

### 2. `config/config.js` - Configuration

**Purpose**: Stores all configuration values

**What it contains**:
```javascript
{
  port: 3000,                    // Server port
  mockUser: {                    // Hardcoded user for auth
    id: 'user_001',
    name: 'Test User'
  },
  trading: {                     // Trading rules
    maxOrderQuantity: 10000,
    supportedOrderTypes: ['BUY', 'SELL'],
    supportedOrderStyles: ['MARKET', 'LIMIT']
  }
}
```

**Why it exists**:
- Centralized configuration
- Easy to change settings
- Used by authentication and validation

---

### 3. `database/memoryStore.js` - Data Storage

**Purpose**: In-memory database using JavaScript Maps

**What it stores**:
```javascript
class MemoryStore {
  constructor() {
    this.instruments = new Map();  // All stocks
    this.orders = new Map();       // All orders
    this.trades = new Map();       // All trades
    this.portfolio = new Map();    // User holdings
  }
}
```

**Key Methods**:

1. **`getAllInstruments()`**
   - Returns array of all available stocks
   - Used by: GET /instruments

2. **`createOrder(orderData)`**
   - Creates new order with unique ID
   - Stores in `orders` Map
   - Returns order object

3. **`updateOrderStatus(orderId, status)`**
   - Changes order status (NEW → PLACED → EXECUTED)
   - Updates execution details if executed

4. **`createTrade(tradeData)`**
   - Creates trade record when order executes
   - Stores in `trades` Map

5. **`updatePortfolio(userId, symbol, quantity, price, orderType)`**
   - Updates user's holdings
   - For BUY: Adds to portfolio
   - For SELL: Removes from portfolio
   - Calculates average price

6. **`getPortfolio(userId)`**
   - Returns all holdings for a user
   - Calculates current values based on market prices

**Why Maps?**
- Fast lookups (O(1) complexity)
- Easy to store key-value pairs
- No database setup needed

---

### 4. `models/` - Data Validation

**Purpose**: Define data structure and validate inputs

**Example**: `models/Order.js`
```javascript
const orderSchema = Joi.object({
  symbol: Joi.string().required(),
  orderType: Joi.string().valid('BUY', 'SELL').required(),
  orderStyle: Joi.string().valid('MARKET', 'LIMIT').required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.when('orderStyle', {
    is: 'LIMIT',
    then: Joi.number().positive().required(),
    otherwise: Joi.optional()
  })
});
```

**What it does**:
- Validates order data before processing
- Ensures required fields are present
- Checks data types and ranges
- Returns clear error messages

**Why Joi?**
- Industry-standard validation library
- Prevents invalid data from entering system
- Provides detailed error messages

---

### 5. `middleware/auth.js` - Authentication

**Purpose**: Verify user is authenticated

**How it works**:
```javascript
const authenticateUser = (req, res, next) => {
  // 1. Get Authorization header
  const authHeader = req.headers.authorization;
  
  // 2. Check if header exists
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // 3. Validate token (mock: just check if it's "Bearer mock-token")
  if (authHeader !== 'Bearer mock-token') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  // 4. Add user to request object
  req.user = config.mockUser;
  
  // 5. Continue to next middleware/route
  next();
};
```

**Key Points**:
- Runs before controllers
- Blocks unauthorized requests
- Adds user info to request

---

### 6. `middleware/validation.js` - Input Validation

**Purpose**: Validate request data before processing

**How it works**:
```javascript
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // 1. Validate request data against schema
    const { error, value } = schema.validate(req[property]);
    
    // 2. If validation fails, return errors
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }
    
    // 3. Replace request data with validated (cleaned) data
    req[property] = value;
    next();
  };
};
```

**Usage**:
- Applied to routes that need validation
- Prevents invalid data from reaching services
- Returns detailed validation errors

---

### 7. `middleware/errorHandler.js` - Error Handling

**Purpose**: Catch and format all errors

**How it works**:
```javascript
const errorHandler = (err, req, res, next) => {
  // 1. Determine error type
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // 2. Format error response
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

**Key Features**:
- Centralized error handling
- Consistent error format
- Logs errors for debugging

---

### 8. `routes/` - API Endpoints

**Purpose**: Define URL paths and connect to controllers

**Example**: `routes/orders.js`
```javascript
const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// POST /api/v1/orders - Place order
router.post('/', validateCreateOrder, orderController.placeOrder);

// GET /api/v1/orders - Get all orders
router.get('/', orderController.getAllOrders);

// GET /api/v1/orders/:orderId - Get order by ID
router.get('/:orderId', validateOrderId, orderController.getOrderById);
```

**What it does**:
- Maps URLs to controller functions
- Applies middleware (auth, validation)
- Defines HTTP methods (GET, POST, PUT)

---

### 9. `controllers/` - Request Handlers

**Purpose**: Handle HTTP requests and responses

**Example**: `controllers/orderController.js`
```javascript
class OrderController {
  placeOrder = asyncHandler(async (req, res) => {
    // 1. Get data from request
    const orderData = {
      ...req.body,
      userId: req.user.id  // From authentication
    };
    
    // 2. Call service to process
    const order = await orderService.placeOrder(orderData);
    
    // 3. Return response
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  });
}
```

**Key Responsibilities**:
- Extract data from request
- Call appropriate service
- Format response
- Handle HTTP status codes

**Why asyncHandler?**
- Wraps async functions
- Automatically catches errors
- Sends errors to error handler

---

### 10. `services/` - Business Logic

**Purpose**: Contains trading logic and business rules

**Example**: `services/orderService.js`

**Key Methods**:

1. **`placeOrder(orderData)`**
   ```javascript
   async placeOrder(orderData) {
     // 1. Validate instrument exists
     if (!instrumentService.validateInstrument(orderData.symbol)) {
       throw new AppError('Invalid symbol');
     }
     
     // 2. Create order in database
     const order = memoryStore.createOrder({
       ...orderData,
       status: 'NEW'
     });
     
     // 3. Update status to PLACED
     memoryStore.updateOrderStatus(order.id, 'PLACED');
     
     // 4. Try to execute (for MARKET orders)
     const executedOrder = await this.attemptOrderExecution(order.id);
     
     return executedOrder || order;
   }
   ```

2. **`attemptOrderExecution(orderId)`**
   ```javascript
   async attemptOrderExecution(orderId) {
     // 1. Get order
     const order = memoryStore.getOrderById(orderId);
     
     // 2. Get current market price
     const currentPrice = instrumentService.getCurrentPrice(order.symbol);
     
     // 3. Check if can execute
     if (order.orderStyle === 'MARKET') {
       canExecute = true;  // MARKET orders execute immediately
     } else {
       // LIMIT orders: check price conditions
       canExecute = canExecuteLimitOrder(order, currentPrice);
     }
     
     // 4. If can execute
     if (canExecute) {
       // Calculate execution price
       const executionPrice = calculateExecutionPrice(order, currentPrice);
       
       // Update order status
       memoryStore.updateOrderStatus(orderId, 'EXECUTED', {
         executedPrice: executionPrice
       });
       
       // Create trade record
       tradeService.createTrade({...});
       
       // Update portfolio
       portfolioService.updatePortfolioAfterTrade(...);
     }
   }
   ```

**Key Points**:
- Contains all trading rules
- Orchestrates multiple operations
- Handles complex business logic

---

### 11. `utils/constants.js` - Constants

**Purpose**: Store fixed values used throughout the app

**What it contains**:
```javascript
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
```

**Why it exists**:
- Avoid typos (use constants instead of strings)
- Easy to change values in one place
- Better code readability

---

### 12. `utils/helpers.js` - Utility Functions

**Purpose**: Reusable helper functions

**Key Functions**:

1. **`calculateExecutionPrice(order, currentPrice)`**
   - For MARKET orders: Uses current price (with small slippage)
   - For LIMIT orders: Uses order's limit price

2. **`canExecuteLimitOrder(order, currentPrice)`**
   - BUY LIMIT: Executes if market price <= limit price
   - SELL LIMIT: Executes if market price >= limit price

3. **`generatePriceVariation(basePrice)`**
   - Simulates price fluctuations
   - Adds random variation to prices

4. **`paginate(data, page, limit)`**
   - Splits large arrays into pages
   - Returns pagination metadata

---

## Key Features Implementation

### Feature 1: Order Execution Logic

**Where**: `services/orderService.js` → `attemptOrderExecution()`

**How it works**:

1. **MARKET Orders**:
   ```javascript
   if (order.orderStyle === 'MARKET') {
     // Execute immediately
     canExecute = true;
     executionPrice = calculateExecutionPrice(order, currentPrice);
   }
   ```

2. **LIMIT Orders**:
   ```javascript
   if (order.orderStyle === 'LIMIT') {
     if (order.orderType === 'BUY') {
       // Execute if market price is at or below limit
       canExecute = currentPrice <= order.price;
     } else {
       // SELL: Execute if market price is at or above limit
       canExecute = currentPrice >= order.price;
     }
   }
   ```

**Why this matters**:
- MARKET orders = immediate execution
- LIMIT orders = wait for price conditions
- Simulates real trading behavior

---

### Feature 2: Portfolio Management

**Where**: `services/portfolioService.js` → `updatePortfolioAfterTrade()`

**How it works**:

1. **BUY Order**:
   ```javascript
   if (orderType === 'BUY') {
     // Calculate new average price
     totalInvestment = oldInvestment + (quantity × price);
     totalQuantity = oldQuantity + quantity;
     averagePrice = totalInvestment / totalQuantity;
     
     // Update portfolio
     portfolio.quantity = totalQuantity;
     portfolio.averagePrice = averagePrice;
   }
   ```

2. **SELL Order**:
   ```javascript
   if (orderType === 'SELL') {
     // Check if user has enough shares
     if (currentQuantity < quantity) {
       throw new Error('Insufficient quantity');
     }
     
     // Reduce quantity (keep average price same)
     portfolio.quantity = currentQuantity - quantity;
   }
   ```

**Key Concept**: **Weighted Average Price**
- When you buy at different prices, average price is calculated
- Example:
  - Buy 10 shares at ₹100 = Average: ₹100
  - Buy 10 more at ₹120 = Average: ₹110 (weighted)

---

### Feature 3: Trade Record Creation

**Where**: `services/tradeService.js` → `createTrade()`

**When**: Automatically created when order executes

**How it works**:
```javascript
createTrade(tradeData) {
  // Calculate total amount
  const totalAmount = tradeData.quantity × tradeData.price;
  
  // Generate unique trade reference
  const tradeReference = generateTradeReference();
  
  // Create trade record
  const trade = memoryStore.createTrade({
    ...tradeData,
    totalAmount,
    tradeReference,
    executedAt: new Date()
  });
  
  return trade;
}
```

**Key Points**:
- Trade = Executed order
- Contains execution details (price, quantity, time)
- Linked to order via `orderId`

---

### Feature 4: Input Validation

**Where**: `middleware/validation.js` + `models/Order.js`

**What it validates**:

1. **Required Fields**:
   - `symbol`: Must exist
   - `orderType`: Must be BUY or SELL
   - `orderStyle`: Must be MARKET or LIMIT
   - `quantity`: Must be > 0

2. **Conditional Validation**:
   - `price`: Required ONLY for LIMIT orders
   - For MARKET orders, price is optional

3. **Data Types**:
   - `quantity`: Must be integer
   - `price`: Must be positive number

**Error Response**:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "quantity",
      "message": "Quantity must be at least 1"
    }
  ]
}
```

---

### Feature 5: Error Handling

**Where**: `middleware/errorHandler.js`

**How it works**:

1. **Custom Errors**:
   ```javascript
   class AppError extends Error {
     constructor(message, statusCode = 500) {
       super(message);
       this.statusCode = statusCode;
     }
   }
   ```

2. **Error Handler**:
   ```javascript
   const errorHandler = (err, req, res, next) => {
     const statusCode = err.statusCode || 500;
     const message = err.message || 'Internal Server Error';
     
     res.status(statusCode).json({
       error: message,
       timestamp: new Date().toISOString()
     });
   };
   ```

**Error Types**:
- **400 Bad Request**: Validation errors, invalid input
- **401 Unauthorized**: Missing/invalid authentication
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server errors

---

## Trading Workflow Explained

### Complete Example: User Buys 10 Shares of RELIANCE

#### Step 1: User Views Instruments
**API**: `GET /api/v1/instruments`
**Flow**:
1. Request → `routes/instruments.js`
2. No auth needed (public endpoint)
3. `instrumentController.getAllInstruments()`
4. `instrumentService.getAllInstruments()`
5. `memoryStore.getAllInstruments()`
6. Returns list of 5 instruments

**Response**: User sees RELIANCE at ₹2,450.75

---

#### Step 2: User Places BUY Order
**API**: `POST /api/v1/orders`
**Request Body**:
```json
{
  "symbol": "RELIANCE",
  "orderType": "BUY",
  "orderStyle": "MARKET",
  "quantity": 10
}
```

**Flow**:
1. Request arrives → `server.js`
2. Routes to → `routes/orders.js`
3. Auth check → `middleware/auth.js` (validates token)
4. Validation → `middleware/validation.js` (validates body)
5. Controller → `orderController.placeOrder()`
6. Service → `orderService.placeOrder()`
   - Validates RELIANCE exists
   - Creates order with status "NEW"
   - Updates to "PLACED"
   - Attempts execution (MARKET = immediate)
7. Execution:
   - Gets current price: ₹2,450.75
   - Calculates execution price
   - Updates order to "EXECUTED"
   - Creates trade record
   - Updates portfolio
8. Response → Returns order with execution details

**Result**: Order executed, trade created, portfolio updated

---

#### Step 3: User Checks Order Status
**API**: `GET /api/v1/orders/{orderId}`
**Flow**:
1. Request with order ID
2. Auth check
3. `orderController.getOrderById()`
4. `orderService.getOrderById()`
5. `memoryStore.getOrderById()`
6. Returns order with status "EXECUTED"

**Response**: Shows order is executed at ₹2,450.75

---

#### Step 4: User Views Trades
**API**: `GET /api/v1/trades`
**Flow**:
1. Auth check
2. `tradeController.getAllTrades()`
3. `tradeService.getAllTrades()`
4. `memoryStore.getAllTrades()`
5. Returns all executed trades

**Response**: Shows the RELIANCE trade

---

#### Step 5: User Views Portfolio
**API**: `GET /api/v1/portfolio`
**Flow**:
1. Auth check
2. `portfolioController.getPortfolio()`
3. `portfolioService.getPortfolio()`
4. `memoryStore.getPortfolio()`
5. Calculates current values
6. Returns holdings

**Response**:
```json
{
  "holdings": [{
    "symbol": "RELIANCE",
    "quantity": 10,
    "averagePrice": 2450.75,
    "currentValue": 24507.5
  }]
}
```

---

## Interview Preparation Points

### 1. Architecture Questions

**Q: Why did you use MVC pattern?**
**A**: 
- Separation of concerns: Routes handle URLs, Controllers handle HTTP, Services handle business logic
- Maintainability: Easy to find and modify code
- Testability: Can test each layer independently
- Scalability: Easy to add new features

**Q: Why in-memory storage instead of database?**
**A**:
- Assignment requirement (lightweight storage)
- Faster for demo/testing
- No setup needed
- Sufficient for single-user simulation
- Trade-off: Data lost on restart (acceptable for assignment)

---

### 2. Trading Logic Questions

**Q: How do MARKET orders execute?**
**A**:
- MARKET orders execute immediately at current market price
- No price specified by user
- Execution happens in `attemptOrderExecution()` method
- Price may have small slippage (simulation)

**Q: How do LIMIT orders work?**
**A**:
- LIMIT orders wait for price conditions
- BUY LIMIT: Executes when market price ≤ limit price
- SELL LIMIT: Executes when market price ≥ limit price
- Can be manually processed via `/orders/process-pending` endpoint

**Q: How is average price calculated?**
**A**:
- Weighted average method
- Formula: `(oldInvestment + newInvestment) / (oldQuantity + newQuantity)`
- Example: Buy 10 at ₹100, then 10 at ₹120 = Average ₹110

---

### 3. Code Structure Questions

**Q: What is the role of middleware?**
**A**:
- Functions that run before/after requests
- `auth.js`: Validates authentication
- `validation.js`: Validates input data
- `errorHandler.js`: Catches and formats errors
- Runs in sequence before reaching controllers

**Q: Why separate services from controllers?**
**A**:
- Controllers: HTTP-specific (request/response handling)
- Services: Business logic (reusable, testable)
- Separation allows services to be used by multiple controllers
- Makes code more modular

**Q: How does error handling work?**
**A**:
- Centralized in `errorHandler.js`
- Uses Express error middleware
- Catches errors from any layer
- Formats consistent error responses
- Returns appropriate HTTP status codes

---

### 4. Data Flow Questions

**Q: What happens when a user places an order?**
**A**:
1. Request validated (auth + input)
2. Order created in database (status: NEW)
3. Status updated to PLACED
4. Execution attempted (MARKET = immediate)
5. If executed:
   - Order status → EXECUTED
   - Trade record created
   - Portfolio updated
6. Response returned to user

**Q: How is portfolio updated after a trade?**
**A**:
- `portfolioService.updatePortfolioAfterTrade()` called
- For BUY: Adds to holdings, recalculates average price
- For SELL: Reduces quantity, validates sufficient holdings
- Updates stored in `memoryStore.portfolio` Map

---

### 5. Technical Questions

**Q: Why use JavaScript Maps for storage?**
**A**:
- Fast lookups (O(1) complexity)
- Key-value structure perfect for IDs
- No database setup needed
- Easy to implement
- Sufficient for in-memory storage

**Q: How does authentication work?**
**A**:
- Mock authentication (not real JWT)
- Checks `Authorization: Bearer mock-token` header
- If valid, adds user object to request
- Single hardcoded user (`user_001`)
- All authenticated endpoints use this user

**Q: What validation is performed?**
**A**:
- Input validation using Joi library
- Required fields check
- Data type validation
- Range validation (quantity > 0)
- Conditional validation (price for LIMIT orders)
- Returns detailed error messages

---

### 6. Design Decisions

**Q: Why RESTful API design?**
**A**:
- Standard HTTP methods (GET, POST, PUT)
- Resource-based URLs (`/orders`, `/trades`)
- Stateless (each request independent)
- Easy to understand and use
- Industry standard

**Q: How did you handle order execution?**
**A**:
- MARKET orders: Immediate execution
- LIMIT orders: Price condition checking
- Execution logic in `orderService.attemptOrderExecution()`
- Automatically creates trades and updates portfolio
- Simulates real trading behavior

---

### 7. Key Files to Remember

**Must Know**:
1. `server.js` - Entry point, middleware setup
2. `routes/orders.js` - Order endpoints
3. `controllers/orderController.js` - Order request handling
4. `services/orderService.js` - Order business logic
5. `database/memoryStore.js` - Data storage
6. `middleware/auth.js` - Authentication
7. `middleware/validation.js` - Input validation

**Good to Know**:
- `models/Order.js` - Data validation
- `services/tradeService.js` - Trade creation
- `services/portfolioService.js` - Portfolio management
- `utils/helpers.js` - Utility functions

---

### 8. Common Interview Scenarios

**Scenario 1: "Explain how a BUY order works"**
1. User sends POST request with order details
2. System validates authentication and input
3. Order created with status NEW → PLACED
4. For MARKET orders, execution attempted immediately
5. If executed: Trade created, portfolio updated
6. Response returned with order details

**Scenario 2: "How would you add a new feature?"**
1. Add route in `routes/`
2. Add controller method in `controllers/`
3. Add service logic in `services/`
4. Update database methods if needed
5. Add validation in `models/` if needed

**Scenario 3: "What if you need to persist data?"**
1. Replace `memoryStore` with database (MongoDB, PostgreSQL)
2. Update all database methods to use DB queries
3. Add connection handling
4. Keep same service/controller structure

---

## Quick Reference

### API Endpoints
- `GET /api/v1/instruments` - View stocks
- `POST /api/v1/orders` - Place order
- `GET /api/v1/orders/{orderId}` - Check status
- `GET /api/v1/trades` - View trades
- `GET /api/v1/portfolio` - View holdings

### Key Concepts
- **Instruments** = Stocks you can trade
- **Orders** = Requests to buy/sell
- **Trades** = Executed orders
- **Portfolio** = Your current holdings

### Data Flow
Request → Routes → Middleware → Controllers → Services → Database → Response

### Order Status Flow
NEW → PLACED → EXECUTED (or CANCELLED)

---

## Final Tips for Interview

1. **Start High-Level**: Explain the overall system first
2. **Then Details**: Go into specific implementations
3. **Use Examples**: Reference actual code/files
4. **Be Honest**: If you don't know, say so
5. **Show Understanding**: Explain WHY you made decisions
6. **Think Aloud**: Walk through your thought process

**Good luck with your interview! 🚀**

