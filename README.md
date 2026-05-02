# TaskFlow — Team Task Management

A full-stack collaborative task management web application built with **React + Vite** (frontend) and **Node.js + Express** (backend), featuring role-based access control, a bento-grid dashboard, and **MongoDB persistence**.

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Frontend Setup

```bash
# Navigate to frontend directory (root)
cd ..

# Install dependencies
npm install

# Configure API endpoint
# .env file already configured for http://localhost:5000/api

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Testing the App

1. Open **http://localhost:5173** in your browser
2. Login with demo credentials:
   - **Email:** alice@demo.com
   - **Password:** demo123

---

## 🔐 Demo Accounts

All demo accounts use password: `demo123`

| Name | Email | Role in Sample Projects |
|---|---|---|
| Alice Johnson | alice@demo.com | Admin (Website Redesign) |
| Bob Martinez | bob@demo.com | Admin (Mobile App Launch) |
| Carol Singh | carol@demo.com | Admin (Data Pipeline) |
| David Park | david@demo.com | Member |

---

## ✅ Functional Requirements Coverage

### 1. User Authentication ✅
- [x] Signup with Name, Email, Password
- [x] Email format validation
- [x] Password minimum 6 characters
- [x] Duplicate email detection
- [x] JWT token-based authentication
- [x] Secure password hashing (bcryptjs)
- [x] Auto-login on session restore
- [x] Backend JWT validation

### 2. Project Management ✅
- [x] Create projects (creator becomes Admin automatically)
- [x] Admin can add members by email
- [x] Admin can remove members
- [x] Members only see projects they belong to
- [x] Admin can delete projects (cascades to tasks)
- [x] Progress percentage shown per project
- [x] Database persistence (MongoDB)

### 3. Task Management ✅
- [x] Create tasks (Title, Description, Due Date, Priority)
- [x] Assign tasks to project members
- [x] Update status: To Do → In Progress → Done
- [x] Visual overdue detection (red border + warning badge)
- [x] Kanban board view (3 columns)
- [x] Filter tasks by status
- [x] Database task persistence

### 4. Dashboard ✅
- [x] Total tasks count
- [x] Tasks by status (bar chart)
- [x] Tasks per user (workload bars)
- [x] Overdue tasks count
- [x] My tasks count
- [x] Recent activity feed
- [x] Real-time dashboard data from backend

### 5. Role-Based Access Control ✅
| Feature | Admin | Member |
|---|---|---|
| Create tasks | ✅ | ❌ |
| Edit all task fields | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks only) |
| Delete tasks | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| View all project tasks | ✅ | ❌ |
| View own tasks only | — | ✅ |

### 6. Backend & Database ✅
- [x] RESTful API with Express.js
- [x] MongoDB database with Mongoose ODM
- [x] Proper relationships (Users, Projects, Tasks)
- [x] Input validation and error handling
- [x] JWT authentication middleware
- [x] CORS configuration
- [x] Secure API endpoints

### 7. Frontend Integration ✅
- [x] Axios for HTTP requests
- [x] Dynamic data from backend
- [x] Error handling & user feedback
- [x] Loading states
- [x] Token-based authentication flow

---

## 🏗️ Architecture

### Frontend Structure
```
src/
├── App.jsx       # Main app component with routing
├── data.js       # API client with axios (backend integration)
├── ui.jsx        # Shared UI components (Avatar, Modal, Badge, etc.)
├── index.css     # Design system (white bento-grid theme)
├── main.jsx      # React entry point
└── assets/       # Static assets
```

### Backend Structure
```
server/
├── server.js               # Express server entry point
├── package.json            # Dependencies
├── .env                    # Environment variables
├── models/
│   ├── User.js            # User schema with password hashing
│   ├── Project.js         # Project schema with members array
│   └── Task.js            # Task schema with relationships
├── controllers/
│   ├── authController.js  # Login, signup, auth logic
│   ├── projectController.js
│   ├── taskController.js
│   └── dashboardController.js
├── routes/
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   ├── taskRoutes.js
│   └── dashboardRoutes.js
└── middleware/
    ├── auth.js            # JWT verification
    └── errorHandler.js    # Global error handling
