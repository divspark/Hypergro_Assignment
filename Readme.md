Property Listing System Backend
Overview
The Property Listing System Backend is a Node.js-based RESTful API built with Express, MongoDB, and Redis Cloud. It powers a real estate platform, allowing users to register, manage property listings, save favorites, and share recommendations. The backend leverages MongoDB for persistent storage, Redis Cloud for caching to enhance performance, and JSON Web Tokens (JWT) for secure authentication. Deployed on Vercel as a serverless application, it supports scalable, high-performance operations.
Features

User Authentication: Register and log in users with JWT-based authentication.
Property Management: Create, read, update, delete (CRUD) property listings, with CSV import support.
Favorites: Allow users to save and manage favorite properties.
Recommendations: Enable users to recommend properties to others via email.
Caching: Use Redis Cloud to cache frequently accessed data (e.g., property lists, search results) for faster responses.
Search: Advanced property search with filters for city, price, bedrooms, etc.
Serverless Deployment: Runs on Vercel for automatic scaling and easy deployment.

Tech Stack

Node.js: Runtime environment.
Express: Web framework for building the API.
MongoDB: NoSQL database for storing users, properties, favorites, and recommendations.
Redis Cloud: In-memory data store for caching.
TypeScript: For type-safe code.
Mongoose: MongoDB object modeling.
JWT: For secure authentication.
Vercel: Serverless deployment platform.
Dependencies: express, mongoose, redis, jsonwebtoken, bcryptjs, csvtojson, dotenv.

Project Structure
property-listing-backend/
├── config/
│   └── db.ts               # MongoDB and Redis connection setup
├── controllers/
│   ├── authController.ts   # Authentication logic
│   ├── favoriteController.ts # Favorites management
│   ├── propertyController.ts # Property CRUD and search
│   └── recommendationController.ts # Recommendations logic
├── middleware/
│   └── authMiddleware.ts   # JWT authentication middleware
├── models/
│   ├── Favorite.ts         # Favorite schema
│   ├── Property.ts         # Property schema
│   ├── Recommendation.ts   # Recommendation schema
│   └── User.ts             # User schema
├── routes/
│   ├── authRoutes.ts       # Authentication routes
│   ├── favoriteRoutes.ts   # Favorites routes
│   ├── propertyRoutes.ts   # Property routes
│   └── recommendationRoutes.ts # Recommendations routes
├── index.ts                # Main Express app entry point
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel deployment configuration
└── README.md               # Project documentation

Prerequisites

Node.js: Version 18.x
MongoDB: A MongoDB instance (e.g., MongoDB Atlas)
Redis Cloud: A Redis Cloud account and database
Vercel Account: For deployment
Git: For version control
Vercel CLI: For local testing and deployment (npm install -g vercel)

Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/property-listing-backend.git
cd property-listing-backend

2. Install Dependencies
npm install

3. Configure Environment Variables
Create a .env file in the root directory with the following:
MONGO_URI=mongodb://your-mongodb-uri
REDIS_URL=rediss://default:your-redis-password@redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com:12345
JWT_SECRET=your_jwt_secret
PORT=3000


