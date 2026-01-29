# 🧱 Mastering NestJS – A Comprehensive Hands-on Guide

![NestJS Logo](./nestjs.png)

Welcome to the **Mastering NestJS** course repository. This course covers everything from the basics of NestJS and its core concepts to advanced integrations like database ORMs, authentication, and real-world project setups.

---

## � About This Course

Master modern backend development with NestJS in this comprehensive Hindi course. Whether you're a beginner or an experienced developer, this course will take you from zero to hero by covering everything from the basics to advanced enterprise-level concepts.

You'll learn how to build scalable, secure, and maintainable server-side applications using TypeScript and NestJS, a powerful Node.js framework inspired by Angular. We'll explore topics like REST APIs, GraphQL, authentication, database integration (PostgreSQL, MongoDB, TypeORM, Prisma), monorepo architecture, microservices, event-driven systems, testing, cloud deployments, and more.

By the end of this course, you'll be confident enough to develop and deploy production-grade backend applications using best practices in modern development workflows.

---

## 🎯 Course Agenda

### Section 1: Introduction - NestJS Zero to Hero

- **Lecture 1:** NestJS Zero to Hero - Modern backend Development
- **Lecture 2:** Setting up Your System and prerequisite for this Course
- **Lecture 3:** Course Agenda & Outline

### Section 2: Getting Started with NestJS

- **Lecture 4:** NestJS CLI Starter: Exploring the Generated Code
- **Lecture 5:** System Setup and Node.js Installation for NestJS Development
- **Lecture 6:** Why NestJS? – Introduction to NestJS (Preview enabled)
- **Lecture 7:** NestJS vs Express: Key Differences in API Development
- **Lecture 8:** Using NestJS CLI & Organize Your Code with Modular Structure

### Section 3: NestJS Basic Fundamentals with Simple CRUD

- **Lecture 9:** Baseline Nestjs Code for Building APIs
- **Lecture 10:** Building REST API CRUD Operation with In Memory Data
- **Lecture 11:** NestJS Controller and Service Basic Fundamentals

### Section 4: NestJS CLI and NestJS Core Building Blocks

- **Lecture 12:** Understanding the NestJS Request Lifecycle Flow
- **Lecture 13:** Kickstarting Your NestJS App with the CLI (Preview enabled)
- **Lecture 14:** NestJS Middleware and Auth Guard with Core Components

### Section 5: NestJS Dependency Injection and Building Blocks

- **Lecture 15:** NestJS API Documentation Using Swagger

---

## 📘 Course Modules (Extended Learning)

### Module 1: NestJS Fundamentals and Core Concepts

- Introduction to NestJS and its architecture
- Basic Fundamentals of Nestjs (core concepts)
- Setting up a NestJS project with TypeScript
- Creating RESTful APIs and GraphQL endpoints
- Implementing authentication (JWT, OAuth, Passport.js)
- Building end to end REST API services
- Setting up a NestJS project with Monorepo
- Database integration with TypeORM & Prisma and Mongoose
- Setting up a NestJS project with Testing
- Understanding NestJS Microservices
- Building Microservices and event-driven applications
- Unit & Integration Testing in NestJS
- CI/CD and deploying NestJS apps to the cloud

### Module 2: API Development - REST and GraphQL

- Creating RESTful APIs with NestJS
- Building GraphQL APIs using code-first and schema-first approaches
- API versioning and best practices
- API documentation using Swagger
- Handling GraphQL resolvers and decorators
- Integrating GraphQL with authentication and guards

### Module 3: Authentication and Authorization

- Authentication with Passport.js (JWT, Local, OAuth2 strategies)
- Implementing cookie-based authentication (HTTP-only cookies)
- Session-based authentication flow
- Role-based access control (RBAC)
- Token-based authentication and refresh strategies
- Security best practices (CORS, helmet, rate limiting, CSRF protection)

### Module 4: Database Integration and File Handling

