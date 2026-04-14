# Cart, Order, and Payment Microservices

This document describes the implementation of three new microservices integrated into the TechCare platform:
- **Cart Manager**: Shopping cart management
- **Order Manager**: Order processing and tracking
- **Payment Manager**: Payment processing with Stripe integration

## Architecture Overview

All three microservices follow the same architectural pattern:
- **Communication**: RabbitMQ for inter-service messaging
- **Database**: MongoDB for data persistence
- **API Gateway**: HTTP REST endpoints exposed through the main gateway
- **Ports**: 
  - Cart Manager: 3007
  - Order Manager: 3008
  - Payment Manager: 3009

## Cart Manager

### Features
- Add items to cart
- Update item quantities
- Remove items from cart
- Clear entire cart
- Get cart by user ID

### API Endpoints (via Gateway)

#### Add to Cart
```http
POST http://localhost:4000/cart/add
Content-Type: application/json

{
  "userId": "user123",
  "productId": "prod456",
  "quantity": 2,
  "price": 29.99,
  "name": "Product Name",
  "image": "https://example.com/image.jpg"
}
```

#### Get Cart
```http
GET http://localhost:4000/cart/:userId
```

#### Update Cart Item
```http
PUT http://localhost:4000/cart/update
Content-Type: application/json

{
  "userId": "user123",
  "productId": "prod456",
  "quantity": 3
}
```

#### Remove from Cart
```http
DELETE http://localhost:4000/cart/remove
Content-Type: application/json

{
  "userId": "user123",
  "productId": "prod456"
}
```

#### Clear Cart
```http
DELETE http://localhost:4000/cart/clear/:userId
```

## Order Manager

### Features
- Create orders from cart
- Track order status
- Update order status (admin)
- Get user orders
- Get all orders (admin)
- Cancel orders
- Payment status tracking

### Order Statuses
- `pending`: Order created, awaiting payment
- `processing`: Payment confirmed, order being processed
- `confirmed`: Order confirmed
- `shipped`: Order shipped
- `delivered`: Order delivered
- `cancelled`: Order cancelled

### Payment Statuses
- `pending`: Awaiting payment
- `completed`: Payment successful
- `failed`: Payment failed
- `refunded`: Payment refunded

### API Endpoints (via Gateway)

#### Create Order
```http
POST http://localhost:4000/order/create
Content-Type: application/json

{
  "userId": "user123",
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "notes": "Please deliver before 5 PM"
}
```

#### Get Order by ID
```http
GET http://localhost:4000/order/:orderId
```

#### Get User Orders
```http
GET http://localhost:4000/order/user/:userId
```

#### Get All Orders
```http
GET http://localhost:4000/order
```

#### Update Order Status
```http
PUT http://localhost:4000/order/status
Content-Type: application/json

{
  "orderId": "order123",
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

#### Cancel Order
```http
PUT http://localhost:4000/order/cancel/:orderId
```

## Payment Manager (Stripe Integration)

### Features
- Create Stripe payment intents
- Confirm payments
- Process refunds
- Handle Stripe webhooks
- Automatic order status updates

### API Endpoints (via Gateway)

#### Create Payment Intent
```http
POST http://localhost:4000/payment/create-intent
Content-Type: application/json