```

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

#### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add member to project
- `DELETE /api/projects/:id/members` - Remove member from project

#### Tasks
- `GET /api/tasks?projectId=:id` - Get tasks in project
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/my-tasks` - Get user's assigned tasks

#### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

---

## 🚀 Deployment to Railway

### Step 1: Prepare for Deployment

#### Backend Configuration
1. Create `server/Procfile` (already included in deploy steps):
   ```
   web: npm start
   ```

2. Update `server/package.json` start script to use production port:
   ```json
   "start": "node server.js"
   ```

3. Create `server/railway.json` for Railway configuration:
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "dockerfile",
       "context": "."
     },
     "deploy": {
       "numReplicas": 1,
       "startCommand": "npm start"
     }
   }
   ```

#### Frontend Configuration
1. Update `vite.config.js` for production build:
   ```javascript
   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000
     }
   })
   ```

2. Update `.env` for production:
   ```
   VITE_API_URL=https://your-backend-url.up.railway.app/api
   ```

### Step 2: Deploy to Railway

#### Option A: Using Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Deploy Backend**:
   ```bash
   cd server
   railway init
   # Select "Create a new project"
   # Name: taskflow-backend
   
   # Add MongoDB plugin
   railway add
   # Select MongoDB
   
   # Configure environment variables
   railway variables
   # Set JWT_SECRET and CORS_ORIGIN
   
   # Deploy
   railway deploy
   ```

4. **Deploy Frontend**:
   ```bash
   cd ..
   railway init
   # Select existing project or create new: taskflow-frontend
   
   # Update .env with backend URL from Railway
   railway variables
   # Set VITE_API_URL to your backend URL
   
   railway deploy
   ```

#### Option B: Using Railway Dashboard

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub repository
4. Create two services:
   - **Backend Service**: Points to `/server` directory
   - **Frontend Service**: Points to root directory
5. Add environment variables for each service
6. Enable auto-deploy on push

### Step 3: Configure Environment Variables on Railway

#### Backend
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Random secret key (use: `openssl rand -base64 32`)
- `NODE_ENV`: `production`
- `PORT`: `8000` (Railway assigns this)
- `CORS_ORIGIN`: Your frontend URL

#### Frontend
- `VITE_API_URL`: Your backend Railway URL (e.g., https://taskflow-backend.up.railway.app/api)

### Step 4: Verify Deployment

1. Visit your frontend URL
2. Test login with demo credentials
3. Check MongoDB connection
4. Verify API calls are working

---

## 🛠️ Development

### Running Tests Locally
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev

# Terminal 3: Access at http://localhost:5173
```

### Building for Production
```bash
# Frontend build
npm run build

# Backend is production-ready (no build step needed)
```

### Environment Variables

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:5000/api
```

**Backend (server/.env)**:
```
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

---

## 📝 API Documentation

### Request/Response Format

All requests use JSON format with Bearer token authentication:

```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Error Handling

All errors follow this format:
```json
{
  "message": "Error description"
}
```

Common status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Secure environment variables
- ✅ Protected API endpoints

---

## 📊 Database Schema

### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String (initials),
  createdAt: Date,
  updatedAt: Date
}
```

