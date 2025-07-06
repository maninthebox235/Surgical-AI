# Backend Structure Document

This document outlines the backend architecture, hosting solutions, and infrastructure components for the AI-powered surgical education platform. It is written in everyday language to ensure clarity for non-technical readers.

## 1. Backend Architecture

### Overall Design

We use a **service-oriented** approach, splitting our backend into two main parts:

- **API Service** (built with FastAPI): Handles user requests, authentication, data management, and communication with storage and database.
- **AI Analysis Service** (containerized micro-service): Runs on GPU-enabled servers to process videos, perform AI inference, and generate feedback.

These services communicate asynchronously: when a user uploads a video, the API Service stores it and then tells the AI Analysis Service to start processing. Once the analysis is complete, results are sent back to the API Service for storage and user notification.

### Frameworks and Patterns

- **FastAPI**: Lightweight Python framework for building RESTful APIs. Offers high performance and automatic documentation.
- **Docker**: Containers to package both services, ensuring consistent environments from development to production.
- **Asynchronous Task Queue**: Background jobs for video analysis, keeping the API responsive.

### Scalability, Maintainability, Performance

- **Scalability**
  - Containerization allows us to spin up more API or AI worker instances as needed.
  - GPU-powered EC2 instances scale out for peak analysis demand.
- **Maintainability**
  - Clear separation of concerns: API logic vs. AI processing logic.
  - Versioned Docker images and infrastructure as code for repeatable deployments.
- **Performance**
  - FastAPI’s async capabilities handle many simultaneous requests.
  - AWS S3 for video storage offloads large-file handling from the API.
  - Caching frequently requested data (e.g., learning resources) reduces database load.

## 2. Database Management

### Technologies Used

- **Type**: Relational (SQL)
- **System**: PostgreSQL (managed by AWS RDS)

### Data Structure and Access

- **Structured Tables** for users, videos, analysis results, feedback, resources, subscriptions, notifications.
- **Connection Pooling**: Ensures efficient use of database connections.
- **Retention Policy**: All videos and analysis data are kept for up to 7 years. After that, data is archived or purged automatically.

### Data Practices

- **Backups**: Daily automatic snapshots of the database.
- **Encryption at Rest**: RDS encryption with AWS-managed keys.
- **Encryption in Transit**: TLS/SSL for all database connections.

## 3. Database Schema

Below is a human-readable overview of the main tables. Following that, you’ll find the SQL definitions for PostgreSQL.

### Human-Readable Schema

- **Users**: Stores user info (ID, name, email, role, institutional ID).
- **Videos**: Tracks each uploaded video (video ID, user ID, file path, upload timestamp, status).
- **AnalysisResults**: Holds AI output for each video (result ID, video ID, key steps detected, scores, timestamp).
- **Feedback**: Links to AnalysisResults; detailed comments and suggestions.
- **Resources**: Library of learning materials (resource ID, title, type, URL, tags).
- **Notifications**: Messages sent to users (notification ID, user ID, type, read/unread, timestamp).
- **Subscriptions**: Payment status and plan details (subscription ID, user ID, plan type, start/end dates).
- **Admins**: Instructor/institution admin accounts with elevated permissions.
- **OAuthIntegrations**: Records external SSO identities (provider, external user ID, linked user ID).

### PostgreSQL Schema (SQL)

