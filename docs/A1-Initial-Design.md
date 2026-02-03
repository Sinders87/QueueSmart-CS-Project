## 1. Initial Thoughts (2 points)
Discuss your initial thoughts on designing QueueSmart:

Who are the main users of the system?

How will users and administrators interact with the application?

What are the most important features?

What challenges do you anticipate (e.g., long queues, notifications, inaccurate wait times)?

## 2. Development Methodology (2 points)
Discuss the development methodology your team plans to use:

Which methodology will you follow (e.g., Agile, Scrum, Waterfall)?

Why is this methodology appropriate for this project?

How will this approach help your team work across multiple assignments?


## 3. High-Level Design / Architecture (6 points)

### Architecture Diagrams

Our system architecture is illustrated through two diagrams:

**System Context Diagram:**
![System Context Diagram](architecture/diagrams/System%20Context%20Diagram.png)

**Container Diagram:**
![Container Diagram](architecture/diagrams/Container%20Diagram.drawio.png)

### High-Level Design / Architecture

The QueueSmart system is designed using a simple, high-level architecture that clearly separates users, internal system components, and external services.

An architecture diagram is provided to visually represent the system structure and interactions.

At a high level, QueueSmart consists of the following components:

- Users and Administrators interact with QueueSmart to join queues, view queue status, and manage services.
- QueueSmart acts as a single system that processes user requests, manages queues, and enforces priority and service rules.
- A front-end application (web or mobile) allows users and administrators to interact with the system.
- The back-end / API handles authentication, service management, queue logic, and wait-time estimation.
- A database stores persistent data such as user information, services, queues, and queue history.
- External notification services (SMS and Email) are used to notify users of queue status updates and to send post-service feedback or confirmation messages.

The back-end communicates with the database to store and retrieve data and triggers notifications through external services when queue events occur. Overall, this architecture keeps QueueSmart simple, organized, and easy to understand, while still supporting efficient queue management and clear communication between users, administrators, and external services.
