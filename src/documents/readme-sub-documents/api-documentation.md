# API Documentation

## 🌐 Base URLs

- **Development**: `http://localhost:3060`
- **Production**: `https://portfolio-events-rest-api.demo.vedaterenoglu.com`

## 🔐 Authentication

The API uses JWT Bearer tokens for authentication:

```bash
Authorization: Bearer <your-jwt-token>
```


## 📋 API Endpoints Overview

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/api/events` | Get all events with filtering |
| `GET` | `/api/events/:slug` | Get event by slug |
| `GET` | `/api/cities` | Get all cities with filtering |
| `GET` | `/health` | Health dashboard (HTML) |
| `GET` | `/health/json` | Health status (JSON) |
| `GET` | `/ready` | Readiness check |
| `GET` | `/metrics` | System metrics |

### Admin Endpoints (JWT + Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/events` | Create new event |
| `PUT` | `/api/admin/events/:id` | Update event by ID |
| `DELETE` | `/api/admin/events/:id` | Delete event by ID |
| `POST` | `/api/admin/cities` | Create new city |
| `PUT` | `/api/admin/cities/:citySlug` | Update city by slug |
| `POST` | `/admin/database/reset` | Reset database |
| `DELETE` | `/admin/database/truncate` | Truncate all tables |

## 🎯 Detailed API Usage

### Events API

#### Get All Events
```bash
GET /api/events?limit=10&offset=0&city=austin
```

**Query Parameters:**
- `limit` (optional): Number of events to return
- `offset` (optional): Number of events to skip
- `city` (optional): Filter by city name

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Austin Music Festival",
      "slug": "austin-music-festival",
      "city": "Austin",
      "date": "2024-07-15T19:00:00.000Z",
      "price": 2500,
      "description": "Amazing music festival..."
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

#### Get Event by Slug
```bash
GET /api/events/austin-music-festival
```

#### Create Event (Admin Only)
```bash
POST /api/admin/events
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "New Event",
  "slug": "new-event",
  "city": "Austin",
  "citySlug": "austin",
  "location": "Convention Center",
  "date": "2024-12-25T19:00:00.000Z",
  "organizerName": "Event Organizer",
  "imageUrl": "https://example.com/image.jpg",
  "alt": "Event image",
  "description": "Event description",
  "price": 2500
}
```

### Cities API

#### Get All Cities
```bash
GET /api/cities?search=austin
```

**Query Parameters:**
- `search` (optional): Search cities by name

#### Create City (Admin Only)
```bash
POST /api/admin/cities
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "citySlug": "new-city",
  "city": "New City",
  "url": "https://example.com/city-image.jpg",
  "alt": "City image"
}
```

## 📊 Health & Monitoring

### Health Dashboard
```bash
GET /health
```
Returns HTML dashboard with system metrics.

### Health Status (JSON)
```bash
GET /health/json
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": "2h 15m 30s",
  "database": {
    "status": "connected",
    "responseTime": "12ms"
  },
  "memory": {
    "used": "145MB",
    "total": "512MB"
  }
}
```

### System Metrics
```bash
GET /metrics
```
Returns Prometheus-style metrics.

## 🔍 Interactive Documentation

### Swagger UI
Visit `http://localhost:3060/api/docs` for interactive API documentation with:
- Request/response examples
- Authentication testing
- Schema validation
- Live API testing

## 🔒 Security Features

### Rate Limiting
- **Global Limit**: 100 requests per minute
- **Burst Limit**: 10 requests per 10 seconds
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### Input Validation
- Zod schema validation for all inputs
- HTML sanitization with DOMPurify
- SQL injection prevention via Prisma ORM

### CORS Configuration
- Configurable origins
- Credential support
- Preflight request handling

## 📈 Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## 🧪 Testing Endpoints

Use the health check endpoint to verify API status:
```bash
curl -X GET http://localhost:3060/health/json
```

For authenticated requests:
```bash
# Use token in authenticated request
curl -X GET http://localhost:3060/api/admin/events \
  -H "Authorization: Bearer <your-token>"
```
