ws# Postman Commands - 5 Required APIs

## 🚀 Quick Setup (2 minutes)

### Step 1: Create Environment
1. Open Postman
2. Click **Environments** (left sidebar) → Click **+** button
3. Name: `Bajaj Trading SDK`
4. Add these 3 variables:

| Variable Name | Initial Value | Current Value |
|---------------|---------------|---------------|
| `baseURL` | `http://localhost:3000` | `http://localhost:3000` |
| `apiBase` | `http://localhost:3000/api/v1` | `http://localhost:3000/api/v1` |
| `authToken` | `Bearer mock-token` | `Bearer mock-token` |

5. Click **Save**
6. **Select this environment** from dropdown (top right corner)

---

## 📡 5 Required APIs - Exact Postman Commands

### API 1: View Available Financial Instruments ✅

**Request Setup:**
- **Method**: Select `GET` from dropdown
- **URL**: Type `{{apiBase}}/instruments`
  - Postman will automatically replace `{{apiBase}}` with `http://localhost:3000/api/v1`
- **Headers**: None needed (leave empty)
- **Body**: None (select "None" tab)

**Click "Send"**

**Expected Response:**
- Status: `200 OK`
- You should see 5 instruments: RELIANCE, TCS, INFY, HDFC, ICICIBANK

---

### API 2: Place Buy Order ✅

**Request Setup:**
- **Method**: Select `POST` from dropdown
- **URL**: Type `{{apiBase}}/orders`
- **Headers**: 
  - Click **Headers** tab
  - Add these 2 headers:
    - Key: `Authorization` | Value: `{{authToken}}`
    - Key: `Content-Type` | Value: `application/json`
- **Body**: 
  - Click **Body** tab
  - Select **raw** radio button
  - Select **JSON** from dropdown (right side)
  - Paste this JSON:
```json
{
  "symbol": "RELIANCE",
  "orderType": "BUY",
  "orderStyle": "MARKET",
  "quantity": 10
}
```

**Click "Send"**

