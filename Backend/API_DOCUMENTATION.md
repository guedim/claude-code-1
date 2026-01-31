# Platziflix API Documentation

**Base URL**: `http://localhost:8000`
**API Docs (Swagger UI)**: `http://localhost:8000/docs`
**Version**: 0.1.0

---

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication on protected endpoints.

### Obtaining a Token

```bash
POST /auth/token?user_id={user_id}&email={email}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | integer | Yes | User ID to encode in the token |
| email | string | No | Email address (default: test@example.com) |

**Example Request:**
```bash
curl -X POST "http://localhost:8000/auth/token?user_id=42&email=user@example.com"
```

**Example Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user_id": 42
}
```

### Using the Token

Include the token in the `Authorization` header:

```bash
Authorization: Bearer <access_token>
```

**Example:**
```bash
curl -X POST http://localhost:8000/courses/1/ratings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

### Token Configuration

| Setting | Default Value | Environment Variable |
|---------|---------------|---------------------|
| Algorithm | HS256 | `JWT_ALGORITHM` |
| Expiration | 30 minutes | `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` |
| Secret Key | (change in production) | `JWT_SECRET_KEY` |

---

## Endpoints

### Health Check

#### GET /health
Check API and database status.

**Authentication:** Not required

**Response:**
```json
{
  "status": "ok",
  "service": "Platziflix",
  "version": "0.1.0",
  "database": true,
  "courses_count": 10
}
```

---

### Courses

#### GET /courses
Get all courses.

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": 1,
    "name": "Introduction to Python",
    "description": "Learn Python basics",
    "thumbnail": "https://example.com/thumb.jpg",
    "slug": "intro-python",
    "average_rating": 4.5,
    "total_ratings": 120
  }
]
```

#### GET /courses/{slug}
Get course details by slug.

**Authentication:** Not required

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Course URL slug |

**Response:**
```json
{
  "id": 1,
  "name": "Introduction to Python",
  "description": "Learn Python basics",
  "thumbnail": "https://example.com/thumb.jpg",
  "slug": "intro-python",
  "teacher_id": [1, 2],
  "classes": [
    {
      "id": 1,
      "name": "Getting Started",
      "description": "First steps with Python",
      "slug": "getting-started"
    }
  ],
  "average_rating": 4.5,
  "total_ratings": 120,
  "rating_distribution": {
    "1": 5,
    "2": 10,
    "3": 15,
    "4": 40,
    "5": 50
  }
}
```

---

### Ratings

#### POST /courses/{course_id}/ratings
Create or update a rating for a course.

**Authentication:** Required (JWT)

**Request Body:**
```json
{
  "rating": 5
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| rating | integer | Yes | Rating value (1-5) |

**Example:**
```bash
curl -X POST http://localhost:8000/courses/1/ratings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'
```

**Response (201 Created):**
```json
{
  "id": 1,
  "course_id": 1,
  "user_id": 42,
  "rating": 5,
  "created_at": "2025-01-31T10:30:00",
  "updated_at": "2025-01-31T10:30:00"
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 401 | Authentication required |
| 404 | Course not found |
| 422 | Invalid rating value |

---

#### GET /courses/{course_id}/ratings
Get all ratings for a course.

**Authentication:** Not required

**Response:**
```json
[
  {
    "id": 1,
    "course_id": 1,
    "user_id": 42,
    "rating": 5,
    "created_at": "2025-01-31T10:30:00",
    "updated_at": "2025-01-31T10:30:00"
  }
]
```

---

#### GET /courses/{course_id}/ratings/stats
Get aggregated rating statistics for a course.

**Authentication:** Not required

**Response:**
```json
{
  "average_rating": 4.35,
  "total_ratings": 142,
  "rating_distribution": {
    "1": 5,
    "2": 10,
    "3": 25,
    "4": 50,
    "5": 52
  }
}
```

---

#### GET /courses/{course_id}/ratings/user/{user_id}
Get a specific user's rating for a course.

**Authentication:** Not required

**Response (200):**
```json
{
  "id": 1,
  "course_id": 1,
  "user_id": 42,
  "rating": 5,
  "created_at": "2025-01-31T10:30:00",
  "updated_at": "2025-01-31T10:30:00"
}
```

**Response (204):** User has not rated this course.

---

#### PUT /courses/{course_id}/ratings/{user_id}
Update an existing rating.

**Authentication:** Required (JWT)

**Authorization:** User can only update their own ratings.

**Request Body:**
```json
{
  "rating": 4
}
```

**Example:**
```bash
curl -X PUT http://localhost:8000/courses/1/ratings/42 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4}'
```

**Response (200):**
```json
{
  "id": 1,
  "course_id": 1,
  "user_id": 42,
  "rating": 4,
  "created_at": "2025-01-31T10:30:00",
  "updated_at": "2025-01-31T11:00:00"
}
```

**Error Responses:**
| Status | Description |
|--------|-------------|
| 401 | Authentication required |
| 403 | Cannot update another user's rating |
| 404 | Rating not found |

---

#### DELETE /courses/{course_id}/ratings/{user_id}
Delete a rating (soft delete).

**Authentication:** Required (JWT)

**Authorization:** User can only delete their own ratings.

**Example:**
```bash
curl -X DELETE http://localhost:8000/courses/1/ratings/42 \
  -H "Authorization: Bearer <token>"
```

**Response:** 204 No Content

**Error Responses:**
| Status | Description |
|--------|-------------|
| 401 | Authentication required |
| 403 | Cannot delete another user's rating |
| 404 | Rating not found |

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common HTTP Status Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (success, no body) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Unprocessable Entity (validation error) |
| 500 | Internal Server Error |

---

## Quick Start Examples

### Complete Flow: Rate a Course

```bash
# 1. Get a JWT token
TOKEN=$(curl -s -X POST "http://localhost:8000/auth/token?user_id=100" | jq -r '.access_token')

# 2. Create a rating
curl -X POST http://localhost:8000/courses/1/ratings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 5}'

# 3. View course ratings
curl http://localhost:8000/courses/1/ratings

# 4. View rating statistics
curl http://localhost:8000/courses/1/ratings/stats

# 5. Update your rating
curl -X PUT http://localhost:8000/courses/1/ratings/100 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"rating": 4}'

# 6. Delete your rating
curl -X DELETE http://localhost:8000/courses/1/ratings/100 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Security Notes

1. **Token Generation Endpoint**: The `/auth/token` endpoint is for development/testing only. In production, tokens should be issued by a proper authentication service.

2. **JWT Secret**: Change `JWT_SECRET_KEY` in production via environment variable.

3. **Authorization**: Users can only modify (update/delete) their own ratings. Attempting to modify another user's rating returns 403 Forbidden.

4. **Public Endpoints**: GET endpoints for courses and ratings are public (no auth required).

5. **Protected Endpoints**: POST, PUT, DELETE on ratings require JWT authentication.
