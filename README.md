# buy-01 E-commerce Platform

## Overview
A microservices-based e-commerce platform built with Spring Boot and Angular, supporting user roles (clients/sellers), product management, and media handling. The platform features secure authentication, product CRUD operations for sellers, and integrated media management.

## Architecture
The platform consists of the following microservices:
- Registry Service: Service discovery and registration
- Gateway Service: API gateway and routing
- User Service: User management and authentication
- Product Service: Product CRUD operations
- Media Service: Image upload and management

Communication between services is facilitated through Kafka messaging system.

## Tech Stack
- Backend:
    - Spring Boot
    - Spring Security (JWT/OAuth2)
    - Apache Kafka
    - MongoDB
    - Docker
- Frontend:
    - Angular
    - TypeScript
    - Angular Material
    - PrimeNG

## Key Features
- Role-based user management (clients/sellers)
- Secure authentication with JWT/OAuth2
- Product management (CRUD) for sellers
- Media upload with validation (2MB limit)
- Seller-specific dashboards
- Product listing views

## Prerequisites
- Java 17 or higher
- Maven
- Docker and Docker Compose
- Node.js and npm
- Make (for using the Makefile)

## Project Structure
```
buy-01/
├── api/
│   ├── registry/      # Service registry
│   ├── gateways/      # API gateway
│   ├── users/         # User management service
│   ├── products/      # Product management service
│   └── media/         # Media handling service
├── frontend/          # Angular application
├── docker-compose.dep.yml
├── docker-compose.services.yml
└── Makefile
```

## Setup and Installation

### 1. 
Start the Project:
```bash
make up
```

### 2. 
Stop the Project:
```bash
make down
```

## Security Measures
- HTTPS encryption using Let's Encrypt SSL certificates
- Password hashing and salting
- Role-based access control
- Secure file upload validation
- Protected sensitive information

## Error Handling
The platform implements robust error handling:
- File size and type validation
- Role-based access violations
- Form validation
- API error responses with appropriate status codes


## Authors
[Moussa Dieng](https://www.linkedin.com/in/moussa-dieng/)