MONGO_URI: MongoDB connection string (e.g., from MongoDB Atlas).
REDIS_URL: Redis Cloud connection string (use rediss:// for TLS).
JWT_SECRET: A secure random string for JWT signing.
PORT: Local server port (default: 3000).

4. Run Locally
npm run dev



API Endpoints
Below is a list of all API endpoints, including payloads, methods, authentication requirements, and expected responses. All endpoints are prefixed with /api/. Endpoints requiring authentication need a JWT token in the Authorization header (Bearer <token>), obtained from POST /api/auth/login.
Authentication
1. POST /auth/register

Description: Register a new user.
Authentication: None.
Payload:{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
}


Response:
201:{
    "message": "User registered successfully"
}


400:{
    "error": "Error registering user"
}





2. POST /auth/login

Description: Log in a user and receive a JWT token.
Authentication: None.
Payload:{
    "email": "user@example.com",
    "password": "SecurePassword123!"
}


Response:
200:{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}


400:{
    "error": "User not found"
}

or{
    "error": "Invalid password"
}





Properties
3. POST /properties/import

Description: Import properties from a CSV file (URL: https://cdn2.gro.care/db424fd9fb74_1748258398689.csv).
Authentication: None (admin access recommended in production).
Payload: None.
Response:
200:{
    "message": "Data imported successfully"
}


500:{
    "error": "Error importing data"
}





4. POST /properties

Description: Create a new property listing.
Authentication: Required.
Payload:{
    "title": "Luxury Apartment in Downtown",
    "description": "Spacious 2-bedroom apartment with modern amenities.",
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


Response:
201:{
    "_id": "507f1f77bcf86cd799439011",
    "title": "Luxury Apartment in Downtown",
    "description": "Spacious 2-bedroom apartment with modern amenities.",
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
    "status": "For Sale",
    "createdBy": "507f1f77bcf86cd799439010",
    "createdAt": "2025-05-27T02:54:00.000Z",
    "__v": 0
}


400:{
    "error": "Error creating property"
}





5. GET /properties

Description: List all properties (cached in Redis).
Authentication: None.
Payload: None.
Response:
200:[
    {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Luxury Apartment in Downtown",
        "description": "Spacious 2-bedroom apartment with modern amenities.",
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
        "status": "For Sale",
        "createdBy": "507f1f77bcf86cd799439010",
        "createdAt": "2025-05-27T02:54:00.000Z",
        "__v": 0
    }
]


500:{
    "error": "Error fetching properties"
}





6. GET /properties/search?city=New York&minPrice=100000

Description: Search properties with filters.
Authentication: None.
Query Parameters (optional):
city, state, country, minPrice, maxPrice, bedrooms, bathrooms, minArea, maxArea, type, status


Example: /api/properties/search?city=New York&minPrice=100000&bedrooms=2&type=Apartment
Payload: None.
Response:
200:[
    {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Luxury Apartment in Downtown",
        "description": "Spacious 2-bedroom apartment with modern amenities.",
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
        "status": "For Sale",
        "createdBy": "507f1f77bcf86cd799439010",
        "createdAt": "2025-05-27T02:54:00.000Z",
        "__v": 0
    }
]


500:{
    "error": "Error searching properties"
}





7. GET /properties/:id

Description: Get a single property by ID (cached in Redis).
Authentication: None.
Example: /api/properties/507f1f77bcf86cd799439011
Payload: None.
Response:
200:{
    "_id": "507f1f77bcf86cd799439011",
    "title": "Luxury Apartment in Downtown",
    "description": "Spacious 2-bedroom apartment with modern amenities.",
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
    "status": "For Sale",
    "createdBy": "507f1f77bcf86cd799439010",
    "createdAt": "2025-05-27T02:54:00.000Z",
    "__v": 0
}


404:{
    "error": "Property not found"
}





8. PUT /properties/:id

Description: Update a property (only by the creator).
Authentication: Required.
Example: /api/properties/507f1f77bcf86cd799439011
Payload:{
    "title": "Updated Luxury Apartment",
    "description": "Updated spacious 2-bedroom apartment with modern amenities.",
    "price": 260000,
    "location": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
    },
    "bedrooms": 2,
    "bathrooms": 2,
    "area": 1250,
    "type": "Apartment",
    "status": "For Sale"
}


Response:
200:{
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Luxury Apartment",
    "description": "Updated spacious 2-bedroom apartment with modern amenities.",
    "price": 260000,
    "location": {
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "country": "USA"
    },
    "bedrooms": 2,
    "bathrooms": 2,
    "area": 1250,
    "type": "Apartment",
    "status": "For Sale",
    "createdBy": "507f1f77bcf86cd799439010",
    "createdAt": "2025-05-27T02:54:00.000Z",
    "__v": 0
}


403:{
    "error": "Unauthorized to update this property"
}


404:{
    "error": "Property not found"
}





9. DELETE /properties/:id

Description: Delete a property (only by the creator).
Authentication: Required.
Example: /api/properties/507f1f77bcf86cd799439011
Payload: None.
Response:
200:{
    "message": "Property deleted successfully"
}


403:{
    "error": "Unauthorized to delete this property"
}


404:{
    "error": "Property not found"
}





Favorites
10. POST /favorites

Description: Add a property to user’s favorites.
Authentication: Required.
Payload:{
    "propertyId": "507f1f77bcf86cd799439011"
}


Response:
201:{
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439010",
    "propertyId": "507f1f77bcf86cd799439011",
    "__v": 0
}


400:{
    "error": "Error adding to favorites"
}





11. GET /favorites

Description: List user’s favorite properties (cached in Redis).
Authentication: Required.
Payload: None.
Response:
200:[
    {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439010",
        "propertyId": {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Luxury Apartment in Downtown",
            "description": "Spacious 2-bedroom apartment with modern amenities.",
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
            "status": "For Sale",
            "createdBy": "507f1f77bcf86cd799439010",
            "createdAt": "2025-05-27T02:54:00.000Z",
            "__v": 0
        },
        "__v": 0
    }
]


500:{
    "error": "Error fetching favorites"
}





12. DELETE /favorites/:propertyId

Description: Remove a property from user’s favorites.
Authentication: Required.
Example: /api/favorites/507f1f77bcf86cd799439011
Payload: None.
Response:
200:{
    "message": "Removed from favorites"
}


500:{
    "error": "Error removing from favorites"
}





Recommendations
13. POST /recommendations

Description: Recommend a property to another user by email.
Authentication: Required.
Payload:{
    "propertyId": "507f1f77bcf86cd799439011",
    "recipientEmail": "recipient@example.com"
}


Response:
201:{
    "_id": "507f1f77bcf86cd799439013",
    "fromUserId": "507f1f77bcf86cd799439010",
    "toUserId": "507f1f77bcf86cd799439014",
    "propertyId": "507f1f77bcf86cd799439011",
    "createdAt": "2025-05-27T02:54:00.000Z",
    "__v": 0
}


404:{
    "error": "Recipient not found"
}


400:{
    "error": "Error creating recommendation"
}





14. GET /recommendations

Description: List recommendations received by the user (cached in Redis).
Authentication: Required.
Payload: None.
Response:
200:[
    {
        "_id": "507f1f77bcf86cd799439013",
        "fromUserId": {
            "_id": "507f1f77bcf86cd799439010",
            "name": "John Doe",
            "email": "user@example.com"
        },
        "toUserId": "507f1f77bcf86cd799439014",
        "propertyId": {
            "_id": "507f1f77bcf86cd799439011",
            "title": "Luxury Apartment in Downtown",
            "description": "Spacious 2-bedroom apartment with modern amenities.",
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
            "status": "For Sale",
            "createdBy": "507f1f77bcf86cd799439010",
            "createdAt": "2025-05-27T02:54:00.000Z",
            "__v": 0
        },
        "createdAt": "2025-05-27T02:54:00.000Z",
        "__v": 0
    }
]


500:{
    "error": "Error fetching recommendations"
}





