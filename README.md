# QuickNotes System Design

QuickNotes is a browser-based API client and system design project. The client uses JSONPlaceholder to practise loading, creating, and deleting notes, while the documents describe a production API, relational data model, and scalable architecture.

## Features

- Load notes from JSONPlaceholder.
- Create notes with title validation.
- Delete notes from the page.
- Show loading, success, error, and empty states.
- Design documents for the API, data model, and system architecture.

> JSONPlaceholder is a practice API. It simulates creating and deleting notes but does not permanently save those changes on its server.

## Run the API client locally

1. Open this repository folder in VS Code.
2. Start a local web server from the repository root. For example, in the VS Code terminal run:

   ```bash
   python3 -m http.server 8001
   ```

3. Open `http://localhost:8001` in your browser.

You can also use the VS Code Live Server extension and open `index.html` with Live Server.

## Design documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

- How to make asynchronous GET, POST, and DELETE requests with `fetch`.
- How to validate form input and present loading, success, and error states.
- How SQL tables, primary keys, foreign keys, and join tables represent related data.
- How caches, read replicas, queues, and workers help a system scale.