**High-Level Design (HLD) \-- MVP Application for Strength Training Logging**

**1\. Purpose and Scope**

Minimalistic web MVP application intended for:

* Registration and authentication of users

* Logging training sessions (exercises, sets, weights, repetitions)

* Browsing training history and personal records

* Hosted on Raspberry Pi Zero 2 W, considering limited resources.

**2\. Main Components**

**2.1 Frontend**

* **Technology**: React

* **Functions**:

  * Login/registration form

  * Dashboard: summary of sessions and records

  * Training session page: exercise list, adding sets

  * Training history: filter and review

* **Communication Interface**: REST API

**2.2 Backend**

* **Technology**: Spring Boot

* **Functions**:

  * Authentication and authorization (JWT)

  * CRUD for users, exercises, trainings

  * Calculating and providing personal records

* **Interfaces**:

  * Public REST endpoints

  * Internal services for business logic handling

**2.3 Database**

* **Engine**: PostgreSQL

* **Models**:

  * User (profile, password hash)

  * Exercise (predefined and custom)

  * Training session (date, notes)

  * Sets (exercise, weight, repetitions)

  * Personal record (max weight/repetitions)

* **Requirements**:

  * Simple schema migration

  * Minimal disk load

**3\. General Architecture**

       `+------------+        HTTPS        +-------------+`  
        `|            |  <--------------->  |             |`  
        `|  Frontend  |     REST API       |   Backend   |`  
        `|  (React)   |                     | (Spring)    |`  
        `|            |  --------------->   |             |`  
        `+------------+    JWT Bearer       +-------------+`  
                                       `|`  
                                       `| JDBC/SSL`  
                                       `▼`  
                                   `+---------+`  
                                   `|         |`  
                                   `|  PostgreSQL  |`  
                                   `|         |`  
                                   `+---------+`

**4\. Key Design Decisions**

* **Minimalism**: Limiting number of dependencies and interface complexity.

* **Stateless API**: JWT instead of sessions, facilitating scaling.

* **Modularity**: Separation of presentation layer, business logic, and data access.

* **Flexibility**: Ability to expand (e.g., training planning) without refactoring core.

* **Performance**: Lightweight technology stack suited for Raspberry Pi Zero 2 W.

**5\. Interactions and Flows**

**Registration and Login**

1. User sends data to /api/auth/register or /api/auth/login.

2. Backend validates, creates password hash, returns JWT.

**Adding Training**

1. Frontend sends POST /api/workouts with date and list of sets.

2. Backend saves session and sets, updates records.

**History Review**

1. Frontend fetches GET /api/workouts?userId=....

2. Backend returns session list with aggregated data.

**6\. Reliability and Maintenance**

* **Monitoring**: Simple health-check endpoint.

* **Logging**: Centralized application logs.

* **Data Backup**: Regular PostgreSQL database dumps.

* **Update**: Ability to hot-swap frontend and backend without downtime.

This HLD provides a high-level view of the MVP system, focusing on components, interactions, and key architectural decisions, maintaining minimalism and ease of maintenance.