**Expected Response:**
- Status: `201 Created`
- **IMPORTANT**: Copy the `id` from the response (you'll need it for API 3)
- Example: `"id": "550e8400-e29b-41d4-a716-446655440000"`

---

### API 3: Check Order Status ✅

**Request Setup:**
- **Method**: Select `GET` from dropdown
- **URL**: Type `{{apiBase}}/orders/{orderId}`
  - Replace `{orderId}` with the actual order ID from API 2
  - Example: `{{apiBase}}/orders/550e8400-e29b-41d4-a716-446655440000`
- **Headers**: 
  - Click **Headers** tab
  - Add this header:
    - Key: `Authorization` | Value: `{{authToken}}`
- **Body**: None (select "None" tab)

**Click "Send"**

**Expected Response:**
- Status: `200 OK`
- You should see order details with `status: "EXECUTED"`

---

### API 4: View Executed Trades ✅

**Request Setup:**
- **Method**: Select `GET` from dropdown
- **URL**: Type `{{apiBase}}/trades`
- **Headers**: 
  - Click **Headers** tab
  - Add this header:
    - Key: `Authorization` | Value: `{{authToken}}`
- **Body**: None (select "None" tab)

**Click "Send"**

**Expected Response:**
- Status: `200 OK`
- You should see the trade from API 2 in the list

---

### API 5: Fetch Portfolio Holdings ✅

**Request Setup:**
- **Method**: Select `GET` from dropdown
- **URL**: Type `{{apiBase}}/portfolio`
- **Headers**: 
  - Click **Headers** tab
  - Add this header:
    - Key: `Authorization` | Value: `{{authToken}}`
- **Body**: None (select "None" tab)

**Click "Send"**

**Expected Response:**
- Status: `200 OK`
- You should see RELIANCE in holdings with:
  - `symbol`: "RELIANCE"
  - `quantity`: 10
  - `averagePrice`: (some number)
  - `currentValue`: (some number)

---

## 🔄 Complete Flow (Copy-Paste Ready)

### Step 1: Health Check (Optional)
```
Method: GET
URL: {{baseURL}}/health
Headers: None
Body: None
```

### Step 2: View Instruments
```
Method: GET
URL: {{apiBase}}/instruments
Headers: None
Body: None
```

### Step 3: Place Buy Order
```
Method: POST
URL: {{apiBase}}/orders
Headers:
  Authorization: {{authToken}}
  Content-Type: application/json
Body (raw JSON):
{
  "symbol": "RELIANCE",
  "orderType": "BUY",
  "orderStyle": "MARKET",
  "quantity": 10
}
```

### Step 4: Check Order Status
```
Method: GET
URL: {{apiBase}}/orders/{PASTE_ORDER_ID_HERE}
Headers:
  Authorization: {{authToken}}
Body: None
```

### Step 5: View Trades
```
Method: GET
URL: {{apiBase}}/trades
Headers:
  Authorization: {{authToken}}
Body: None
```

### Step 6: View Portfolio
```
Method: GET
URL: {{apiBase}}/portfolio
Headers:
  Authorization: {{authToken}}
Body: None
```

---

## 📋 Quick Reference Table

| API # | Method | URL | Headers | Body |
|-------|--------|-----|---------|------|
| 1. Instruments | GET | `{{apiBase}}/instruments` | None | None |
| 2. Place Order | POST | `{{apiBase}}/orders` | `Authorization: {{authToken}}`<br>`Content-Type: application/json` | JSON (see below) |
| 3. Order Status | GET | `{{apiBase}}/orders/{orderId}` | `Authorization: {{authToken}}` | None |
| 4. View Trades | GET | `{{apiBase}}/trades` | `Authorization: {{authToken}}` | None |
| 5. Portfolio | GET | `{{apiBase}}/portfolio` | `Authorization: {{authToken}}` | None |

---

## 📝 JSON Body for Place Order

### Buy Market Order:
```json
{
  "symbol": "RELIANCE",
  "orderType": "BUY",
  "orderStyle": "MARKET",
  "quantity": 10
}
```

### Buy Limit Order (Alternative):
```json
{
  "symbol": "TCS",
  "orderType": "BUY",
  "orderStyle": "LIMIT",
  "quantity": 5,
  "price": 3800
}
```

### Sell Market Order (After buying first):
```json
{
  "symbol": "RELIANCE",
  "orderType": "SELL",
  "orderStyle": "MARKET",
  "quantity": 3
}
```

---

## ⚠️ Common Mistakes to Avoid

1. **Forgot to select environment** - Make sure "Bajaj Trading SDK" is selected in top right
2. **Wrong URL format** - Use `{{apiBase}}` not `http://localhost:3000/api/v1` directly
3. **Missing Authorization header** - APIs 2-5 require `Authorization: {{authToken}}`
4. **Wrong Content-Type** - For POST requests, use `application/json`
5. **Body not in JSON format** - Make sure Body tab is set to "raw" and "JSON"
6. **Order ID not replaced** - In API 3, replace `{orderId}` with actual ID from API 2

---

## 🎯 Testing Checklist

- [ ] Environment created and selected
- [ ] API 1: Instruments returns 200 OK with 5 instruments
- [ ] API 2: Place order returns 201 Created with order ID
- [ ] API 3: Order status shows EXECUTED status
- [ ] API 4: Trades list shows the executed trade
- [ ] API 5: Portfolio shows RELIANCE holding with all required fields

---

## 💡 Pro Tips

1. **Save Requests**: Right-click each request → "Save" to create a collection
2. **Use Variables**: The `{{apiBase}}` and `{{authToken}}` will auto-fill
3. **Copy Order ID**: After API 2, copy the `id` field from response
4. **Test in Sequence**: Run APIs 1→2→3→4→5 in order for best results
5. **Check Status Code**: Green = Success, Red = Error

---

## 🚨 Troubleshooting

**Problem**: "Cannot GET /api/v1/instruments"
- **Solution**: Make sure server is running on port 3000

**Problem**: "401 Unauthorized"
- **Solution**: Add `Authorization: {{authToken}}` header

**Problem**: "400 Bad Request"
- **Solution**: Check JSON body format, ensure all required fields present

**Problem**: Variables not working (`{{apiBase}}` shows as text)
- **Solution**: Make sure environment is selected in top right dropdown

---

**Ready to test! Start with API 1 and work through sequentially.** 🚀

