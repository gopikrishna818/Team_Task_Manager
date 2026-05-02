# TaskFlow API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-backend.up.railway.app/api`

## Authentication

All requests (except `/auth/signup` and `/auth/login`) require a Bearer token:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Token is obtained from `/auth/signup` or `/auth/login` responses.

---

## Endpoints

### Authentication

#### POST /auth/signup
Create a new user account.

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201):
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "JD"
  }
}
```

**Errors**:
- `400`: Name, email, or password missing
- `400`: Password less than 6 characters
- `400`: Invalid email format
- `400`: Email already registered

---

#### POST /auth/login
Authenticate user and get JWT token.

**Request**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "JD"
  }
}
```

**Errors**:
- `400`: Email or password missing
- `401`: Invalid email or password

---

#### GET /auth/me
Get current authenticated user.

**Request**: 
```
GET /api/auth/me
Authorization: Bearer <TOKEN>
```

**Response** (200):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "JD"
}
```

**Errors**:
- `401`: Token missing or invalid

---

### Projects

#### GET /projects
Get all projects for the authenticated user.

**Request**:
```
GET /api/projects
Authorization: Bearer <TOKEN>
```

**Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Website Redesign",
    "description": "Revamp company website",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "avatar": "AJ"
    },
    "members": [
      {
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "JD"
        },
        "role": "Admin",
        "joinedAt": "2024-05-01T10:00:00.000Z"
      }
    ],
    "createdAt": "2024-05-01T10:00:00.000Z",
    "updatedAt": "2024-05-01T10:00:00.000Z"
  }
]
```

**Errors**:
- `401`: Unauthorized

---

#### POST /projects
Create a new project.

**Request**:
```json
{
  "name": "New Project",
  "description": "Project description"
}
```

**Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "New Project",
  "description": "Project description",
  "createdBy": "507f1f77bcf86cd799439012",
  "members": [
    {
      "userId": "507f1f77bcf86cd799439011",
      "role": "Admin",
      "joinedAt": "2024-05-01T10:00:00.000Z"
    }
  ],
  "createdAt": "2024-05-01T10:00:00.000Z",
  "updatedAt": "2024-05-01T10:00:00.000Z"
}
```

**Errors**:
- `400`: Project name is required
- `401`: Unauthorized

---

#### GET /projects/:id
Get a specific project.

**Request**:
```
GET /api/projects/507f1f77bcf86cd799439011
Authorization: Bearer <TOKEN>
```

**Response** (200): Same as POST response

**Errors**:
- `404`: Project not found
- `403`: Not authorized to view this project

---

#### PUT /projects/:id
Update project details (Admin only).

**Request**:
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response** (200): Updated project object

**Errors**:
- `403`: Only admins can update projects
- `404`: Project not found

---

#### DELETE /projects/:id
Delete a project and all associated tasks (Admin only).

**Request**:
```
DELETE /api/projects/507f1f77bcf86cd799439011
Authorization: Bearer <TOKEN>
```

**Response** (200):
```json
{
  "message": "Project deleted"
}
```

**Errors**:
- `403`: Only admins can delete projects
- `404`: Project not found

---

#### POST /projects/:id/members
Add a member to a project (Admin only).

**Request**:
```json
{
  "email": "newmember@example.com",
  "role": "Member"
}
```

**Response** (200): Updated project object

**Errors**:
- `400`: Email is required or already a member
- `403`: Only admins can add members
- `404`: User not found

---

#### DELETE /projects/:id/members
Remove a member from a project (Admin only).

**Request**:
```json
{
  "memberId": "507f1f77bcf86cd799439011"
}
```

**Response** (200): Updated project object

**Errors**:
- `400`: Cannot remove the last admin
- `403`: Only admins can remove members
- `404`: Project not found

---

### Tasks

#### GET /tasks
Get tasks (filtered by project if query param provided).

**Request**:
```
GET /api/tasks?projectId=507f1f77bcf86cd799439011&status=To%20Do
Authorization: Bearer <TOKEN>
```

**Query Parameters**:
- `projectId`: (optional) Filter by project
- `status`: (optional) Filter by status (To Do, In Progress, Done)

**Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "title": "Design homepage",
    "description": "Create mockup for homepage",
    "projectId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Website Redesign"
    },
    "assignedTo": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "JD"
    },
    "createdBy": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "avatar": "AJ"
    },
    "status": "In Progress",
    "priority": "High",
    "dueDate": "2024-05-15T00:00:00.000Z",
    "createdAt": "2024-05-01T10:00:00.000Z",
    "updatedAt": "2024-05-01T10:00:00.000Z"
  }
]
```