### Projects
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdBy: ObjectId (ref: User),
  members: [{
    userId: ObjectId (ref: User),
    role: String ('Admin' | 'Member'),
    joinedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Tasks
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  projectId: ObjectId (ref: Project),
  assignedTo: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  status: String ('To Do' | 'In Progress' | 'Done'),
  priority: String ('Low' | 'Medium' | 'High'),
  dueDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 UI/UX Features

- Bento-grid dashboard layout
- Kanban board for task management
- Avatar system with user initials
- Priority and status badges
- Overdue task detection
- Progress bars
- Responsive design
- Clean, modern interface

---

## 📦 Dependencies

### Frontend
- react@19.2.5
- react-dom@19.2.5
- axios@1.6.2

### Backend
- express@4.18.2
- mongoose@8.0.3
- jsonwebtoken@9.1.2
- bcryptjs@2.4.3
- cors@2.8.5
- dotenv@16.3.1

---

## 📄 License

This project is provided as-is for educational purposes.

---

## 🤝 Support

For issues or questions, please check:
1. Backend logs: `npm run dev` output
2. Frontend console: Browser DevTools (F12)
3. MongoDB connection: Check `.env` file

---

## ✨ Key Features

✅ Full-stack application with MongoDB persistence
✅ JWT-based authentication with secure password storage
✅ Role-based access control (Admin/Member)
✅ Kanban board task management
✅ Real-time dashboard with statistics
✅ Team collaboration features
✅ Responsive design
✅ Production-ready deployment to Railway
✅ Comprehensive error handling
✅ RESTful API design
- [x] Password minimum 6 characters
- [x] Duplicate email detection
- [x] JWT-style token stored in localStorage
- [x] 24-hour session with auto-login on refresh

### 2. Project Management
- [x] Create projects (creator becomes Admin automatically)
- [x] Admin can add members by email
- [x] Admin can remove members
- [x] Members only see projects they belong to
- [x] Admin can delete projects (cascades to tasks)
- [x] Progress percentage shown per project

### 3. Task Management
- [x] Create tasks with Title, Description, Due Date, Priority
- [x] Assign tasks to project members
- [x] Update status: To Do → In Progress → Done
- [x] Visual overdue detection (red border + warning badge)
- [x] Kanban board view (3 columns)
- [x] Filter tasks by status

### 4. Dashboard
- [x] Total tasks count
- [x] Tasks by status (bar chart)
- [x] Tasks per user (workload bars)
- [x] Overdue tasks count
- [x] My tasks count
- [x] Recent activity feed

### 5. Role-Based Access Control
| Feature | Admin | Member |
|---|---|---|
| Create tasks | ✅ | ❌ |
| Edit all task fields | ✅ | ❌ |
| Update task status | ✅ | ✅ (own tasks only) |
| Delete tasks | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| View all project tasks | ✅ | ❌ |
| View own tasks only | — | ✅ |

---

## 🏗️ Architecture

```
src/
├── data.js       # In-memory DB + localStorage persistence + API layer
├── ui.jsx        # Shared UI components (Avatar, Modal, Badge, etc.)
├── App.jsx       # All views (Auth, Dashboard, Projects, Tasks, MyTasks)
├── index.css     # Design system (white bento-grid theme)
└── main.jsx      # React entry point
```

### API Design (RESTful simulation)

| Method | Endpoint | Handler |
|---|---|---|
| POST | /auth/login | `api.login()` |
| POST | /auth/signup | `api.signup()` |
| GET | /projects | `api.getProjects()` |
| POST | /projects | `api.createProject()` |
| DELETE | /projects/:id | `api.deleteProject()` |
| POST | /projects/:id/members | `api.addMember()` |
| DELETE | /projects/:id/members/:mid | `api.removeMember()` |
| GET | /projects/:id/tasks | `api.getTasks()` |
| POST | /projects/:id/tasks | `api.createTask()` |
| PUT | /projects/:id/tasks/:tid | `api.updateTask()` |
| DELETE | /projects/:id/tasks/:tid | `api.deleteTask()` |
| GET | /dashboard | `api.getDashboard()` |

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Vanilla CSS (custom design system) |
| State | React hooks (useState, useEffect, useCallback) |
| Auth | JWT-style tokens (base64) + localStorage |
| Database | localStorage (browser-persistent) |
| Font | Inter (Google Fonts) |

---

## 🔧 Troubleshooting

### Layout not filling the screen?
If the dashboard appears narrow or centered, your browser may be caching the old layout.
**Fix:** Perform a **Hard Refresh** (`Ctrl + Shift + R` or `Cmd + Shift + R`).

### Data not appearing?
The dashboard re-fetches data on mount. If you create a project or task and it doesn't appear, try switching tabs and coming back.