{
  "orderId": "order123",
  "amount": 99.99,
  "currency": "usd"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

#### Confirm Payment
```http
POST http://localhost:4000/payment/confirm
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx",
  "orderId": "order123"
}
```

#### Refund Payment
```http
POST http://localhost:4000/payment/refund
Content-Type: application/json

{
  "paymentIntentId": "pi_xxx"
}
```

#### Get Payment Intent
```http
GET http://localhost:4000/payment/intent/:paymentIntentId
```

### Stripe Webhook Setup

The payment manager exposes a webhook endpoint for Stripe events:

```http
POST http://localhost:3009/payment/webhook
```

To set up webhooks:

1. Go to [Stripe Dashboard > Developers > Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `http://your-domain.com/payment/webhook`
3. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

## Configuration

### Environment Variables

Update your `.env` file:

```bash
# Database
DATABASE_URL="postgresql://postgres:tinatina@localhost:5432/pharmatech"

# Stripe Configuration
# Get your keys from https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Getting Stripe Keys

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Go to [Dashboard > Developers > API keys](https://dashboard.stripe.com/apikeys)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. Create a webhook endpoint and copy the **Webhook secret** (starts with `whsec_`)

### MongoDB Setup

The services use MongoDB for data storage. Make sure you have MongoDB running:

```bash
# Using Docker (from docker-compose.yml)
docker-compose up -d
```

Or install MongoDB locally and ensure it's running on `localhost:27017` with credentials:
- Username: `root`
- Password: `example`

## Running the Services

### Development Mode

Run all services simultaneously (including new cart, order, and payment managers):

```bash
npm run dev
```

This will start:
- Gateway (port 4000)
- User Service
- Product Manager
- Notification Manager
- File Manager
- Inventory Manager
- **Cart Manager (port 3007)**
- **Order Manager (port 3008)**
- **Payment Manager (port 3009)**

### Individual Services

```bash
# Cart Manager
npm run start:dev cart-manager

# Order Manager
npm run start:dev order-manager

# Payment Manager
npm run start:dev payment-manager
```

## Workflow Example

### Complete Purchase Flow

1. **Add items to cart**
```bash
POST /cart/add
{
  "userId": "user123",
  "productId": "prod1",
  "quantity": 2,
  "price": 29.99,
  "name": "Product 1"
}
```

2. **View cart**
```bash
GET /cart/user123
```

3. **Create order** (automatically fetches cart and clears it)
```bash
POST /order/create
{
  "userId": "user123",
  "shippingAddress": { ... }
}
```

4. **Create payment intent** (gets orderId and amount from previous step)
```bash
POST /payment/create-intent
{
  "orderId": "order123",
  "amount": 59.98,
  "currency": "usd"
}
```

5. **Use clientSecret in frontend** (Stripe Elements, Stripe.js)
```javascript
const stripe = Stripe('pk_test_...');
const {error, paymentIntent} = await stripe.confirmPayment({
  clientSecret: 'pi_xxx_secret_xxx',
  // ... payment details
});
```

6. **Confirm payment** (or let webhook handle it)
```bash
POST /payment/confirm
{
  "paymentIntentId": "pi_xxx",
  "orderId": "order123"
}
```

7. **Track order**
```bash
GET /order/order123
```

## Inter-Service Communication

### Cart → Product Manager
- Validates product availability

### Order → Cart Manager
- Fetches cart items during order creation
- Clears cart after successful order

### Order → Notification Manager
- Sends notifications for:
  - Order created
  - Order status updated
  - Order cancelled

### Payment → Order Manager
- Updates payment status
- Updates order status when payment succeeds

## Database Schemas

### Cart Collection
```javascript
{
  userId: String,
  items: [{
    productId: String,
    quantity: Number,
    price: Number,
    name: String,
    image: String
  }],
  totalAmount: Number,
  totalItems: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  userId: String,
  items: [{
    productId: String,
    quantity: Number,
    price: Number,
    name: String,
    image: String
  }],
  totalAmount: Number,
  totalItems: Number,
  status: String (enum),
  paymentStatus: String (enum),
  paymentIntentId: String,
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  trackingNumber: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

You can use the included `test.http` file or create API requests to test the endpoints.

Example test flow:
```bash
# Add to cart
curl -X POST http://localhost:4000/cart/add \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","productId":"p1","quantity":1,"price":10,"name":"Test"}'

# Get cart
curl http://localhost:4000/cart/test

# Create order
curl -X POST http://localhost:4000/order/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","shippingAddress":{...}}'
```

## Troubleshooting

### Common Issues

1. **MongoDB connection error**
   - Ensure MongoDB is running
   - Check credentials in service modules

2. **RabbitMQ connection error**
   - Ensure RabbitMQ is running on port 5672
   - Default credentials: admin/admin

3. **Stripe errors**
   - Verify API keys in `.env`
   - Use test mode keys for development (sk_test_...)

4. **Port conflicts**
   - Cart: 3007
   - Order: 3008
   - Payment: 3009
   - Ensure these ports are available

## Next Steps

- [ ] Add authentication middleware to protect endpoints
- [ ] Implement inventory checks before order creation
- [ ] Add email notifications for order updates
- [ ] Implement order history pagination
- [ ] Add cart expiration logic
- [ ] Implement discount/coupon system
- [ ] Add multi-currency support
- [ ] Implement order tracking dashboard

## Frontend Integration

For frontend integration with Stripe:

1. Install Stripe.js:
```bash
npm install @stripe/stripe-js
```

2. Use the client secret from payment intent:
```javascript
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_test_...');
const response = await fetch('/payment/create-intent', {
  method: 'POST',
  body: JSON.stringify({ orderId, amount, currency })
});
const { clientSecret } = await response.json();

// Use Stripe Elements or Payment Element
const { error } = await stripe.confirmPayment({
  clientSecret,
  confirmParams: {
    return_url: 'http://localhost:3000/order/success'
  }
});
```

## Support

For any questions or issues, please refer to:
- [Stripe Documentation](https://stripe.com/docs)
- [NestJS Documentation](https://docs.nestjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
