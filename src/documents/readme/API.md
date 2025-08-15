# 📖 API Reference Documentation

## 🌐 Base URLs

| Environment | URL |
|------------|-----|
| Development | `http://localhost:3060` |
| Production | `https://portfolio-events-rest-api.demo.vedaterenoglu.com` |
| Documentation | `http://localhost:3060/api/docs` |

## 🔑 Authentication

### JWT Bearer Token
```http
Authorization: Bearer <jwt-token>
```

### Obtaining Tokens
Tokens are issued by Clerk authentication service. Include the token in the Authorization header for protected endpoints.

## 📋 Response Format

### Success Response
```json
{
  "data": { },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": "price",
    "constraint": "must be positive"
  }
}
```

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - Request completed |
| 201 | Created - Resource created |
| 204 | No Content - Request completed, no data |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## 📚 API Endpoints

### 🌍 Public Endpoints

#### Get Welcome Message
```http
GET /
```

**Response:**
```json
{
  "message": "Welcome to Portfolio Events API",
  "version": "1.0.0",
  "documentation": "/api/docs"
}
```

---

#### List All Events
```http
GET /api/events
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search in name, description, city, location |
| city | string | No | Filter by city slug |
| limit | number | No | Results per page (default: 50, max: 100) |
| offset | number | No | Skip results for pagination (default: 0) |
| orderBy | string | No | Sort field: date, name, price (default: date) |
| sortOrder | string | No | Sort direction: asc, desc (default: desc) |

**Example Request:**
```bash
curl -X GET "http://localhost:3060/api/events?city=london&limit=10&orderBy=price&sortOrder=asc"
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
      "alt": "Tech Conference Image",
      "description": "Annual technology conference",
      "organizerName": "TechEvents Ltd",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

#### Get Event by Slug
```http
GET /api/events/:slug
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | string | Yes | Event slug identifier |

**Example Request:**
```bash
curl -X GET "http://localhost:3060/api/events/tech-conference-2025"
```

**Response:**
```json
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
  "alt": "Tech Conference Image",
  "description": "Annual technology conference featuring keynotes, workshops, and networking",
  "organizerName": "TechEvents Ltd",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

---

#### List All Cities
```http
GET /api/cities
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search in city names |
| country | string | No | Filter by country |
| limit | number | No | Results per page (default: 50) |
| offset | number | No | Skip results for pagination |

**Response:**
```json
{
  "count": 10,
  "cities": [
    {
      "id": 1,
      "name": "London",
      "slug": "london",
      "country": "United Kingdom"
    },
    {
      "id": 2,
      "name": "New York",
      "slug": "new-york",
      "country": "United States"
    }
  ]
}
```

---

### 💳 Payment Endpoints

#### Create Checkout Session
```http
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

**Validation Rules:**
- `eventSlug`: Required, must exist in database
- `quantity`: Required, positive integer, max 10
- `unitPrice`: Required, must match database price
- `totalAmount`: Required, must equal quantity × unitPrice
- `successUrl`: Required, valid URL
- `cancelUrl`: Required, valid URL

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_a1b2c3...",
  "sessionId": "cs_test_a1b2c3..."
}
```

**Error Responses:**

*Event Not Found (404):*
```json
{
  "statusCode": 404,
  "message": "Event with slug 'invalid-slug' not found",
  "error": "Not Found"
}
```

*Price Mismatch (400):*
```json
{
  "statusCode": 400,
  "message": "Price mismatch: Event price is 149.99 but received 99.99",
  "error": "Bad Request"
}
```

---

#### Verify Payment Session
```http
GET /api/payments/verify/:sessionId
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string | Yes | Stripe checkout session ID |

**Response:**
```json
{
  "id": "cs_test_a1b2c3...",
  "status": "complete",
  "payment_status": "paid",
  "amount_total": 29998,
  "currency": "usd",
  "metadata": {
    "eventSlug": "tech-conference-2025",
    "eventName": "Tech Conference 2025",
    "quantity": "2"
  }
}
```

---

### 🏥 Health & Monitoring

#### Health Check Dashboard
```http
GET /health
```

Returns HTML dashboard with system health metrics.

---

#### Health Check JSON
```http
GET /health/json
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "uptime": 3600,
  "database": {
    "status": "connected",
    "latency": 5
  },
  "memory": {
    "used": 134217728,
    "total": 536870912,
    "percentage": 25
  },
  "cpu": {
    "usage": 15.5
  }
}
```

---

#### Readiness Check
```http
GET /ready
```

**Response:**
```json
{
  "status": "ready",
  "checks": {
    "database": true,
    "external_services": true
  }
}
```

---

#### System Metrics
```http
GET /metrics
```

**Response:**
```json
{
  "requests": {
    "total": 10000,
    "success": 9950,
    "errors": 50
  },
  "response_times": {
    "avg": 45,
    "p50": 30,
    "p95": 120,
    "p99": 250
  },
  "active_connections": 15
}
```

---

### 🔐 Admin Endpoints

All admin endpoints require JWT authentication with admin role.

#### Create Event
```http
POST /api/admin/events
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Developer Summit 2025",
  "slug": "developer-summit-2025",
  "date": "2025-09-20T10:00:00.000Z",
  "city": "San Francisco",
  "citySlug": "san-francisco",
  "location": "Moscone Center",
  "price": 299.99,
  "imageUrl": "https://example.com/summit.jpg",
  "alt": "Developer Summit Image",
  "description": "Annual developer summit with workshops and keynotes",
  "organizerName": "DevEvents Inc"
}
```

