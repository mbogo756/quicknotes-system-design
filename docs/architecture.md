# QuickNotes Architecture

## Requirements

### Functional requirements

- Users can create, read, update, delete, and search their notes.
- Users can organize notes with tags.
- Each user can access only their own notes.
- Users can sign in securely from a browser or mobile device.

### Non-functional requirements

- The service should remain available when an application server fails.
- Common requests should respond quickly, including during busy periods.
- User data should be protected in transit and at rest.
- Notes should be backed up and recoverable after a database failure.
- The system should scale as the number of users and notes grows.

## Load estimate for 1 million users

### Assumptions

- There are 1 million registered users.
- 10% of users are active each day, giving 100,000 daily active users.
- Each active user loads the notes list 20 times and creates 1 note per day.
- An average stored note, including its text and basic record fields, uses about 2 KB.
- The estimate covers average daily traffic and one year of new note storage. It excludes backups and index overhead.

### Calculations

- **Reads:** 100,000 users × 20 reads = 2,000,000 reads per day, or about **23 reads per second** on average.
- **Writes:** 100,000 users × 1 note = 100,000 writes per day, or about **1.2 writes per second** on average.
- **Storage:** 100,000 notes per day × 365 days = 36.5 million notes per year. At 2 KB per note, that is about **73 GB of new note data per year**, before indexes and backups.

These averages can hide short traffic spikes, so the system should be able to handle several times the average load.

## Architecture diagram

```text
                          +----------------------+
                          |         DNS          |
                          +----------+-----------+
                                     |
                                     v
+--------+    +---------------------+    +------------------+
| Client | -> | CDN: static assets  | -> | Load balancer    |
+--------+    +---------------------+    +--------+---------+
                                                  |
                                      +-----------+-----------+
                                      |                       |
                                      v                       v
                              +---------------+       +---------------+
                              | App server 1  |       | App server 2  |
                              +-------+-------+       +-------+-------+
                                      |                       |
                         +------------+-----------+-----------+-----------+
                         |                        |                       |
                         v                        v                       v
                 +---------------+       +----------------+      +----------------+
                 | Cache         |       | Primary DB     | ---> | Read replica   |
                 +---------------+       +-------+--------+      +----------------+
                                                  |
                                                  v
                                           +-------------+
                                           | Queue       |
                                           +------+------+
                                                  |
                                                  v
                                           +-------------+
                                           | Worker      |
                                           +-------------+
```

## Components

- **Client:** Sends requests to QuickNotes and displays the returned notes.
- **DNS:** Directs the app's domain name to the service.
- **CDN:** Delivers static files, such as CSS and JavaScript, from locations near users.
- **Load balancer:** Distributes incoming requests across healthy app servers.
- **App servers:** Validate requests, enforce user permissions, and run the application logic.
- **Cache:** Keeps frequently requested data available quickly and reduces repeated database reads.
- **Primary database:** Stores the authoritative user, note, and tag data and accepts writes.
- **Read replica:** Handles read queries to reduce load on the primary database.
- **Queue:** Holds background jobs so the app can respond without waiting for them to finish.
- **Worker:** Processes queued jobs, such as sending notifications or updating a search index.

## GET /notes flow

1. The client resolves the QuickNotes domain through DNS and sends an authenticated request.
2. The CDN serves any cached static files; the request for private notes continues to the load balancer.
3. The load balancer sends the request to a healthy app server.
4. The app server verifies the user's identity and permission to access the notes.
5. The app server checks the cache for the user's notes.
6. If the notes are not cached, the app server reads them from the database read replica and may place the result in the cache.
7. The app server returns the notes to the client.

## POST /notes flow

1. The client sends an authenticated request containing the note title and body.
2. DNS resolves the domain, and the request passes through the load balancer to a healthy app server.
3. The app server verifies the user's identity and validates the note, including the required title and 100-character title limit.
4. The app server writes the note to the primary database.
5. The app server invalidates or updates the relevant cached notes so later reads can see the change.
6. The app server places any optional background work, such as search indexing, on the queue.
7. The app server returns the created note and a `201 Created` response to the client.
8. A worker processes the queued job independently.

## Trade-offs and reliability

- **Cache speed versus freshness:** Caching makes repeated reads faster, but cached notes can briefly be out of date. The app invalidates or updates the user's cached notes after a successful write.
- **Read replica performance versus consistency:** A read replica reduces work on the primary database, but replication can lag. The app can read a newly created or updated note from the primary database when the user needs to see that change immediately.
- **Background processing versus immediate completion:** A queue keeps slow tasks from delaying the user's request, but those tasks finish later. The app returns the saved note first, while workers retry failed background jobs.
- **Availability versus operational complexity:** Multiple app servers, managed database failover, replicated queues, and health checks reduce the impact of individual failures, but add cost and operational work.

There should be no single point of failure: run app servers across separate availability zones, use redundant DNS and CDN services, deploy the load balancer and cache as managed or replicated services, configure database failover to the read replica, and run multiple queue workers.