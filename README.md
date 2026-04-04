# Auth Tenant Service

Multi-tenant authentication service built with NestJS.

## Architecture

The project has the following layers:

- **Interface Layer**  
  (Controllers, DTOs, Guards, Decorators)

- **Application Layer**  
  (Commands, Queries, Handlers)

- **Domain Layer**  
  (Entities, Value Objects, Interfaces)

- **Infrastructure Layer**  
  (Prisma, JWT, Redis, Middleware, Repositories)

## Features

- Multi-tenant architecture (tenant isolation via headers)
- JWT authentication (access + refresh tokens)
- Session management with database-backed sessions
- Role-based access control (RBAC)
- Permission-based authorization
- Type-safe throughout (TypeScript)
- CQRS pattern with NestJS CQRS module
- Prisma ORM with PostgreSQL
- Input validation with class-validator
- Default role assignment on user registration

## Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npm run prisma:seed
```

## API Endpoints

### Authentication (Public)

| Method | Endpoint                    | Description                                            |
| ------ | --------------------------- | ------------------------------------------------------ |
| POST   | `/api/auth/register`        | Register a new user (auto-assigns default role)        |
| POST   | `/api/auth/login`           | Login and get access/refresh tokens                    |
| POST   | `/api/auth/refresh`         | Get a new access token using a refresh token           |
| POST   | `/api/auth/logout`          | Invalidate the current session                         |
| POST   | `/api/auth/logout-all`      | Invalidate all user sessions (requires authentication) |
| PATCH  | `/api/auth/change-password` | Change password (invalidates all sessions)             |

### User Management (Protected)

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| GET    | `/api/users/me` | Get current user profile |

### Role Management (Protected)

These endpoints require authentication and specific role-based permissions.

| Method | Endpoint     | Description     | Permission Required |
| ------ | ------------ | --------------- | ------------------- |
| POST   | `/api/roles` | Create new role | `role:create`       |
| GET    | `/api/roles` | List all roles  | `role:read`         |

Headers Required
All requests must include:

x-tenant-id: Your tenant identifier (UUID)

Protected routes also require:

Authorization: Bearer <access_token>

### Detailed Layer Architecture

```mermaid
flowchart TD
    %% Main Title
    subgraph "auth-tenant-service"
        direction TB

        %% Layer 1: Domain (Innermost)
        subgraph Domain["Enterprise Business Logic"]
            direction TB
            VO["Value Objects\n(email.vo, password.vo, tenant-id.vo, user-id.vo)"]
            Entities["Entities & Interfaces"]
            Exceptions["Exceptions\n(DomainException, UserNotFound, etc.)"]
        end

        %% Layer 2: Application
        subgraph Application["Use Cases"]
            direction TB
            Auth["Auth Module\n(login, register, refresh, logout)"]
            User["User Module\n(create, update, deactivate)"]
            Role["Role Module\n(create, assign permissions)"]
            Common["Common\n(Command, Query, Handler interfaces)"]
        end

        %% Layer 3: Infrastructure
        subgraph Infrastructure["Frameworks & Drivers"]
            direction TB
            Persistence["Persistence\n(Prisma)"]
            AuthInfra["Authentication\n(JWT + bcrypt)"]
            Cache["Cache\n(Redis)"]
            Events["Event Bus"]
            HTTPInfra["HTTP\n(Middleware, Interceptors, Filters)"]
            Config["Configuration"]
        end

        %% Layer 4: Interface (Outermost)
        subgraph Interface["Interface / Presentation"]
            direction TB
            Controllers["Controllers\n(auth, users, roles, tenants)"]
            DTOs["DTOs\n(Request & Response)"]
            Decorators["Decorators & Guards"]
            Presenters["Presenters"]
        end

        %% Shared (cross-cutting)
        Shared["Shared\n(constants, utils, rate-limiter)"]

        %% Root files
        Root["main.ts\napp.module.ts"]
    end

    %% Layer dependencies (outer depends on inner)
    Interface --> Application
    Interface --> Infrastructure
    Infrastructure --> Application
    Infrastructure --> Domain
    Application --> Domain
    Shared -.-> Domain
    Shared -.-> Application
    Shared -.-> Infrastructure

    %% Styling
    classDef domain fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000;
    classDef application fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,color:#000;
    classDef infrastructure fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000;
    classDef interface fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000;
    classDef shared fill:#f5f5f5,stroke:#616161,stroke-width:2px,color:#000;

    class Domain domain;
    class Application application;
    class Infrastructure infrastructure;
    class Interface interface;
    class Shared shared;
```

## Project Structure

```bash
src/
├── domain/                          # Enterprise business logic
│   ├── entities/                    # Domain entities (User, Role, Tenant, etc.)
│   ├── value-objects/               # Immutable value objects (Email, Password, TenantId, etc.)
│   ├── exceptions/                  # Domain-specific exceptions
│   └── interfaces/                  # Repository and service ports
│       ├── repositories/            # Repository interfaces
│       └── services/                # Service interfaces (ports)
│
├── application/                     # Use cases / Application services
│   ├── auth/                        # Authentication use cases
│   │   ├── commands/                # Register, Login, RefreshToken, Logout
│   │   ├── handlers/                # Command handlers
│   │   └── queries/                 # GetCurrentUser, CheckPermission, etc.
│   ├── user/                        # User management use cases
│   └── role/                        # Role and permission use cases
│
├── infrastructure/                  # Frameworks, drivers & external tools
│   ├── persistence/                 # Database implementations
│   │   └── prisma/                  # Prisma repositories, mappers and schema
│   ├── auth/                        # Authentication implementations
│   │   ├── jwt/                     # JWT token service
│   │   └── strategies/              # Passport strategies
│   ├── cache/                       # Redis cache implementation
│   └── http/                        # HTTP middleware, interceptors and filters
│
├── interface/                       # Presentation / HTTP layer
│   ├── http/
│   │   ├── controllers/             # Route controllers
│   │   ├── dto/                     # Request and Response DTOs
│   │   ├── guards/                  # Authentication and authorization guards
│   │   └── decorators/              # Custom decorators
│   └── presenters/                  # Response formatters (optional)
│
└── shared/                          # Cross-cutting concerns
    ├── constants/                   # Application constants
    └── utils/                       # Helper functions and utilities
```
