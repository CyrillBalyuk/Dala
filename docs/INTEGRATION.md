# Integration Documentation

## API Endpoints

This document describes the integration points required for the Dala platform backend integration.

### Authentication

#### POST /api/auth/login
Authenticate user with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### POST /api/auth/register
Register new user account.

**Request:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Courses

#### GET /api/courses
Get list of all available courses.

**Response:**
```json
{
  "success": true,
  "courses": [
    {
      "id": "course_id",
      "title": "Course Title",
      "description": "Course description",
      "price": 29.99,
      "duration": "4 weeks",
      "level": "Beginner",
      "image": "course_image_url",
      "modules": ["module1", "module2"]
    }
  ]
}
```

#### GET /api/course/:id
Get detailed information about specific course.

**Response:**
```json
{
  "success": true,
  "course": {
    "id": "course_id",
    "title": "Course Title",
    "description": "Detailed course description",
    "price": 29.99,
    "duration": "4 weeks",
    "level": "Beginner",
    "image": "course_image_url",
    "modules": [
      {
        "id": "module_id",
        "title": "Module Title",
        "description": "Module description",
        "lessons": ["lesson1", "lesson2"]
      }
    ]
  }
}
```

### Payments

#### POST /api/purchase
Purchase course subscription.

**Request:**
```json
{
  "userId": "user_id",
  "subscriptionType": "premium",
  "courseId": "course_id"
}
```

**Response:**
```json
{
  "success": true,
  "purchaseId": "purchase_id",
  "subscriptionType": "premium",
  "expiryDate": "2024-12-31T23:59:59Z"
}
```

### Applications

#### POST /api/applications
Apply for vacancy.

**Request:**
```json
{
  "userId": "user_id",
  "vacancyId": "vacancy_id",
  "resume": "resume_text_or_file_url",
  "coverLetter": "cover_letter_text"
}
```

**Response:**
```json
{
  "success": true,
  "applicationId": "application_id",
  "status": "submitted"
}
```

### User Progress

#### GET /api/user/progress
Get user's course progress.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "progress": {
    "courses": [
      {
        "courseId": "course_id",
        "completedModules": ["module1"],
        "currentModule": "module2",
        "overallProgress": 50
      }
    ],
    "certificates": [
      {
        "courseId": "course_id",
        "issuedDate": "2024-01-15T10:00:00Z",
        "certificateUrl": "certificate_download_url"
      }
    ]
  }
}
```

## Implementation

### API Service Integration

Create or update `src/services/api.ts` with the following stub functions for quick switching to real endpoints:

```typescript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

// Authentication
export const login = async (email: string, password: string) => {
  // Stub implementation - replace with real API call
  return {
    success: true,
    token: 'mock_token',
    user: { id: '1', email, name: 'Mock User' }
  };

  // Real implementation:
  // const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });
  // return response.json();
};

export const register = async (name: string, email: string, password: string) => {
  // Stub implementation
  return {
    success: true,
    token: 'mock_token',
    user: { id: '1', email, name }
  };
};

export const getCourses = async () => {
  // Stub implementation - replace with real API call
  return {
    success: true,
    courses: [] // Return mock data or load from local JSON
  };
};

export const getCourse = async (id: string) => {
  // Stub implementation
  return {
    success: true,
    course: {} // Return mock course data
  };
};

export const purchaseCourse = async (userId: string, subscriptionType: string, courseId: string) => {
  // Stub implementation
  return {
    success: true,
    purchaseId: 'mock_purchase',
    subscriptionType,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  };
};

export const applyForVacancy = async (userId: string, vacancyId: string, resume: string, coverLetter: string) => {
  // Stub implementation
  return {
    success: true,
    applicationId: 'mock_application',
    status: 'submitted'
  };
};

export const getUserProgress = async (token: string) => {
  // Stub implementation
  return {
    success: true,
    progress: {
      courses: [],
      certificates: []
    }
  };
};
```

### Environment Variables

Set up environment variables in `.env.example` and your local `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:3001
```

For production deployment, update `REACT_APP_API_BASE_URL` to your actual backend URL.