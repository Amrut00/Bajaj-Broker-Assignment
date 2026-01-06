# Bajaj Trading SDK - Backend API

## Setup and Run Instructions

### Prerequisites
- Node.js (>=16.0.0)
- npm

### Installation
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Verifying Installation
Test the health check endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Bajaj Trading SDK is running!"
}
```

---

## API Details

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All endpoints except instrument viewing require authentication. Use the following mock token in the Authorization header:

```
Authorization: Bearer mock-token
```

### Required APIs

#### 1. View Available Financial Instruments
**Endpoint**: `GET /api/v1/instruments`

**Description**: Fetch list of tradable instruments

**Request**:
- Method: `GET`
- URL: `http://localhost:3000/api/v1/instruments`
- Headers: None required

**Response**:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "instruments": [
      {
        "symbol": "RELIANCE",
        "exchange": "NSE",
        "instrumentType": "EQUITY",
        "lastTradedPrice": 2450.75
      },
      {
        "symbol": "TCS",
        "exchange": "NSE",
        "instrumentType": "EQUITY",
        "lastTradedPrice": 3890.20
      }
    ],
    "total": 5
  }
}
```

**Sample Request**:
```bash
curl -X GET http://localhost:3000/api/v1/instruments
```

---

#### 2. Place Buy and Sell Orders
**Endpoint**: `POST /api/v1/orders`

**Description**: Place a new order (BUY or SELL)

**Request**:
- Method: `POST`
- URL: `http://localhost:3000/api/v1/orders`
- Headers:
  - `Authorization: Bearer mock-token`
  - `Content-Type: application/json`
- Body:
```json
{
  "symbol": "RELIANCE",
  "orderType": "BUY",
  "orderStyle": "MARKET",
  "quantity": 10
}
```

**Order Types**: `BUY` or `SELL`
**Order Styles**: `MARKET` or `LIMIT`
**Mandatory Fields**:
- `quantity` (must be > 0)
- `price` (mandatory for LIMIT orders)

**Response**:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "symbol": "RELIANCE",
      "orderType": "BUY",
      "orderStyle": "MARKET",
      "quantity": 10,
      "status": "EXECUTED",
      "executedPrice": 2450.75,
      "executedQuantity": 10
    }
  }
}
```

**Sample Request**:
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer mock-token" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "orderType": "BUY",
    "orderStyle": "MARKET",
    "quantity": 10
  }'
```

**Sample Request (LIMIT Order)**:
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Authorization: Bearer mock-token" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TCS",
    "orderType": "BUY",
    "orderStyle": "LIMIT",
    "quantity": 5,
    "price": 3800
  }'
```

---

#### 3. Check Order Status
**Endpoint**: `GET /api/v1/orders/{orderId}`

**Description**: Fetch order status by order ID

**Supported Order States**:
- `NEW`
- `PLACED`
- `EXECUTED`
- `CANCELLED`

**Request**:
- Method: `GET`
- URL: `http://localhost:3000/api/v1/orders/{orderId}`
- Headers:
  - `Authorization: Bearer mock-token`
- Path Parameter: Replace `{orderId}` with actual order ID

**Response**:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "order": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "symbol": "RELIANCE",
      "orderType": "BUY",
      "orderStyle": "MARKET",
      "quantity": 10,
      "status": "EXECUTED",
      "executedPrice": 2450.75,
      "executedQuantity": 10
    }
  }
}
```

**Sample Request**:
```bash
curl -X GET http://localhost:3000/api/v1/orders/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer mock-token"
```

---

#### 4. View Executed Trades
**Endpoint**: `GET /api/v1/trades`

**Description**: Fetch list of executed trades for the user

**Request**:
- Method: `GET`
- URL: `http://localhost:3000/api/v1/trades`
- Headers:
  - `Authorization: Bearer mock-token`

**Response**:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "trades": [
      {
        "id": "trade-uuid-1",
        "orderId": "550e8400-e29b-41d4-a716-446655440000",
        "symbol": "RELIANCE",
        "orderType": "BUY",
        "quantity": 10,
        "price": 2450.75,
        "totalAmount": 24507.5,
        "executedAt": "2024-01-05T20:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

**Sample Request**:
```bash
curl -X GET http://localhost:3000/api/v1/trades \
  -H "Authorization: Bearer mock-token"
```

---

#### 5. Fetch Portfolio Holdings
**Endpoint**: `GET /api/v1/portfolio`

**Description**: Fetch current portfolio holdings

**Request**:
- Method: `GET`
- URL: `http://localhost:3000/api/v1/portfolio`
- Headers:
  - `Authorization: Bearer mock-token`

**Response**:
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "portfolio": {
      "holdings": [
        {
          "symbol": "RELIANCE",
          "quantity": 10,
          "averagePrice": 2450.75,
          "currentValue": 24507.5
        }
      ],
      "summary": {
        "totalHoldings": 1,
        "totalInvestment": 24507.5,
        "totalCurrentValue": 24507.5
      }
    }
  }
}
```

**Portfolio Fields**:
- `symbol` - Instrument symbol
- `quantity` - Number of shares held
- `averagePrice` - Average purchase price
- `currentValue` - Current market value

**Sample Request**:
```bash
curl -X GET http://localhost:3000/api/v1/portfolio \
  -H "Authorization: Bearer mock-token"
```

---

## Assumptions Made During Implementation

1. **Mock Authentication**: Single hardcoded user (`user_001`) is used for all authenticated requests. Authentication is validated using a mock token (`Bearer mock-token`). No real JWT or session-based authentication is implemented.

2. **In-Memory Storage**: All data (instruments, orders, trades, portfolio) is stored in-memory using JavaScript Maps. Data is lost when the server restarts. No persistent database is used.

3. **Order Execution**: MARKET orders execute immediately at the current market price. LIMIT orders remain in PLACED status until price conditions are met (can be manually processed via `/orders/process-pending` endpoint).

4. **Price Simulation**: Instrument prices are static with optional random variations (10% chance on each request). No real-time market data integration. Prices are initialized with sample values and may fluctuate slightly for demonstration purposes.

5. **Single User System**: The system supports only one user (hardcoded `user_001`). All orders, trades, and portfolio data belong to this single user.

6. **No Balance Validation**: The system does not validate or track user account balance. Orders are placed and executed without checking available funds.

7. **Portfolio Calculation**: Average price is calculated using weighted average method. Current value is calculated based on current market price multiplied by quantity.

8. **Order Validation**: Basic validations are performed:
   - Quantity must be greater than 0
   - Price is mandatory for LIMIT orders
   - Symbol must exist in the instruments list
   - SELL orders require sufficient holdings in portfolio

9. **Trade Creation**: A trade record is automatically created when an order status changes to EXECUTED. Each trade is linked to its parent order via `orderId`.

10. **No Market Hours**: The system operates 24/7 with no market hours restrictions. Orders can be placed at any time.

11. **Currency**: All prices and amounts are in INR (Indian Rupees). No multi-currency support.

12. **No Short Selling**: Only long positions are supported. Users can only SELL instruments they already own (have in portfolio).

13. **Sample Instruments**: The system is pre-populated with 5 sample instruments: RELIANCE, TCS, INFY, HDFC, ICICIBANK. These are the only tradable instruments available.

14. **Error Handling**: Errors return appropriate HTTP status codes (400 for validation errors, 401 for authentication errors, 404 for not found, 500 for server errors) with JSON error messages.

15. **RESTful Design**: All APIs follow RESTful principles with proper HTTP methods (GET, POST, PUT) and resource-based URLs.
