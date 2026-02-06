## 1. Initial Thoughts (2 points)
Discuss your initial thoughts on designing QueueSmart:

Who are the main users of the system?
The main users of QueueSmart are regular users who need to join a queue or schedule a service and administrators who manage services and queues. 

How will users and administrators interact with the application?
Users will interact with QueueSmart by logging in, joining or leaving queues, viewing their position and estimated wait time, and receiving notifications. Administrators will use the system to create and manage services, monitor queue status, and adjust priorities as needed.

What are the most important features?
Key features include real-time queue status, estimated wait times, and notifications when a user’s turn is approaching. As a possible design enhancement, the system could allow users to move up or reschedule when an earlier appointment becomes available due to cancellations, helping keep service slots filled.

What challenges do you anticipate (e.g., long queues, notifications, inaccurate wait times)?
Accurately estimating wait times is a challenge, especially when service durations vary or cancellations occur. Another challenge is handling rescheduling or queue adjustments in a way that fills open slots efficiently while still remaining fair and clear to users.

## 2. Development Methodology (2 points)
Discuss the development methodology your team plans to use:

Which methodology will you follow (e.g., Agile, Scrum, Waterfall)?
The methodology that we will follow will be Agile development.

Why is this methodology appropriate for this project?
This methodology is appropriate for this project because QueueSmart "is driven by customer descriptions of what is required" as stated by the second lecture. The scenarios will be provided as stated in our assignments. Agile was preferred over the other methodologies due to how Agile values adaptability, transparency, and incremental developments. We are also accustomed to this methodology as students and would align naturally with the goal in mind. 

How will this approach help your team work across multiple assignments?
The agile approach will help our team work across multiple assignments by allowing us to develop in increments and tackle portions of the application requirements one or several at a time instead of altogether. This allows us to be flexible and adjust as needed based on what we currently know about the project and what we begin to learn as the semester continues. Because we will not develop all at once, we can test what we have developed at the time and take a step back to fix any mistakes or problems that can occur.

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
