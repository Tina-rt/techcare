# Quick Start Guide - Cart, Order & Payment Microservices

## Prerequisites
- ✅ Node.js installed
- ✅ MongoDB running (docker-compose up -d)
- ✅ RabbitMQ running (port 5672)
- ⚠️ Stripe account (for payments)

## Step 1: Install Dependencies
```bash
npm install
```
*(Already includes stripe and @types/stripe)*

## Step 2: Configure Stripe
1. Sign up at [stripe.com](https://stripe.com)
2. Get your test API key from [dashboard](https://dashboard.stripe.com/apikeys)
3. Update `.env`:
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

## Step 3: Start All Services
```bash
npm run dev
```

This starts:
- Gateway (4000)
- User Service
- Product Manager (3002)
- Notification Manager
- File Manager
- Inventory Manager
- **Cart Manager (3007)** ⭐
- **Order Manager (3008)** ⭐
- **Payment Manager (3009)** ⭐

## Step 4: Test the Flow

### 1. Add to Cart
```bash
curl -X POST http://localhost:4000/cart/add \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "productId": "prod1",
    "quantity": 2,
    "price": 29.99,
    "name": "Test Product"
  }'
```

### 2. View Cart
```bash
curl http://localhost:4000/cart/user123
```

### 3. Create Order
```bash
curl -X POST http://localhost:4000/order/create \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "shippingAddress": {
      "fullName": "John Doe",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postalCode": "10001",
      "country": "USA"
    }
  }'
```

*Save the returned `orderId` for next step*

### 4. Create Payment
```bash
curl -X POST http://localhost:4000/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID_FROM_STEP_3",
    "amount": 59.98,
    "currency": "usd"
  }'
```

*Returns `clientSecret` for frontend integration*

### 5. Check Order
```bash
curl http://localhost:4000/order/ORDER_ID
```

## Alternative: Use HTTP Test File

Open `test-cart-order-payment.http` in VS Code with REST Client extension and execute requests directly.

## Verify Services Running

Check console output for:
```
[CART_MANAGER] is running and listening for RabbitMQ messages
[ORDER_MANAGER] is running and listening for RabbitMQ messages
[PAYMENT_MANAGER] is running and listening for RabbitMQ messages
```

## Common Commands

```bash
# Start only cart service
npm run start:dev cart-manager

# Start only order service
npm run start:dev order-manager

# Start only payment service
npm run start:dev payment-manager

# Start all services
npm run dev
```

## Troubleshooting

### Port already in use
Kill the process or stop existing dev server:
```bash
# Find process on port 3007 (cart)
lsof -ti:3007 | xargs kill -9
```

### MongoDB connection error
```bash
# Start MongoDB via docker
docker-compose up -d mongodb
```

### RabbitMQ connection error
```bash
# Start RabbitMQ via docker
docker-compose up -d rabbitmq
```

### Stripe errors
- Verify keys in `.env`
- Use test keys (sk_test_...)
- Check balance in Stripe dashboard

## Next Steps

1. **Frontend Integration**: See `CART_ORDER_PAYMENT_README.md` for Stripe.js integration
2. **Webhook Setup**: Configure Stripe webhooks for production
3. **Authentication**: Add JWT middleware to protect endpoints
4. **Testing**: Write unit and integration tests

## Documentation

- 📖 Full API documentation: `CART_ORDER_PAYMENT_README.md`
- 📊 Implementation summary: `IMPLEMENTATION_SUMMARY.md`
- 🧪 Test requests: `test-cart-order-payment.http`
- 🏗️ Architecture diagram: See generated image

## Support

For issues or questions:
1. Check the README files
2. Review console logs
3. Verify environment configuration
4. Check Stripe dashboard for payment issues

---

**Ready to go!** 🚀
Start with `npm run dev` and test the endpoints.
