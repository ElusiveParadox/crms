# Campus Resource Management System (CRMS) - Project Report

**Project Team Members:**
* Sushant
* Krish Dabas
* Aryan Yadav
* Ritik Atri
* Aditya Kishore

## 1. Project Overview
The **Campus Resource Management System (CRMS)** is a comprehensive, multi-tenant Software-as-a-Service (SaaS) application designed to modernize and streamline the scheduling of physical university resources (Computer Labs, Lecture Halls, Equipment). By transitioning from traditional pen-and-paper or disjointed spreadsheets to a unified digital platform, CRMS ensures that resources are allocated efficiently without double-booking or scheduling conflicts.

## 2. Technology Stack & Deployment
The system strictly adheres to modern web development standards, utilizing a decoupled Client-Server architecture:
* **Frontend (Client):** Developed using **Next.js** (React) styled with **Tailwind CSS** and animated via **Framer Motion** for a premium "Midnight Neon" Glassmorphism aesthetic. Hosted globally via **Vercel**.
* **Backend (Server):** An **Express.js** API written in robust **TypeScript**. Provides stateless RESTful endpoints and is deployed on **Render**.
* **Database:** A highly available Relational **PostgreSQL** Database hosted on **Neon**, queried and mutated using the **Prisma ORM**.

## 3. System Design & User Hierarchy
The system handles strict scoping through JSON Web Tokens (JWT) to enforce proper boundaries between users and universities:
* **SUPER_ADMIN (The Platform Owner):** Has the architectural clearance to generate entirely new `Institution` clusters within the database. 
* **ADMIN (The University Manager):** Tied to a specific institution. Admins are equipped with a powerful "Command Center" dashboard where they can oversee all institution operations, approve/reject student lab requests, and override double-booking conflicts.
* **STUDENT & FACULTY:** Standard users capable of interacting with the dynamic calendar, checking resource capacities, and making time-bound booking requests.

## 4. Applied Software Engineering Patterns
This capstone elevates itself beyond a standard CRUD application by heavily relying on **Gang of Four (GoF) Object-Oriented Design Patterns** to enforce complex business logic:

### A. The Strategy Pattern (Conflict Resolution)
* **Location:** `/patterns/strategy/`
* **Purpose:** Allows the application to swap conflict resolution algorithms dynamically. Instead of creating a monolithic, fragile `if/else` block to handle booking conflicts, the server utilizes a `StrictConflictStrategy` (which strictly applies First-Come-First-Serve blocking mechanics) or a `PriorityConflictStrategy` (which selectively auto-cancels lower-tier requests based on hierarchical priority rules).

### B. The State Pattern (Booking Lifecycles)
* **Location:** `/patterns/state/`
* **Purpose:** A semantic booking flows through strict legal transitions (`PENDING` ➔ `APPROVED` ➔ `CANCELLED`). The State Pattern maps each of these states to isolated classes. This guarantees that an Admin cannot legally transition a booking from `CANCELLED` back out to `APPROVED`, maintaining unbreakable data integrity globally. 

### C. The Observer Pattern (Event-Driven Architecture)
* **Location:** `/patterns/observer/`
* **Purpose:** A decentralized Publish-Subscribe (Pub/Sub) model. When a critical database event occurs (e.g., an Admin clicking "Approve" on a booking), the core Controller does not manually dispatch emails or fire notifications. Instead, it simply alerts the central `EventBus` (`Subject`). Downstream `Observers` (like the NotificationHandler or LogHandler) listen for this broadcast and independently trigger their secondary effects, dramatically reducing system coupling.

### D. The Factory Pattern (Abstracted Object Creation)
* **Location:** `/patterns/factory/UserFactory.ts`
* **Purpose:** Centralizes the complex assembly of user objects. When the backend needs to construct a user based on a database query, the Factory orchestrates injecting the correct subset of operational privileges based on the user's enumerated Role (`STUDENT`, `FACULTY`, `ADMIN`).

### E. The Mapper/DTO Pattern (Data Hiding)
* **Location:** `/mappers/`
* **Purpose:** Ensures raw database rows are never directly returned over the API. Data Transfer Objects (DTOs) deliberately strip sensitive internal fields (like `passwordHash` or `deletedAt` timestamps) out of the Prisma schema payload before releasing the JSON to the Next.js client.

## 5. Security & Authentication Flow
CRMS utilizes stateless authentication to ensure rapid horizontal scaling capabilities:
1. **Access Tokens:** Upon login, the backend yields a cryptographically signed **JSON Web Token (JWT)**.
2. **Authorizers:** Custom Express Middlewares (`authMiddleware` and `institutionGuard`) forcefully evaluate the JWT's signature on every protected API route. The middleware prevents "Cross-Institution" pollution, guaranteeing a Student from "Institution A" cannot query resources from "Institution B".
3. **Payload Validation:** Before data hits the core business services, the API routes sanitize and validate incoming JSON payloads using strict **Zod** schemas, neutralizing malformed data instantly.

