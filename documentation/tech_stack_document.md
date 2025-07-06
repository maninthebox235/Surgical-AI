# Tech Stack Document

This document explains the technology choices for our AI-Powered Surgical Education Platform in everyday language. We cover how each piece fits together and why we picked it, so anyone can understand the big picture.

## Frontend Technologies

We chose tools that let us build a fast, user-friendly interface with clear visuals and easy navigation.

*   **React**: A popular JavaScript framework that powers our entire web interface. It helps us build reusable components like buttons, forms, and video players.
*   **Expo**: Ensures our web app looks and works great on mobile browsers. It gives us responsive layouts without building a separate mobile app.
*   **v0 (AI-powered component builder)**: Accelerates UI development by generating modern design patterns and code snippets.
*   **Lovable.dev & Bolt**: Provide AI-driven scaffolding, letting us spin up consistent UI layouts and best practices quickly.
*   **Cline**: A collaborative AI assistant that helps developers work together on front-end code, reducing errors and speeding up reviews.

How these choices enhance user experience:

*   **Speed**: React’s component model lets us update pages instantly without full reloads.
*   **Consistency**: Shared UI libraries (v0, Lovable.dev) keep styles and interactions uniform across the app.
*   **Responsiveness**: Expo makes sure our layouts adapt to different screen sizes, so students can use the platform on tablets or phones.

## Backend Technologies

Our backend powers video storage, AI analysis, user management, and data retrieval.

*   **Python & FastAPI**: We use Python for its rich AI/ML ecosystem and FastAPI for building clear, high-performance RESTful APIs.
*   **PostgreSQL**: A reliable, open-source database that stores user profiles, submission records, feedback metadata, and billing info.
*   **PyTorch & SlowFast**: PyTorch is the AI framework we train and run our computer-vision models. SlowFast (from Facebook AI) excels at action recognition in surgical videos, identifying steps like cutting or suturing.
*   **OAuth2/OIDC**: Industry-standard protocols for Single Sign-On (SSO) with institutions. Users log in with their school credentials without creating new passwords.
*   **Docker**: Packages our backend services and AI models into containers, ensuring the same environment runs everywhere (local tests, staging, production).
*   **ReportLab**: Generates PDF reports of AI feedback so students can download, print, or share their results.

How these components work together:

1.  User uploads video through a React form.
2.  FastAPI endpoints receive the file, store it in the database, and queue it for analysis.
3.  AWS-hosted Python workers pull the job, run the SlowFast model via PyTorch, then write results back to PostgreSQL and S3.
4.  Frontend fetches feedback data and PDF reports via RESTful calls.

## Infrastructure and Deployment

We leverage cloud platforms and modern workflows to keep the system reliable, scalable, and easy to update.

*   **AWS S3**: Secure, encrypted storage for uploaded videos and generated reports.

*   **AWS EC2 GPU Instances**: Powerful servers with NVIDIA GPUs for running AI inference quickly.

*   **Load Balancer & Auto-Scaling**: Distributes traffic across multiple EC2 instances and spins up new ones during peak usage.

*   **Docker & Container Orchestration**: Run all services in containers, making deployments predictable. We can use AWS ECS/EKS or Docker Compose in development.

*   **CI/CD with Replit, Bolt, Cline**: Automated pipelines that run tests, build containers, and deploy code whenever we merge changes. This ensures safe, repeatable releases.

*   **Version Control (Git)**: Tracks all code changes. Every feature, bug fix, or update is reviewed and versioned.

*   **Monitoring & Logging**:

    *   **AWS CloudWatch**: Collects system metrics (CPU, memory, network) and automatically triggers alerts if something goes wrong.
    *   **Sentry**: Captures errors in real time so we can fix issues before they impact users.

These choices mean the platform stays online (99.9% uptime), can handle more students as we grow, and updates happen without downtime.

## Third-Party Integrations

We connect to external services to handle payments, notifications, and authentication smoothly.

*   **Institutional SSO (OAuth2/OIDC)**: Integrates with schools’ identity providers so users log in with existing credentials.
*   **Payment Processor (e.g., Stripe)**: Manages secure subscription billing (monthly or annual), invoice generation, and reminders.
*   **Email Service (e.g., AWS SES or SendGrid)**: Sends out analysis-ready alerts, billing notifications, and password-reset messages.
*   **PDF Generation (ReportLab)**: Converts feedback data into downloadable PDF reports.

Benefits of these integrations:

*   **Security & Compliance**: We never handle raw card data or user passwords directly.
*   **Reliability**: Outsourcing email and payments to specialized providers reduces our maintenance overhead.
*   **User Trust**: Familiar login flow (SSO) and clear billing communications improve adoption.

## Security and Performance Considerations

Ensuring data is safe and the app runs smoothly is a top priority.

Security Measures:

*   **HIPAA Compliance**: Encrypt data at rest (S3) and in transit (HTTPS/TLS).
*   **Role-Based Access Control**: Students, instructors, and admins only see features and data they’re allowed to.
*   **Audit Logs**: Every change to feedback is tracked for accountability.
*   **Session Management & Token Expiry**: SSO tokens expire regularly to prevent unauthorized access.

Performance Optimizations:

*   **GPU-Accelerated Inference**: AI models run on GPUs so students get results in minutes, not hours.
*   **Auto-Scaling Clusters**: Spin up extra GPU servers when many videos queue at once.
*   **Caching**: Static assets and repeated API results (e.g., library contents) are cached via CloudFront or in-memory stores.
*   **Asynchronous Processing**: Video uploads and AI jobs run in the background, keeping the web interface responsive.

## Conclusion and Overall Tech Stack Summary

We’ve selected a set of modern, proven technologies that work together to meet our goals:

*   Frontend: React + Expo + AI-driven UI builders (v0, Lovable.dev, Bolt, Cline)
*   Backend: Python + FastAPI + PostgreSQL + OAuth2/OIDC + PyTorch with SlowFast
*   Infrastructure: AWS S3, AWS EC2 GPU, Docker, auto-scaling, CI/CD
*   Integrations: Institutional SSO, Stripe for payments, SES/SendGrid for email, ReportLab for PDFs
*   Security & Performance: HIPAA-grade encryption, role-based access, GPU inference, caching, monitoring

This combination ensures a seamless, secure, and scalable platform. It empowers medical students with AI-driven feedback, lets instructors enhance results, and gives institutions confidence in reliability and compliance. The stack is flexible enough to evolve—adding new AI models, deeper LMS integrations, or mobile apps—while maintaining a clear, manageable architecture.
