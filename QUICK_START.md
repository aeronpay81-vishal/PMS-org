# Quick Start Guide - 5 Minutes Setup

## 🚀 Quick Setup (5 Steps)

### Step 1: Start XAMPP MySQL
1. Open XAMPP Control Panel
2. Click **Start** next to MySQL
3. Wait for it to show "Running" in green

---

### Step 2: Create Database
Open command line and run:
```bash
mysql -u root -p
# Just press Enter (no password)

CREATE DATABASE project_management;
exit
```

---

### Step 3: Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

---

### Step 4: Initialize Database
```bash
python init_db.py
```

You should see:
```
✅ Database tables created successfully!
```

---

### Step 5: Start Backend Server
```bash
python run.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

---

## ✅ Done! Your Backend is Running

Now test it with **Postman** or similar tool:

### Test 1: Create Account
```
POST http://localhost:5000/api/auth/register
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "full_name": "Test User"
}
```

### Test 2: Login
```
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Copy the `access_token` from response** - You need it for next steps!

### Test 3: Create Project
```
POST http://localhost:5000/api/projects
Headers:
  Authorization: Bearer <your-access-token>
  Content-Type: application/json

{
  "summary": "My Project",
  "description": "Project description",
  "priority": "high"
}
```

---

## 🎯 Want Sample Data?

Run this before starting the server:
```bash
python seed_data.py
```

This creates 3 test users with a sample project and tasks:
- **Owner:** john_owner / password123
- **Manager:** jane_manager / password123  
- **Member:** bob_member / password123

---

## 📁 Project Structure

```
backend/
├── run.py              (Start the server)
├── init_db.py          (Initialize database)
├── seed_data.py        (Add test data)
├── .env                (Configuration)
├── requirements.txt    (Python dependencies)
└── app/
    ├── __init__.py
    ├── config.py
    ├── models/         (Database models)
    ├── services/       (Business logic)
    ├── controllers/    (API handlers)
    ├── routes/         (API endpoints)
    ├── utils/          (Utilities)
    └── middleware/     (Error handlers)
```

---

## 🔧 Common Issues

### ❌ "Can't connect to MySQL"
1. Check XAMPP MySQL is running
2. Verify database URL in `.env`: `DATABASE_URL=mysql+pymysql://root:@localhost:3306/project_management`

### ❌ "ModuleNotFoundError"
Make sure you're in `backend` folder:
```bash
cd backend
python run.py
```

### ❌ "Port 5000 already in use"
Change port in `.env`:
```
PORT=5001
```

### ❌ "Table doesn't exist"
Run database init:
```bash
python init_db.py
```

---

## 📚 What's Available

### User Management
- Register account
- Login / Logout
- Manage profile

### Projects
- Create projects (you become owner)
- Add team members
- Assign manager roles
- Invite members

### Tasks
- Create tasks (Owner/Manager only)
- Assign to team members
- Update status (members can do this)
- Track progress

### Full Role-Based Access Control
- **Owner:** Full control of project
- **Manager:** Can create and assign tasks
- **Member:** Can update assigned tasks

---

## 🎓 Full Documentation

- [Backend Setup Guide](./BACKEND_SETUP_GUIDE.md) - Detailed setup
- [Work Organization](./WORK_ORGANIZATION_STRUCTURE.md) - System features
- [Access Control](./ROLE_BASED_ACCESS_CONTROL.md) - Permission system
- [Architecture](./WORK_ORGANIZATION_ARCHITECTURE.md) - System design

---

## ✨ You're Ready!

Start with Step 1 above and you'll be running in 5 minutes. 🎉

If you need help, check the documentation files or the error messages - they're very helpful!
