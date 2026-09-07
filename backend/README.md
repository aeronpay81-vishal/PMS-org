# Flask Auth API - MVC Architecture with JWT

A production-ready Flask authentication API using **MVC (Model-View-Controller)** pattern with **JWT token-based authentication**.

## 📁 Project Structure (MVC Pattern)

```
flask_auth_mvc/
├── app/
│   ├── __init__.py                 # App factory
│   ├── config.py                   # Configuration
│   ├── models/                     # M - Database Models
│   │   ├── __init__.py
│   │   └── user.py                 # User model
│   ├── controllers/                # C - Business Logic Controllers
│   │   ├── __init__.py
│   │   └── auth_controller.py      # Auth controller
│   ├── services/                   # Service Layer (Business Logic)
│   │   ├── __init__.py
│   │   └── auth_service.py         # Auth service
│   ├── routes/                     # V - Views (API Endpoints)
│   │   ├── __init__.py
│   │   └── auth.py                 # Auth routes
│   ├── utils/                      # Utilities
│   │   ├── __init__.py
│   │   ├── jwt_handler.py          # JWT utilities
│   │   └── decorators.py           # Custom decorators
│   └── middleware/                 # Middleware
│       ├── __init__.py
│       └── error_handler.py        # Error handling
├── run.py                          # Application entry point
├── requirements.txt                # Dependencies
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore
└── README.md                       # This file
```

## 🏗️ Architecture Overview

### MVC Pattern Breakdown:

**Model (M)** - `app/models/`
- Represents data structure
- User model with database ORM (SQLAlchemy)
- Contains password hashing methods

**View (V)** - `app/routes/`
- API endpoints (Flask blueprints)
- Handles HTTP requests and responses
- Calls controllers to process requests

**Controller (C)** - `app/controllers/`
- Processes HTTP requests
- Calls service layer for business logic
- Returns formatted responses

**Service Layer** - `app/services/`
- Contains all business logic
- Handles authentication operations
- Database operations and validation

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate (choose based on your OS)
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows

# Install packages
pip install -r requirements.txt
```

### 2. Setup Environment

```bash
cp .env.example .env
# Edit .env as needed to match your MySQL server
# Example:
# DATABASE_URL=mysql+pymysql://username:password@localhost:3306/pms_db
```

### 3. Run Server

```bash
python run.py
```

Server starts at: **http://localhost:5000**

## 📡 API Endpoints

### 1. **Signup** - Create New User
```
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "full_name": "John Doe",
      "is_active": true,
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 2. **Login** - Authenticate User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 3. **Get Current User** - User Info
```
GET /api/auth/me
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### 4. **Refresh Token** - Get New Access Token
```
POST /api/auth/refresh
Authorization: Bearer {refresh_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 5. **Logout** - Logout User
```
POST /api/auth/logout
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 🔐 JWT Token Authentication

### Token Types:
- **Access Token**: Valid for 1 hour - Use for API requests
- **Refresh Token**: Valid for 30 days - Use to get new access token

### Using Tokens:
```bash
# Add to request header
Authorization: Bearer {your_token}

# Example with curl
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:5000/api/auth/me
```

## 🧪 Testing

### Test with cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get User (with token):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📋 Code Flow

### Signup Flow:
```
Route: /api/auth/signup
  ↓
Controller: AuthController.signup()
  ↓
Service: AuthService.signup()
  ↓
Model: User.set_password() → Database
  ↓
Response: JSON with tokens
```

### Login Flow:
```
Route: /api/auth/login
  ↓
Controller: AuthController.login()
  ↓
Service: AuthService.login()
  ↓
Model: User.check_password() → Validate
  ↓
Tokens: generate_tokens(user_id)
  ↓
Response: JSON with tokens
```

### Protected Route Flow:
```
Route: /api/auth/me (with @jwt_required)
  ↓
Middleware: JWT verification
  ↓
Controller: Gets current_user_id from token
  ↓
Service: AuthService.get_user_by_id(user_id)
  ↓
Response: User data
```

## 🔧 Configuration

Edit `.env` file:

```env
# Development/Production
FLASK_ENV=development

# Database (SQLite by default)
DATABASE_URL=sqlite:///auth.db

# JWT Secret (Change this!)
JWT_SECRET_KEY=your-secret-key-here

# Server
HOST=0.0.0.0
PORT=5000
```

## 📦 Dependencies

- **Flask**: Web framework
- **Flask-SQLAlchemy**: ORM for database
- **Flask-JWT-Extended**: JWT authentication
- **Flask-CORS**: CORS support
- **Werkzeug**: Password hashing
- **python-dotenv**: Environment variables

## ✨ Features

✅ MVC Architecture  
✅ JWT Token Authentication  
✅ Access & Refresh Tokens  
✅ Password Hashing (PBKDF2)  
✅ SQLAlchemy ORM  
✅ CORS Enabled  
✅ Error Handling  
✅ Input Validation  
✅ Service Layer Abstraction  
✅ JWT Error Handlers  
✅ Custom Decorators  

## 🛡️ Security Features

- Passwords hashed with PBKDF2:SHA256
- JWT tokens with expiration
- Token refresh mechanism
- Input validation
- Error messages don't leak user info
- CORS protection

## 🚨 Error Responses

```json
{
  "success": false,
  "message": "Error description"
}
```

Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## 🔄 Database

Default: **SQLite** (auth.db)

To use PostgreSQL:
1. Install: `pip install psycopg2-binary`
2. Update `.env`: `DATABASE_URL=postgresql://user:pass@localhost/auth_db`

## 📚 Project Advantages

### MVC Pattern Benefits:
✅ **Separation of Concerns** - Each layer has specific responsibility  
✅ **Maintainability** - Easy to modify and test  
✅ **Scalability** - Simple to add new features  
✅ **Reusability** - Services can be used in multiple controllers  
✅ **Testability** - Each component can be tested independently  

### Clean Architecture:
- Controllers handle HTTP requests
- Services contain business logic
- Models represent data
- Routes define endpoints
- Middleware handles cross-cutting concerns

## 🚀 Next Steps

1. Test API with provided examples
2. Integrate with React frontend (see REACT_INTEGRATION.md)
3. Add database migrations
4. Deploy to production
5. Add additional features as needed

---

**Ready to use! Happy coding! 🎉**
