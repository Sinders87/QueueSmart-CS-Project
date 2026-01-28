# Data Model without Coding

This section describes the high-level data the QueueSmart system must store to support login/roles, service management, queue tracking, notifications, and history. This is only the design without any coding.

## Core Entities

### Users
Stores registered accounts for both users and admins.
- Key data: name, email/username, password (stored securely as a hash), role (USER/ADMIN), created date

### Services
Represents services that administrators create and manage.
- Key data: service name, description, expected duration, priority levels (low/medium/high), active status

### Queue Entries
Represents a user's information in a service queue.
- Key data: user, service, join time, current status (waiting/served/left), position (or computed order)

### History/Logs
Stores past queue participation to support usage statistics and reporting.
- Key data: user, service, join time, served/exit time, final status

## Relationships (Conceptual just for now)
- A User can have many Queue Entries and History records.
- A Service can have many Queue Entries and History records.
- Each Queue Entry links one User to one Service at a point in time.

## Authentication & Roles (Design)
- Authentication uses email/username and password.
- Email verification is required at registration (design only).
- Role-based access:
  - USER: join/leave queues, view their position and estimated wait time, receive notifications
  - ADMIN: create/manage services, manage queues, view basic usage data
