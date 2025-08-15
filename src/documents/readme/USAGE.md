# 📚 Usage Guide

## 🎯 Overview

This guide provides comprehensive instructions for using the Portfolio Events API, including authentication, making requests, handling responses, and integrating payment processing.

## 🔐 Authentication

### JWT Token Authentication

The API uses JWT tokens issued by Clerk for authentication. Admin endpoints require both a valid JWT token and admin role.

#### Obtaining a JWT Token

1. **Via Clerk SDK**
```javascript
import { auth } from '@clerk/nextjs';

const { getToken } = auth();
const token = await getToken({ template: 'portfolio-events-jwt' });
```

2. **Via Clerk REST API**
```bash
curl -X POST https://api.clerk.dev/v1/sessions \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_123"}'
```

#### Using the Token
```bash
curl -X GET http://localhost:3060/api/admin/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🌐 API Endpoints

### Public Endpoints

#### Get All Events
```bash
GET /api/events
```

**Query Parameters:**
- `search` (string): Search in name, description, city, location
- `city` (string): Filter by city slug
- `limit` (number): Results per page (default: 50)
- `offset` (number): Skip results (default: 0)
- `orderBy` (string): Sort field (date|name|price)
- `sortOrder` (string): Sort direction (asc|desc)

**Example Request:**
```bash
curl "http://localhost:3060/api/events?city=london&limit=10&orderBy=date&sortOrder=desc"
```

**Response:**
```json
{
  "count": 25,
  "events": [
    {
      "id": 1,
      "name": "Tech Conference 2025",
      "slug": "tech-conference-2025",
      "date": "2025-06-15T09:00:00.000Z",
      "city": "London",
      "citySlug": "london",
      "location": "ExCel London",
      "price": 149.99,
      "imageUrl": "https://example.com/image.jpg",
      "description": "Annual tech conference",
      "organizerName": "TechEvents Ltd"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Get Event by Slug
```bash
GET /api/events/:slug
```

**Example:**
```bash
curl http://localhost:3060/api/events/tech-conference-2025
```

#### Get All Cities
```bash
GET /api/cities
```

**Query Parameters:**
- `search` (string): Search in city names
- `country` (string): Filter by country
- `limit` (number): Results per page
- `offset` (number): Skip results

### 💳 Payment Endpoints

#### Create Checkout Session
```bash
POST /api/payments/checkout
```

**Request Body:**
```json
{
  "eventSlug": "tech-conference-2025",
  "eventName": "Tech Conference 2025",
  "quantity": 2,
  "unitPrice": 149.99,
  "totalAmount": 299.98,
  "successUrl": "https://yoursite.com/success",
  "cancelUrl": "https://yoursite.com/cancel"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_123...",
  "sessionId": "cs_test_123..."
}
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:3060/api/payments/checkout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    eventSlug: 'tech-conference-2025',
    eventName: 'Tech Conference 2025',
    quantity: 2,
    unitPrice: 149.99,
    totalAmount: 299.98,
    successUrl: window.location.origin + '/success',
    cancelUrl: window.location.origin + '/cancel'
  })
});

const { checkoutUrl } = await response.json();
window.location.href = checkoutUrl; // Redirect to Stripe
```

#### Verify Payment Session
```bash
GET /api/payments/verify/:sessionId
```

**Example:**
```bash
curl http://localhost:3060/api/payments/verify/cs_test_123...
```

### 🔒 Admin Endpoints

All admin endpoints require JWT authentication with admin role.

#### Create Event
```bash
POST /api/admin/events
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Tech Summit",
  "slug": "new-tech-summit",
  "date": "2025-09-20T10:00:00.000Z",
  "city": "San Francisco",
  "citySlug": "san-francisco",
  "location": "Moscone Center",
  "price": 299.99,
  "imageUrl": "https://example.com/summit.jpg",
  "alt": "Tech Summit Image",
  "description": "Premier technology summit",
  "organizerName": "Summit Organizers Inc"
}
```

#### Update Event
```bash
PUT /api/admin/events/:id
```

**Request Body (Partial Update):**
```json
{
  "price": 349.99,
  "description": "Updated description"
}
```

#### Delete Event
```bash
DELETE /api/admin/events/:id
```

#### Create City
```bash
POST /api/admin/cities
```

**Request Body:**
```json
{
  "name": "Tokyo",
  "slug": "tokyo",
  "country": "Japan"
}
```

#### Database Operations
```bash
# Reset database with seed data
POST /admin/database/reset

# Truncate all tables
DELETE /admin/database/truncate
```

## 📊 Health & Monitoring

### Health Dashboard
```bash
GET /health
```

Returns HTML dashboard with system metrics.

### Health Check (JSON)
```bash
GET /health/json
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "memory": {
    "used": 134217728,
    "total": 536870912
  }
}
```

### System Metrics
```bash
GET /metrics
```

Returns detailed system performance metrics.

## 🧪 Testing the API

### Using cURL

**Public Endpoint:**
```bash
curl -X GET "http://localhost:3060/api/events?limit=5"
```

**Admin Endpoint:**
```bash
curl -X POST http://localhost:3060/api/admin/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "slug": "test-event",
    "date": "2025-12-01T19:00:00.000Z",
    "city": "London",
    "citySlug": "london",
    "location": "Test Venue",
    "price": 99.99,
    "description": "Test description",
    "organizerName": "Test Organizer"
  }'
```

### Using JavaScript/TypeScript

```typescript
// API Client Class
class EventsAPIClient {
  private baseURL: string;
  private token?: string;

  constructor(baseURL = 'http://localhost:3060') {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  async getEvents(params?: {
    search?: string;
    city?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryString = new URLSearchParams(params as any).toString();
    const response = await fetch(`${this.baseURL}/api/events?${queryString}`);
    return response.json();
  }

  async createEvent(eventData: any) {
    const response = await fetch(`${this.baseURL}/api/admin/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });
    return response.json();
  }

  async createCheckoutSession(paymentData: any) {
    const response = await fetch(`${this.baseURL}/api/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });
    return response.json();
  }
}

// Usage
const client = new EventsAPIClient();
client.setToken('your-jwt-token');

// Get events
const events = await client.getEvents({ city: 'london', limit: 10 });

// Create checkout session
const session = await client.createCheckoutSession({
  eventSlug: 'tech-conference-2025',
  quantity: 2,
  unitPrice: 149.99,
  totalAmount: 299.98,
  successUrl: 'https://yoursite.com/success',
  cancelUrl: 'https://yoursite.com/cancel'
});
```

## 🛠️ Error Handling

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "price",
    "constraint": "must be a positive number"
  }
}
```

### Common Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Rate Limiting

The API implements rate limiting:
- **Default**: 100 requests per 60 seconds per IP
- **Authenticated**: 200 requests per 60 seconds per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

## 🔄 Pagination

Use pagination for list endpoints:

```javascript
async function getAllEvents() {
  let allEvents = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `http://localhost:3060/api/events?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();
    
    allEvents = [...allEvents, ...data.events];
    hasMore = data.pagination.hasMore;
    offset += limit;
  }

  return allEvents;
}
```

## 🎨 Integration Examples

### React Integration

```jsx
import { useState, useEffect } from 'react';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3060/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events);
        setLoading(false);
      });
  }, []);

  const handlePurchase = async (event) => {
    const response = await fetch('http://localhost:3060/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventSlug: event.slug,
        eventName: event.name,
        quantity: 1,
        unitPrice: event.price,
        totalAmount: event.price,
        successUrl: window.location.origin + '/success',
        cancelUrl: window.location.origin + '/events'
      })
    });

    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.name}</h3>
          <p>{event.description}</p>
          <p>Price: ${event.price}</p>
          <button onClick={() => handlePurchase(event)}>
            Buy Ticket
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Next.js Integration

```typescript
// pages/api/events.ts
export async function getServerSideProps() {
  const response = await fetch('http://localhost:3060/api/events');
  const data = await response.json();

  return {
    props: {
      events: data.events
    }
  };
}
```

## 📝 Best Practices

1. **Always handle errors gracefully**
```javascript
try {
  const response = await fetch('/api/events');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Failed to fetch events:', error);
  // Show user-friendly error message
}
```

2. **Use environment variables for API URLs**
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3060';
```

3. **Implement retry logic for network failures**
```javascript
async function fetchWithRetry(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

4. **Cache responses when appropriate**
```javascript
const cache = new Map();

async function getCachedEvents(city) {
  const cacheKey = `events-${city}`;
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < 5 * 60 * 1000) { // 5 minutes
      return data;
    }
  }

  const response = await fetch(`/api/events?city=${city}`);
  const data = await response.json();
  
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}
```

## 🔗 Related Documentation

- [API Reference](./API.md) - Complete API specification
- [Architecture Guide](./ARCHITECTURE.md) - System design and patterns
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

---

**Need Help?** Check the [Swagger Documentation](http://localhost:3060/api/docs) for interactive API testing.