- Connecting PostgreSQL using TypeORM
- Using Prisma ORM for modern data modeling
- Integrating MongoDB with Mongoose
- File upload handling with Multer and working with static assets
- Exception filters, interceptors, and custom decorators

### Module 5: NestJS Microservices and Architecture

- Understanding NestJS microservices architecture
- Building microservices using TCP, Redis, NATS, RabbitMQ
- Using message patterns and transporters
- Communication using EventEmitter and custom event buses
- Scalable job queues with BullMQ
- Deploying and testing distributed services

### Module 6: NestJS GraphQL Deep Dive

- Setting up GraphQL modules and resolvers
- Working with GraphQL decorators and schemas
- Using Apollo Server and code-first approach
- Handling GraphQL mutations and queries with DTOs
- Integrating GraphQL with databases (TypeORM/Prisma)
- Testing GraphQL queries and mutations

### Module 7: NestJS Testing Strategies

- Unit testing with Jest and mocking techniques
- Writing integration tests with Supertest
- Testing GraphQL APIs and authentication guards
- Testing modules and controllers independently
- Creating reusable testing utilities
- Best practices for test organization and coverage

### Module 8: DevOps, CI/CD, and Cloud Deployment

- Setting up environment variables and configuration modules
- Logging and monitoring with Winston and Morgan
- CI/CD pipeline setup with GitHub Actions or GitLab CI
- Dockerizing your NestJS app for production
- Deploying to AWS Lambda using Serverless Framework
- Deploying on EC2, ECS, and Kubernetes
- Creating and publishing custom NestJS packages

---

## �📚 Course Modules Overview

## 📆 Course Schedule

| Module | Title                                        | Topics Covered                                               |
| ------ | -------------------------------------------- | ------------------------------------------------------------ |
| 00     | **Introduction**                             | Why NestJS, Architecture, Decorators, Integrations           |
| 01     | **Controllers & Services**                   | NestJS building blocks, CRUD APIs, Task module               |
| 02     | **Validation & Pipes**                       | `ValidationPipe`, DTOs, error handling                       |
| 03     | **Exception Filters & Middleware**           | Filters, Middleware, Guards, Interceptors, Custom Decorators |
| 04     | **Demo App with All Concepts**               | Student CRUD APIs, in-memory DB, Swagger, Modular Code       |
| 05     | **Persistence with TypeORM**                 | PostgreSQL setup with Docker, Entities, Repositories         |
| 06     | **Other ORMs and Migrations**                | Prisma, Sequelize, Mongoose overview                         |
| 07     | **Real APIs with Prisma/Mongoose/Sequelize** | Food Delivery APIs using various ORMs                        |
| 08     | **Authentication & Authorization**           | Cookie, Session, JWT-based auth, Guards, Passport.js         |
| 09     | **Database Relationships**                   | One-to-Many, Many-to-Many with TypeORM                       |

---

## 🚀 Advanced Topics

| Module | Title                               | Topics Covered                                                                                     |
| ------ | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| 10     | **NestJS Testing**                  | Unit testing services, controllers, e2e tests using `@nestjs/testing`, mocking dependencies        |
| 11     | **NestJS Microservices**            | Message-based architecture, TCP transport, Redis/NATS brokers, request-response, pub/sub patterns  |
| 12     | **NestJS Microservices Demo**       | Real-world microservice setup, producer/consumer model, distributed task runner                    |
| 13     | **NestJS with GraphQL**             | Introduction to GraphQL, code-first and schema-first, resolvers, queries, mutations, subscriptions |
| 14     | **NestJS with External Interfaces** | Calling third-party APIs, Axios, SOAP, REST integrations, retry strategies, circuit breakers       |
| 15     | **NestJS in a Monorepo**            | Managing multiple apps/libs with Turborepo, PNPM workspaces, shared modules, CI/CD setup           |
| 16     | **NestJS Advanced Concepts**        | Reflection, metadata, custom modules, dynamic modules, lifecycle hooks, context-based providers    |

---

### 📦 00 - Introduction to NestJS

