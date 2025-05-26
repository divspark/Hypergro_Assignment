
```markdown
# Property Listing System Backend

## Overview

The Property Listing System Backend is a Node.js-based RESTful API built with Express, MongoDB, and Redis Cloud. It powers a real estate platform, allowing users to register, manage property listings, save favorites, and share recommendations.

The backend uses:
- **MongoDB** for persistent storage
- **Redis Cloud** for caching to enhance performance
- **JWT** for secure authentication

Deployed on **Vercel** as a serverless application, it supports scalable, high-performance operations.

---

## Features

- **User Authentication**: Register and log in users with JWT-based authentication.
- **Property Management**: Create, read, update, delete (CRUD) property listings, with CSV import support.
- **Favorites**: Allow users to save and manage favorite properties.
- **Recommendations**: Enable users to recommend properties via email.
- **Caching**: Use Redis Cloud to cache frequently accessed data.
- **Search**: Advanced property search with filters (city, price, bedrooms, etc).
- **Serverless Deployment**: Runs on Vercel for auto-scaling and easy deployment.

---

## Tech Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Redis Cloud**: Caching
- **TypeScript**: Type safety
- **Mongoose**: MongoDB modeling
- **JWT**: Authentication
- **Vercel**: Serverless deployment

**Dependencies**: `express`, `mongoose`, `redis`, `jsonwebtoken`, `bcryptjs`, `csvtojson`, `dotenv`

---

## Project Structure

```

property-listing-backend/
├── config/
│   └── db.ts
├── controllers/
│   ├── authController.ts
│   ├── favoriteController.ts
│   ├── propertyController.ts
│   └── recommendationController.ts
├── middleware/
│   └── authMiddleware.ts
├── models/
│   ├── Favorite.ts
│   ├── Property.ts
│   ├── Recommendation.ts
│   └── User.ts
├── routes/
│   ├── authRoutes.ts
│   ├── favoriteRoutes.ts
│   ├── propertyRoutes.ts
│   └── recommendationRoutes.ts
├── index.ts
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md

````

---

## Prerequisites

- Node.js v18.x
- MongoDB Atlas (or local MongoDB)
- Redis Cloud
- Git
- Vercel Account + CLI

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/property-listing-backend.git
cd property-listing-backend
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root with:

```env
MONGO_URI=mongodb://your-mongodb-uri
REDIS_URL=rediss://default:your-redis-password@your-redis-host:port
JWT_SECRET=your_jwt_secret
PORT=3000
```

### 4. Run Locally

```bash
npm run dev
```



## API Endpoints

All endpoints are prefixed with `/api`.

> **Authorization**: Use `Bearer <token>` for endpoints requiring authentication.

---

### Auth

#### `POST /api/auth/register`

Register a new user.

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response**:
`201`: `{ "message": "User registered successfully" }`
`400`: `{ "error": "Error registering user" }`

---

#### `POST /api/auth/login`

Log in and receive JWT token.

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response**:
`200`: `{ "token": "<JWT>" }`
`400`: `{ "error": "Invalid credentials" }`

---

### Properties

#### `POST /api/properties/import`

Import properties from CSV.

**URL**: `https://cdn2.gro.care/db424fd9fb74_1748258398689.csv`

**Response**:
`200`: `{ "message": "Data imported successfully" }`
`500`: `{ "error": "Error importing data" }`

---

#### `POST /api/properties`

Create new property listing (Auth required).

```json
{
  "title": "Luxury Apartment",
  "description": "Modern 2-bedroom flat",
  "price": 250000,
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 1200,
  "type": "Apartment",
  "status": "For Sale"
}
```

---

#### `GET /api/properties`

List all properties (cached in Redis).

**Response**: Array of property objects.
`500`: `{ "error": "Error fetching properties" }`

---

#### `GET /api/properties/search`

Search properties by filters.

**Example**: `/api/properties/search?city=New York&minPrice=100000&bedrooms=2&type=Apartment`

**Query Parameters**:

* `city`, `state`, `country`
* `minPrice`, `maxPrice`
* `bedrooms`, `bathrooms`
* `minArea`, `maxArea`
* `type`, `status`

---

#### `GET /api/properties/:id`

Get property by ID (cached in Redis).

---

### Favorites

#### `POST /api/favorites/:propertyId`

Save a property to favorites (Auth required).

---

#### `GET /api/favorites`

List user's favorite properties (Auth required).

---

#### `DELETE /api/favorites/:propertyId`

Remove property from favorites (Auth required).

---

### Recommendations

#### `POST /api/recommend/:propertyId`

Recommend a property via email (Auth required).

```json
{
  "to": "friend@example.com",
  "message": "Check this out!"
}
```

---

