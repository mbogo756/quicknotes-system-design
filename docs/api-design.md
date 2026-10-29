# QuickNotes API Design

Base path: `/api/v1`

All requests and responses use JSON. Endpoints that access a user's notes require authentication.

## Endpoints

### List notes

- **Method:** GET
- **Path:** `/api/v1/notes`
- **Description:** Return the authenticated user's notes, newest first.
- **Success:** `200 OK`

Example response:

```json
{
  "notes": [
    {
      "id": 42,
      "title": "Plan the week",
      "body": "Review tasks and set priorities.",
      "createdAt": "2026-10-29T10:30:00Z",
      "updatedAt": "2026-10-29T10:30:00Z"
    }
  ]
}
```

### Get one note

- **Method:** GET
- **Path:** `/api/v1/notes/{id}`
- **Description:** Return one note belonging to the authenticated user.
- **Success:** `200 OK`

### Create a note

- **Method:** POST
- **Path:** `/api/v1/notes`
- **Description:** Create a note for the authenticated user.
- **Success:** `201 Created`

Example request:

```json
{
  "title": "Plan the week",
  "body": "Review tasks and set priorities."
}
```

Example response:

```json
{
  "id": 42,
  "title": "Plan the week",
  "body": "Review tasks and set priorities.",
  "createdAt": "2026-10-29T10:30:00Z",
  "updatedAt": "2026-10-29T10:30:00Z"
}
```

### Update a note

- **Method:** PATCH
- **Path:** `/api/v1/notes/{id}`
- **Description:** Update the supplied fields of a note belonging to the authenticated user.
- **Success:** `200 OK`

### Delete a note

- **Method:** DELETE
- **Path:** `/api/v1/notes/{id}`
- **Description:** Delete a note belonging to the authenticated user.
- **Success:** `204 No Content`

### List notes by tag

- **Method:** GET
- **Path:** `/api/v1/notes?tag=work`
- **Description:** Return the authenticated user's notes with the specified tag.
- **Success:** `200 OK`

### List the user's tags

- **Method:** GET
- **Path:** `/api/v1/tags`
- **Description:** Return tags available to the authenticated user.
- **Success:** `200 OK`

## Error responses

Errors use a consistent JSON body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required."
  }
}
```

- **400 Bad Request:** The title is missing or exceeds 100 characters.
- **401 Unauthorized:** The request has no valid authentication token.
- **403 Forbidden:** The user is authenticated but attempts to access a resource they are not allowed to use.
- **404 Not Found:** The requested note or tag does not exist, or does not belong to the authenticated user.
- **500 Internal Server Error:** An unexpected server failure prevents the request from completing.