```sql
CREATE TABLE Users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student','instructor','admin')),
  institution_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Videos (
  video_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id),
  s3_key VARCHAR(500) NOT NULL,
  format VARCHAR(10) CHECK (format IN ('mp4','mov')),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('pending','processing','completed','failed'))
);

CREATE TABLE AnalysisResults (
  result_id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES Videos(video_id),
  detected_steps JSONB,
  scores JSONB,
  feedback_summary TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Feedback (
  feedback_id SERIAL PRIMARY KEY,
  result_id INTEGER REFERENCES AnalysisResults(result_id),
  detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Resources (
  resource_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  url VARCHAR(500) NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Notifications (
  notification_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id),
  type VARCHAR(50),
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Subscriptions (
  subscription_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id),
  plan_type VARCHAR(50) CHECK (plan_type IN ('monthly','annual')),
  start_date DATE,
  end_date DATE
);

CREATE TABLE Admins (
  admin_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id),
  permissions JSONB
);

CREATE TABLE OAuthIntegrations (
  integration_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES Users(user_id),
  provider VARCHAR(100),
  external_user_id VARCHAR(255),
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design and Endpoints

### Approach

We follow a **RESTful** design with JSON inputs/outputs. Endpoints are grouped by resource.

### Key Endpoints

- **Authentication & SSO**
  - `POST /auth/login` – User login with email/password.
  - `GET /auth/oauth/callback` – Handles OAuth2/OIDC callback from institutional SSO.

- **User Management**
  - `GET /users/me` – Fetch current user profile.
  - `PATCH /users/me` – Update profile details.

- **Video Upload & Retrieval**
  - `POST /videos` – Initiate video upload (returns pre-signed S3 URL).
  - `GET /videos/{id}` – Get video metadata and status.

- **Analysis Workflow**
  - `POST /videos/{id}/analyze` – Trigger AI analysis.
  - `GET /results/{result_id}` – Fetch analysis results.

- **Feedback & Coaching**
  - `GET /results/{result_id}/feedback` – Detailed feedback entries.

- **Resources Library**
  - `GET /resources` – List/filter learning materials.
  - `GET /resources/{id}` – Fetch a single resource.

- **Notifications**
  - `GET /notifications` – List user notifications.
  - `PATCH /notifications/{id}` – Mark as read.

- **Subscription & Reporting**
  - `GET /subscriptions` – Check subscription status.
  - `POST /reports/{result_id}` – Generate and download PDF report.

All endpoints use HTTPS and require a valid JWT token obtained at login or via SSO.

## 5. Hosting Solutions

- **Cloud Provider**: AWS
- **Compute**
  - **API Service**: AWS ECS (Elastic Container Service) running Docker containers on EC2 or Fargate.
  - **AI Service**: Dedicated AWS EC2 instances with NVIDIA GPUs (g4dn family) for model inference.
- **Storage**
  - **Videos**: AWS S3 buckets (encrypted, versioned).
  - **Database**: AWS RDS for PostgreSQL (multi-AZ for high availability).

### Benefits

- **Reliability**: Managed services with built-in failover.
- **Scalability**: Easy to scale containers, storage, and GPU instances.
- **Cost-Effectiveness**: Pay-as-you-go pricing, spot instances for non-critical workloads.

## 6. Infrastructure Components

- **Load Balancer**: AWS Application Load Balancer distributes API traffic across containers.
- **Content Delivery Network (CDN)**: AWS CloudFront serves static assets (e.g., JavaScript bundles, resource files).
- **Caching**: In-memory cache (Amazon ElastiCache Redis) for frequent lookups (e.g., resource listings).
- **Container Registry**: AWS ECR stores Docker images.
- **Task Queue (Optional)**: AWS SQS or Redis + Celery for queuing video analysis jobs.

These components work together to deliver fast responses, handle peak loads, and provide a smooth user experience.

## 7. Security Measures

- **Authentication & Authorization**
  - OAuth2/OIDC integration for Single Sign-On.
  - JWT tokens for API access with role-based permissions.
- **Data Encryption**
  - TLS for all HTTP traffic.
  - Server-side encryption for S3 and RDS (AWS KMS-managed keys).
- **HIPAA Compliance**
  - Audit logging of data access.
  - 7-year retention policy with automated archival/purge.
  - User consent tracking and privacy notices.
- **Network Security**
  - VPC with private subnets for databases and AI instances.
  - Security groups and IAM roles limit access to only needed services.

## 8. Monitoring and Maintenance

- **Performance Monitoring**
  - AWS CloudWatch metrics and alarms (CPU, memory, error rates).
  - Application logs sent to CloudWatch Logs or ELK stack.
  - Error tracking with Sentry.
- **Maintenance Practices**
  - Automated database migrations via Alembic.
  - Regular dependency updates and security patching.
  - Scheduled health checks and canary deployments for zero-downtime releases.

## 9. Conclusion and Overall Backend Summary

Our backend is a containerized, service-oriented system on AWS, combining a fast API layer with a specialized AI processing service. It uses PostgreSQL for structured data and S3 for heavy video storage, all secured to HIPAA standards. The setup is designed for easy scaling, high availability, and straightforward maintenance. Unique aspects include dedicated GPU workers for real-time video analysis and deep integration with institutional SSO, making the platform both powerful and easy to adopt for medical schools and students