- Why choose NestJS over Express?
- Understanding NestJS architecture (IOC, DI, Decorators)
- Getting started with TypeScript
- Exploring NestJS integrations

---

### 🧱 01 - Controllers and Services (Building Blocks)

- Installing Node.js and Yarn
- Setting up the NestJS CLI
- (Optional) Setting up VSCode + Extensions
- Creating the project with CLI
- Understanding Modules, Controllers, and Services
- Implementing a Tasks Module:
  - Tasks Controller
  - Tasks Service
  - Task Model & DTOs
- CRUD APIs for Tasks
- Task Filtering and Searching

---

### 🔍 02 - Validation and Pipes

- Using `ValidationPipe` for CreateTask DTO
- Handling Errors (e.g., deleting non-existing tasks)
- Updating Task Status with Validation
- Challenge: Validate Task Filtering/Search Inputs

---

### ⚙️ 03 - Exception Filters, Middleware, and Core Concepts

- Full CRUD API with Tasks
- Deep dive into:
  - Controllers / Providers / Modules
  - Middleware (creating, applying, excluding routes)
  - Exception Filters
  - Pipes and Guards
  - Interceptors
  - Custom Decorators

---

### 🚀 04 - Applying All Learnings in a Demo App

- Build Student Management APIs
- Use In-Memory DB for simplicity
- Full CRUD with Swagger Specs
- DTO-based payload validation
- Token-based Mock Auth APIs
- Apply Guards, Middleware, and Exception Filters
- Understand DAO & Service Layers
- Real-world Code Structure
- API Testing with Swagger and REST Clients
- Modularization and DI framework exploration

---

### 🗄️ 05 - Data Store with TypeORM

- Intro to Persistence Layer
- Setting up PostgreSQL with Docker
- Using pgAdmin to manage DB
- Intro to TypeORM:
  - Connecting to DB
  - Task Entity & Repository
  - Active Record vs Data Mapper
- CRUD Operations with TypeORM
- Challenge Exercises with Solutions

---

### 🔁 06 - Exploring Other ORMs and Migrations

- Brief Introduction to:
  - Prisma
  - Sequelize
  - Mongoose
  - TypeORM
- Compare approaches and syntax

---

### 🧬 07 - Real-World API with Prisma / Mongoose / Sequelize

- Building Food Delivery APIs using:
  - Prisma with Migrations
  - MongoDB + Mongoose
  - Sequelize for SQL databases
- Prisma Schema & Client API
- Modular Services and Controllers with ORM

---

### 🔐 08 - Authentication & Authorization in NestJS

- Types of Auth:
  - Cookies
  - Sessions
  - JWT (Token-based)
- Setup `AuthModule`
- Create User Entity + Repository
- Signup Flow:
  - Validation
  - Password Strength
  - Conflict/Error Handling
  - Password Hashing with Bcrypt
- Sign In:
  - Implementing Passport.js + JWT Strategy
  - JWT Token generation + validation
  - Route Guards + Custom Decorators

---

### 🧩 09 - Database Relationships with TypeORM

- Expand Food Delivery App with Relationships
- Define `OneToMany`, `ManyToOne`, `ManyToMany`
- NestJS APIs to interact with related tables
- Combine with Auth, Middleware, Guards, Filters, and Interceptors

---

## 🛠️ Requirements

- Node.js v18+
- Yarn or npm
- NestJS CLI
- Docker (for database sections)
- pgAdmin (optional)

---

## ▶️ Running the App

```bash
# Install dependencies
yarn install

# Start the app
yarn start:dev
```

## 🧠 Learning Outcomes

- By the end of this course, you will:
- Understand NestJS core building blocks and architecture
- Be proficient in creating REST & GraphQL APIs
- Integrate multiple ORMs and databases
- Build real-world microservices with messaging and events
- Apply advanced patterns like Monorepo, Shared Modules, and Testing
- Secure APIs with authentication and authorization
- Handle middleware, guards, interceptors, filters professionally