**Errors**:
- `401`: Unauthorized

---

#### POST /tasks
Create a new task (Admin only).

**Request**:
```json
{
  "title": "Design homepage",
  "description": "Create mockup for homepage",
  "projectId": "507f1f77bcf86cd799439011",
  "assignedTo": "507f1f77bcf86cd799439012",
  "priority": "High",
  "dueDate": "2024-05-15"
}
```

**Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "title": "Design homepage",
  "description": "Create mockup for homepage",
  "projectId": {...},
  "assignedTo": {...},
  "createdBy": {...},
  "status": "To Do",
  "priority": "High",
  "dueDate": "2024-05-15T00:00:00.000Z",
  "createdAt": "2024-05-01T10:00:00.000Z",
  "updatedAt": "2024-05-01T10:00:00.000Z"
}
```

**Errors**:
- `400`: Title, projectId, assignedTo, or dueDate missing
- `403`: Only admins can create tasks

---

#### GET /tasks/:id
Get a specific task.

**Request**:
```
GET /api/tasks/507f1f77bcf86cd799439020
Authorization: Bearer <TOKEN>
```

**Response** (200): Task object (same as POST response)

**Errors**:
- `404`: Task not found

---

#### PUT /tasks/:id
Update a task.

**Request**:
```json
{
  "status": "In Progress",
  "priority": "Medium",
  "title": "Updated title"
}
```

**Note**: Members can only update status of their own tasks. Admins can update all fields.

**Response** (200): Updated task object

**Errors**:
- `403`: Not authorized to update this task
- `404`: Task not found

---

#### DELETE /tasks/:id
Delete a task (Admin only).

**Request**:
```
DELETE /api/tasks/507f1f77bcf86cd799439020
Authorization: Bearer <TOKEN>
```

**Response** (200):
```json
{
  "message": "Task deleted"
}
```

**Errors**:
- `403`: Only admins can delete tasks
- `404`: Task not found

---

#### GET /tasks/my-tasks
Get user's assigned tasks.

**Request**:
```
GET /api/tasks/my-tasks
Authorization: Bearer <TOKEN>
```

**Response** (200): Array of task objects

**Errors**:
- `401`: Unauthorized

---

### Dashboard

#### GET /dashboard
Get dashboard statistics.

**Request**:
```
GET /api/dashboard
Authorization: Bearer <TOKEN>
```

**Response** (200):
```json
{
  "projects": 3,
  "totalTasks": 15,
  "myTasks": 5,
  "overdue": 2,
  "byStatus": {
    "To Do": 8,
    "In Progress": 4,
    "Done": 3
  },
  "byUser": [
    {
      "user": {
        "id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "avatar": "JD"
      },
      "count": 5
    }
  ],
  "recentTasks": [
    {...}
  ]
}
```

**Errors**:
- `401`: Unauthorized

---

## Error Response Format

All errors return with appropriate HTTP status code and JSON:

```json
{
  "message": "Error description"
}
```

---

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error

---

## Rate Limiting

Currently no rate limiting applied. For production, consider implementing rate limiting per IP/user.

---

## CORS

The API accepts requests from:
- Development: `http://localhost:5173`
- Production: Configured via `CORS_ORIGIN` environment variable

---

## Testing

You can test these endpoints using:
- **Postman**: https://www.postman.com
- **Insomnia**: https://insomnia.rest
- **cURL**: Command line
- **Thunder Client**: VS Code extension

Example cURL request:
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```