## 6. Database Entity Relationships (Prisma)
The PostgreSQL database employs a thoroughly normalized relational structure:
* **Models:** `Institution` (1) ➔ (N) `User` & `Resource`
* **Models:** `User` + `Resource` (1) ➔ (N) `Booking`
* **Data Integrity:** Core models feature a `deletedAt DateTime?` column. Rather than permanently executing SQL `DELETE` commands which silently destroy past booking historical records, resources and users are tombstoned logically (Soft Delete).

## 7. Future Scaling Capabilities
* **WebSockets (Socket.io) Pluggability:** Because the EventBus & Observer patterns completely decouple the business logic from event handling, implementing real-time UI WebSocket popups natively requires absolutely zero changes to the core System Controllers. A simple `SocketObserver` can be attached seamlessly to the central EventBus in future iteration scopes without causing regression bugs.

## 8. SOLID Principles Implementation

CRMS backend demonstrates SOLID principles through disciplined OO design:

### A. Single Responsibility Principle (SRP)
* **Files:** `services/BookingService.ts`, `services/UserService.ts`, `mappers/UserMapper.ts`
* **Usage:** Each class has one reason to change. `BookingService` solely manages booking CRUD/conflicts/approvals. `UserService` handles auth/registration. Mappers convert persistence<->domain without business logic.

### B. Open-Closed Principle (OCP)
* **Files:** `patterns/strategy/ConflictStrategy.ts`, `StrictConflictStrategy.ts`, `PriorityConflictStrategy.ts`; `patterns/state/BookingState.ts`
* **Usage:** `BookingService` closed for modification but open for extension via injectable `ConflictStrategy` interface (swap algorithms). State pattern allows new booking states without changing core logic.

### C. Liskov Substitution Principle (LSP)
* **Files:** `models/User.ts`, `models/Admin.ts`, `models/Student.ts`, `models/Faculty.ts`
* **Usage:** Subclasses (`Admin`, `Student`) substitute `User` base; `override` methods (e.g., `canApproveBooking()`) preserve contracts, enabling polymorphic use in services.

### D. Interface Segregation Principle (ISP)
* **Files:** `patterns/strategy/ConflictStrategy.ts` (1 method), `patterns/state/BookingState.ts` (focused lifecycle ops), `patterns/observer/Observer.ts`
* **Usage:** Clients implement only relevant methods; no fat interfaces forcing unused code.

### E. Dependency Inversion Principle (DIP)
* **Files:** `patterns/factory/UserFactory.ts`, `services/BookingService.ts`
* **Usage:** Services depend on abstractions (`User` interface, `ConflictStrategy`); `UserFactory` inverts object creation control. Injections via constructors/params.

## 9. Advanced Software Design Patterns

Beyond core GoF patterns, CRMS employs advanced architectural patterns for enterprise scalability:

### A. Domain-Driven Design (DDD) Layers
* **Files:** `models/`, `services/`, `mappers/`
* **Usage:** Strict separation of Domain (rich `User`/`Booking` entities with behavior), Application (services orchestrate), Infrastructure (Prisma mappers). Ubiquitous language (e.g., `ensureInstitutionScoped`, `DomainError`).

### B. CQRS (Command Query Responsibility Segregation) Elements
* **Files:** `services/BookingService.ts` (commands: create/update; queries: getAll/getById)
* **Usage:** Mutations separated from reads; potential for future event sourcing via `EventBus`.

### C. Repository Pattern (via Mappers)
* **Files:** `mappers/UserMapper.ts`, `InstitutionMapper.ts`
* **Usage:** Abstracts data access; domain unaware of Prisma specifics.

### D. Event-Driven Architecture (Advanced Pub/Sub)
* **Files:** `events/EventBus.ts`, `patterns/observer/`
* **Usage:** Decoupled notifications; extensible for microservices/Saga pattern.

### E. Multi-Tenancy with Contextual Guarding
* **Files:** `middleware/auth.middleware.ts`, services guards
* **Usage:** Institution-scoped queries prevent data leakage.

## 10. Summary
The CRMS represents a structurally sound, enterprise-ready architecture. From zero-downtime deployment on Vercel/Render to strict TypeScript integration and proven GoF software engineering patterns, the system is fundamentally designed to prevent race conditions, scale reliably, and offer an incredibly fluid user experience.
