# Architecture

## Project Goal

Build a modern web application for Nendoroid collectors with a mobile-first experience, allowing users to browse the official catalog and manage their personal collection from any device.

## Technology Stack

### Frontend

* Next.js 16
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js Route Handlers

### Database

* PostgreSQL

### ORM

* Prisma

### Containerization

* Docker

## Application Architecture

Nendodex follows a client-server architecture.

External catalog sources are used only for synchronization.

```
External Catalog Source
        ↓
Synchronization Process
        ↓
PostgreSQL
        ↓
Next.js API
        ↓
Web Application
```

The application should continue working even if the external catalog source becomes temporarily unavailable.

## Domain Overview

Main entities identified during the design phase:

* User
* Nendoroid
* Collection
* CollectionItem
* Wishlist
* WishlistItem

The catalog stores official information.

Collections and wishlists store user-specific information.

## Design Principles

* Mobile-first, desktop-friendly.
* Search-first navigation.
* Simple user flows.
* Progressive disclosure.
* Collector-focused user experience.

## Project Structure

```
nendoroid-tracker/
│
├── app/
├── components/
├── hooks/
├── lib/
├── prisma/
├── public/
├── services/
├── styles/
├── types/
│
├── docs/
│   ├── architecture.md
│   ├── product.md
│   └── research/
│
├── docker-compose.yml
├── package.json
└── README.md
```

## Future Architecture Decisions

The following topics will be refined during development:

* Authentication.
* Database schema.
* Catalog synchronization.
* Deployment.
* Caching strategy.
* Background jobs.
