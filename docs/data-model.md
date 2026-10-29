# QuickNotes Data Model

QuickNotes uses a relational SQL database. The four tables below store users, their notes, reusable tags, and the links between notes and tags.

## Entities and relationships

- **Users:** Stores each user's account information. One user can have many notes and many tags.
- **Notes:** Stores a note's title, body, and timestamps. Each note belongs to one user.
- **Tags:** Stores tag names created by a user. Each tag belongs to one user.
- **Note_tags:** Links notes to tags. This join table is needed because one note can have several tags, and one tag can be used on several notes. Together, notes and tags have a many-to-many relationship.

## Table definitions

```sql
CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tags (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, name)
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);
```

## Example queries

### List a user's notes

```sql
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;
```

### Find notes with a particular tag

```sql
SELECT notes.id, notes.title, notes.body, tags.name AS tag
FROM notes
JOIN note_tags ON notes.id = note_tags.note_id
JOIN tags ON note_tags.tag_id = tags.id
WHERE notes.user_id = 1
  AND tags.name = 'work';
```

### Count notes for each user

```sql
SELECT users.id, users.name, COUNT(notes.id) AS note_count
FROM users
LEFT JOIN notes ON users.id = notes.user_id
GROUP BY users.id, users.name;
```

## Index

I would add an index on `notes(user_id, created_at)`. The application often retrieves one user's notes ordered by creation time, and this index helps the database find and sort those notes efficiently.

```sql
CREATE INDEX idx_notes_user_created
ON notes(user_id, created_at DESC);
```

## Database choice

I would use SQL, such as PostgreSQL, for QuickNotes. Users, notes, and tags have clear relationships, and foreign keys help keep those relationships valid. Transactions also help ensure that related changes, such as adding a note and connecting its tags, are handled consistently. A NoSQL database could be useful if the data structure changed frequently or needed to scale across many distributed regions, but the relational structure and consistency needs make SQL a good fit here.