**Validation Rules:**
- `name`: Required, max 255 characters
- `slug`: Required, unique, max 100 characters, lowercase with hyphens
- `date`: Required, ISO 8601 format, future date
- `city`: Required, max 100 characters
- `citySlug`: Required, max 50 characters
- `location`: Required, max 255 characters
- `price`: Required, positive number, max 2 decimal places
- `imageUrl`: Optional, valid URL
- `alt`: Optional, max 255 characters
- `description`: Optional, max 5000 characters
- `organizerName`: Required, max 255 characters

**Response (201 Created):**
```json
{
  "id": 42,
  "name": "Developer Summit 2025",
  "slug": "developer-summit-2025",
  "date": "2025-09-20T10:00:00.000Z",
  "city": "San Francisco",
  "citySlug": "san-francisco",
  "location": "Moscone Center",
  "price": 299.99,
  "imageUrl": "https://example.com/summit.jpg",
  "alt": "Developer Summit Image",
  "description": "Annual developer summit with workshops and keynotes",
  "organizerName": "DevEvents Inc",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

#### Update Event
```http
PUT /api/admin/events/:id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Event ID (numeric) |

**Request Body (Partial Update):**
```json
{
  "price": 349.99,
  "description": "Updated description with new speakers announced"
}
```

**Response:**
```json
{
  "id": 42,
  "name": "Developer Summit 2025",
  "slug": "developer-summit-2025",
  "price": 349.99,
  "description": "Updated description with new speakers announced",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

---

#### Delete Event
```http
DELETE /api/admin/events/:id
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | Event ID (numeric) |

**Response (204 No Content):**
```
No response body
```

---

#### Create City
```http
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

**Validation Rules:**
- `name`: Required, max 100 characters
- `slug`: Required, unique, max 50 characters
- `country`: Optional, max 100 characters

**Response (201 Created):**
```json
{
  "id": 15,
  "name": "Tokyo",
  "slug": "tokyo",
  "country": "Japan",
  "createdAt": "2025-01-15T10:30:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

#### Update City
```http
PUT /api/admin/cities/:citySlug
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| citySlug | string | Yes | City slug identifier |

**Request Body:**
```json
{
  "name": "Tokyo Metropolitan Area",
  "country": "Japan"
}
```

**Response:**
```json
{
  "id": 15,
  "name": "Tokyo Metropolitan Area",
  "slug": "tokyo",
  "country": "Japan",
  "updatedAt": "2025-01-15T11:00:00.000Z"
}
```

---

#### Reset Database
```http
POST /admin/database/reset
```

**Description:** Truncates all tables and seeds with sample data.

**⚠️ Warning:** This action cannot be undone and will delete all existing data.

**Response:**
```json
{
  "message": "Database reset successfully",
  "seeded": {
    "events": 50,
    "cities": 10
  }
}
```

---

#### Truncate Database
```http
DELETE /admin/database/truncate
```

**Description:** Removes all data from all tables.

**⚠️ Warning:** This action cannot be undone and will delete all existing data.

**Response:**
```json
{
  "message": "Database truncated successfully",
  "tables": ["TEvent", "TCity"]
}
```

---

## 🔄 Rate Limiting

### Limits
- **Anonymous Users**: 100 requests per 60 seconds
- **Authenticated Users**: 200 requests per 60 seconds

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345678
```

### Rate Limit Exceeded Response (429)
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "error": "ThrottlerException: Too Many Requests",
  "retryAfter": 60
}
```

## 🔍 Search & Filtering

### Search Operators
The search parameter supports case-insensitive partial matching across multiple fields.

**Example:**
```http
GET /api/events?search=tech
```
Searches in: name, description, city, location, organizerName

### Filtering
Combine multiple query parameters for precise filtering:

```http
GET /api/events?city=london&orderBy=price&sortOrder=asc&limit=20
```

## 📄 Pagination

### Parameters
- `limit`: Number of results per page (max: 100)
- `offset`: Number of results to skip

### Pagination Response
```json
{
  "pagination": {
    "limit": 20,
    "offset": 40,
    "hasMore": true
  }
}
```

### Example: Fetching All Pages
```javascript
async function fetchAllEvents() {
  let allEvents = [];
  let offset = 0;
  const limit = 50;
  
  while (true) {
    const response = await fetch(
      `/api/events?limit=${limit}&offset=${offset}`
    );
    const data = await response.json();
    
    allEvents = [...allEvents, ...data.events];
    
    if (!data.pagination.hasMore) break;
    offset += limit;
  }
  
  return allEvents;
}
```

## 🛡️ Security Headers

All responses include security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## 📝 Data Validation

### Validation Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "price",
      "constraint": "isPositive",
      "message": "price must be a positive number"
    },
    {
      "field": "email",
      "constraint": "isEmail",
      "message": "email must be a valid email"
    }
  ]
}
```

## 🔗 CORS Configuration

### Allowed Origins (Development)
- `http://localhost:3000`
- `http://localhost:3060`

### Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS

### Allowed Headers
- Content-Type
- Authorization

## 📊 Swagger Documentation

Interactive API documentation available at:
```
http://localhost:3060/api/docs
```

Features:
- Try out endpoints directly
- View request/response schemas
- Download OpenAPI specification
- Authentication testing

---

**Need Help?** Visit the [Troubleshooting Guide](./TROUBLESHOOTING.md) or contact support.