# Property Listing System Backend

The **Property Listing System Backend** is a Node.js-based RESTful API built with **Express**, **MongoDB**, and **Redis Cloud**. It powers a real estate platform that allows users to register, manage property listings, save favorites, and share recommendations.

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

## 🛠 Tech Stack

- **Node.js**: Runtime environment
- **Express**: Web framework
- **MongoDB**: NoSQL database
- **Redis Cloud**: Caching
- **TypeScript**: Type safety
- **Mongoose**: MongoDB modeling
- **JWT**: Authentication
- **Vercel**: Serverless deployment

### Dependencies

```bash
express, mongoose, redis, jsonwebtoken, bcryptjs, csvtojson, dotenv, zod
````

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
```

---

## Prerequisites

* Node.js v18.x
* MongoDB Atlas or local MongoDB
* Redis Cloud
* Git
* Vercel Account + CLI

---

## Setup Instructions

1. **Clone the Repository**

```bash
git clone https://github.com/your-username/property-listing-backend.git
cd property-listing-backend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the root with the following:

```env
MONGO_URI=mongodb://your-mongodb-uri
REDIS_URL=rediss://default:your-redis-password@your-redis-host:port
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. **Run Locally**

```bash
npm run dev
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`.
**Authorization**: Use `Bearer <token>` for authenticated endpoints.

---

### Auth

#### `POST /api/auth/register`

Registers a new user.

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

Responses:

* `201`: `{ "message": "User registered successfully" }`
* `400`: `{ "error": "Error registering user" }`

---

#### `POST /api/auth/login`

Logs in and returns JWT.

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Responses:

* `200`: `{ "token": "<JWT>" }`
* `400`: `{ "error": "Invalid credentials" }`

---

### Properties

#### `POST /api/properties` (Auth required)

Create a new property listing.

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

Responses:

* `201`: Success
* `400`: Validation errors
* `401`: Unauthorized
* `409`: Duplicate property
* `500`: Server error

---

#### `GET /api/properties`

List all properties (cached via Redis).

#### `GET /api/properties/search`

Search with filters. Example:

```
/api/properties/search?city=New York&minPrice=100000&bedrooms=2&type=Apartment
```

Query Parameters: `city`, `state`, `country`, `minPrice`, `maxPrice`, `bedrooms`, `bathrooms`, `minArea`, `maxArea`, `type`, `status`

---

#### `GET /api/properties/:id`

Get a property by ID (cached).

---

### Favorites

#### `POST /api/favorites` (Auth required)

Add property to favorites.

```json
{
  "propertyId": "507f1f77bcf86cd799439011"
}
```

---

#### `GET /api/favorites` (Auth required)

List all favorites of the user.

---

#### `DELETE /api/favorites/:propertyId` (Auth required)

Remove property from favorites.

---

### Recommendations

#### `POST /api/recommendations` (Auth required)

Recommend a property to a friend.

```json
{
  "propertyId": "507f1f77bcf86cd799439011",
  "recipientEmail": "friend@example.com"
}
```

---

#### `GET /api/recommendations` (Auth required)

List recommendations sent by the user.

---

