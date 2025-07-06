# Unified Project Documentation

## Project Requirements Document

### 1. Project Overview

This AI-Powered Surgical Education Platform is a web-based solution that helps medical students improve their surgical skills by uploading their own procedure videos and receiving AI-driven feedback. It uses a computer vision model (SlowFast on PyTorch) to recognize surgical steps, assess technique against expert benchmarks, and generate visual annotations and text coaching tips. Students see side-by-side expert comparisons, targeted improvement suggestions, and curated learning resources to reinforce best practices.

The platform addresses gaps in hands-on surgical training by providing consistent, on-demand feedback when live expert coaching isn’t available. Success will be measured by user engagement (number of video submissions per month), AI accuracy (validated against expert reviews), and improvements in students’ technique scores over time. Key objectives for Version 1 include a seamless user experience, HIPAA-compliant security, and easy integration with institutional single sign-on systems.

### 2. In-Scope vs. Out-of-Scope

**In-Scope (MVP)**

*   Single Sign-On (SSO) via OAuth2/OIDC with institutional identity providers
*   Secure video upload (MP4/MOV) with real-time progress tracking
*   HIPAA-compliant storage in AWS S3, retention up to 7 years, and automatic archival or purge
*   AI analysis pipeline using the SlowFast model for step recognition and technique scoring
*   Annotated feedback UI with overlay, side-by-side expert comparisons, and text coaching tips
*   PDF export of feedback reports
*   Curated learning library with search filters and AI-driven recommendations
*   Instructor/Admin dashboard for reviewing and manually adjusting AI feedback, with version history
*   In-app and email notifications for analysis completion, resource suggestions, and billing events
*   Subscription management supporting monthly and annual plans, payment handling, and renewal reminders

**Out-of-Scope (Phase 2+)**

*   Native mobile app (web responsive only for MVP)
*   Deep LMS integrations like Canvas or Blackboard grade syncing
*   VR/AR simulation modules
*   Peer-to-peer video sharing forums
*   Advanced certification tracking or CME credits
*   GDPR/FERPA compliance (beyond HIPAA)

### 3. User Flow

New users go to a landing page, select their institution from a dropdown, and authenticate via Single Sign-On (OAuth2/OIDC). First-time users see a brief onboarding tutorial explaining platform features, data retention (7 years), and consent requirements. After onboarding, they arrive at a personalized dashboard showing pending analyses, past submissions, and performance charts.

To submit a video, users click “Upload,” pick an MP4 or MOV file, and watch it transfer securely with a progress bar. The video is queued for AI analysis, and the dashboard shows an estimated completion time. Once complete, the user receives an email and in-app notification linking to a feedback page with an annotated video player, expert comparisons, and coaching tips linked to learning resources.

### 4. Core Features

*   **Authentication & Authorization**: Single Sign-On via OAuth2/OIDC and role-based access (Student, Instructor/Admin).
*   **Video Upload & Secure Storage**: Supports MP4/MOV, real-time progress bar, end-to-end encryption, HIPAA-compliant AWS S3 buckets, 7-year retention with archival/purge.
*   **AI Analysis Engine**: SlowFast model fine-tuned on surgical datasets to detect key steps, instruments, and deviations.
*   **Feedback & Coaching System**: Annotated video overlays, side-by-side expert clips, text coaching points, and links to resources.
*   **Resource Library**: Searchable database of expert videos and guides, filters by procedure type and difficulty, AI-based recommendations.
*   **Instructor/Admin Dashboard**: Review and manually edit AI feedback, version history, user management.
*   **Notifications**: In-app banners and email alerts for analysis results, resource suggestions, and billing events.
*   **Reporting & Export**: PDF export of feedback and performance reports.
*   **Subscription & Billing**: Supports monthly and annual plans, secure payment processing, renewal reminders.

### 5. Tech Stack & Tools

**Frontend:** React, React Router, Expo (responsive), v0 (component builder), Lovable.dev for UI scaffolding **Backend:** Python, FastAPI (RESTful API), PostgreSQL **AI & ML:** PyTorch, SlowFast model fine-tuning, GPU inference on AWS EC2 **Storage & Hosting:** AWS S3 for videos, AWS EC2 GPU instances for model inference, Docker containers **Authentication:** OAuth2/OIDC for institutional SSO **CI/CD & IDEs:** Replit, Bolt, Cline for scaffolding, collaboration, and deployment pipelines **PDF & Notifications:** ReportLab or PDFKit for report export, email service (e.g., SendGrid) **Monitoring & Logging:** AWS CloudWatch, Sentry

### 6. Non-Functional Requirements

*   Performance: AI inference latency under 2 minutes per 10-minute video, dashboard load times under 1 second
*   Security & Compliance: HIPAA-compliant encryption at rest/in transit, role-based access control, audit logs, regular security audits
*   Usability & Accessibility: WCAG 2.1 AA compliance, responsive design, clear error messaging
*   Scalability & Reliability: Auto-scaling GPU clusters, load balancing, health checks, 99.9% uptime target

### 7. Constraints & Assumptions

*   Constraints: Dependence on GPU availability in cloud, consistent OAuth2/OIDC implementations from institutions, access to annotated surgical video datasets
*   Assumptions: Users have institutional credentials, no mobile-only features for MVP, legal scope limited to HIPAA

### 8. Known Issues & Potential Pitfalls

*   **AI Accuracy vs. Experts**: Model might misidentify steps; mitigate with regular expert-in-the-loop validation and retraining.
*   **Compute Costs**: GPU inference can be expensive; mitigate with batch processing, spot instances, and model optimizations.
*   **SSO Variability**: Institutions may have different SSO setups; build a flexible OAuth2/OIDC client and provide integration docs.
*   **Data Retention Errors**: Automatic purge could remove active data; mitigate with admin reviews and manual override options.
*   **Payment Failures**: Billing issues could block access; mitigate with grace periods, reminders, and manual payment options.

## App Flow Document

### Onboarding and Sign-In/Sign-Up

When a new user arrives, they see a welcome page explaining the platform and a prompt to sign in via their institution’s single sign-on. They pick their organization from a list, authenticate with familiar credentials, and return to the app where they review a consent screen describing HIPAA storage rules and a seven-year retention policy. After agreeing, they can complete a short tutorial highlighting upload, analysis, and dashboard features. Signing out is a single click from the top navigation bar, and if they forget their password, a link takes them to their institution’s recovery portal.

### Main Dashboard or Home Page

Once logged in, users land on a dashboard that summarizes pending video analyses, completed submissions, and performance trends. A notification bell indicates new feedback or recommended resources, and primary buttons invite users to upload new videos or explore the learning library. A sidebar provides links to upload, history, library, subscription settings, and user preferences. Clear headers and breadcrumbs help users understand their location and navigate to other sections.

### Detailed Feature Flows and Page Transitions

When the user chooses to upload, they go to a page that accepts MP4 and MOV formats, shows a real-time progress bar during transfer, and confirms secure, encrypted storage once complete. The app then redirects them back to the dashboard with an updated status icon. As the AI pipeline runs, status updates appear on the dashboard and in the analysis queue section. When analysis finishes, the user gets both an in-app alert and an email linking to the feedback page. On feedback review, the user sees an annotated video player alongside synchronized expert examples, detailed text coaching, and links to relevant resources. A download button lets them export a PDF report. Instructors access a separate admin interface from the sidebar, review AI comments, make edits, save them, and trigger a new notification for the student.

### Settings and Account Management

Through the user menu, individuals access settings to update their display name, contact email, and notification preferences for both email and in-app alerts. Subscription details are managed on a dedicated tab where users can switch plans, update payment methods, and view invoices. A link always returns them to the dashboard when they’re done.

### Error States and Alternate Paths

If a user uploads an unsupported file, the page shows a clear message about accepted formats and prompts them to retry. Network issues during upload or analysis display a warning and automatic retry when connectivity returns. Session timeouts preserve unsaved changes and redirect users to sign in again. Billing failures highlight overdue status but allow read-only access during a grace period, with reminders to update payment information.

### Conclusion and Overall App Journey

From effortless single sign-on to a central dashboard, users submit videos, track AI analysis status, and review richly annotated feedback with links to targeted resources. Instructors refine AI feedback through an admin interface, while subscription and billing flows keep the service running smoothly. Robust error handling and clear navigation ensure there are no dead ends, guiding users from sign-up to skill improvement with AI-driven insights.

## Tech Stack Document

### Frontend Technologies

*   React for dynamic UI and component-based structure
*   React Router for managing page navigation
*   Expo for ensuring responsive design across devices
*   v0 (AI-powered component builder) for rapid prototyping
*   Lovable.dev for consistent UI scaffolding and theming

### Backend Technologies

*   Python with FastAPI for building RESTful APIs quickly and clearly
*   PostgreSQL for reliable relational data storage
*   Docker containers for consistent deployment across environments
*   ReportLab or PDFKit for generating exportable PDF feedback reports

### Infrastructure and Deployment

*   AWS S3 for secure, scalable video storage
*   AWS EC2 GPU Instances for AI inference workloads
*   Dockerized services orchestrated via CI/CD pipelines (using Bolt or Cline)
*   Git-based version control with automated deployments on push

### Third-Party Integrations

*   OAuth2/OIDC for institutional single sign-on
*   SendGrid (or similar) for reliable email notifications
*   AWS CloudWatch and Sentry for monitoring, logging, and error tracking
*   Payment gateway (Stripe or equivalent) for subscription and billing management

### Security and Performance Considerations

*   Encryption at rest and in transit for all user data and videos
*   Role-based access control and audit logs for compliance
*   AI inference optimizations (batching, quantization) to reduce latency and cost
*   Auto-scaling GPU clusters and load balancing to maintain performance under high load

### Conclusion and Overall Tech Stack Summary

This stack combines modern frontend frameworks with a scalable, secure backend and AI-focused infrastructure. React and Expo deliver a responsive, accessible user interface, while FastAPI and PostgreSQL power robust APIs and data storage. AWS services provide scalable video storage and GPU compute for AI analysis. Third-party integrations like OAuth2/OIDC, email services, and payment gateways ensure seamless user experiences, and security measures maintain HIPAA compliance.

## Frontend Guidelines Document

### Frontend Architecture

Our frontend is built with React in a component-based architecture. Each feature corresponds to a folder containing its components, styles, and tests, making it easy to scale and maintain. We use React Router to handle navigation and Context API for global state like user authentication and notifications. Components are stateless where possible and rely on props and hooks for data and side effects.

### Design Principles

We focus on usability with a clean, uncluttered layout and intuitive controls. Accessibility follows WCAG 2.1 AA guidelines, ensuring proper color contrast, keyboard navigation, and screen reader support. Responsiveness guarantees a smooth experience on desktops and mobile browsers, with fluid grids and flexible images.

### Styling and Theming

We use styled-components, a CSS-in-JS library, to encapsulate styles within components and enable dynamic theming. A central theme file defines colors, typography, and spacing. We follow a flat design aesthetic with a neutral color palette—deep blue for primary actions, gray tones for backgrounds, and accents in teal. We choose a legible sans-serif font like Inter for clear readability.

### Component Structure

Components live under a `src/components` directory, organized by feature. Each component folder contains:

*   `index.jsx` for the component code
*   `styles.js` for styled-components definitions
*   `__tests__` for unit tests Reusable UI elements like buttons, cards, and modals are in a shared `ui` folder for consistency and reusability.

### State Management

We use React Context for global state (authentication, user settings, notifications) and local state with the `useState` hook for component-specific data. For data fetching and caching, we rely on React Query to simplify API calls, manage loading states, and cache results efficiently.

### Routing and Navigation

React Router defines routes in a central `AppRoutes.jsx` file. Public routes like login and signup live separately from protected routes, wrapped in an authentication guard component. Nested routes handle sections like upload, feedback history, and admin reviews, keeping URLs semantic.

### Performance Optimization

We apply lazy loading with React’s `lazy` and `Suspense` to load components on demand. Code splitting ensures that large libraries, like the video player, are only loaded when needed. Images and videos use optimized formats and lazy-loading attributes. We also minimize bundle size through tree-shaking and gzip compression.

### Testing and Quality Assurance

Unit tests use Jest and React Testing Library, focusing on component behavior and edge cases. Integration tests validate flows like login, upload, and feedback review. End-to-end tests with Cypress simulate user journeys from sign-up to report export. We enforce code quality with ESLint and Prettier.

### Conclusion and Overall Frontend Summary

Our frontend setup balances scalability, performance, and maintainability. A clear folder structure, component-based design, and styled-components for theming ensure consistency. React Router, Context API, and React Query manage navigation, state, and data. Performance optimizations and thorough testing practices keep the user experience fast and reliable.

## Implementation Plan

1.  **Project Kickoff & Setup**

    *   Define repository structure and branching strategy.
    *   Configure CI/CD pipelines with Bolt or Cline and set up the Replit environment.

2.  **Authentication & Infrastructure**

    *   Implement OAuth2/OIDC SSO flow in backend and frontend.
    *   Provision AWS resources: S3 buckets, EC2 GPU instances, VPC, and security groups.
    *   Containerize services with Docker.

3.  **Backend & API Development**

    *   Build FastAPI endpoints for user management, video upload, AI job queue, feedback retrieval, and billing.
    *   Set up PostgreSQL schemas for users, videos, analyses, and subscriptions.

4.  **AI Model Integration**

    *   Fine-tune the SlowFast model on surgical datasets.
    *   Develop an inference service to process videos and generate structured feedback.
    *   Integrate the inference service with the backend job queue and monitoring tools.

5.  **Frontend Scaffold & Upload Feature**

    *   Initialize React project with routing and global context.
    *   Create the upload page with file picker, progress bar, and error handling.
    *   Connect upload functionality to the backend API and display processing status.

6.  **Feedback UI & Learning Library**

    *   Build the feedback review page with video player, annotation overlays, and coaching tips.
    *   Implement PDF export functionality.
    *   Develop the resource library with search filters and recommendation API calls.

7.  **Admin Dashboard & Manual Review**

    *   Create admin interfaces for listing submissions, editing feedback, and viewing audit logs.
    *   Implement role-based access controls.

8.  **Subscription & Notifications**

    *   Integrate payment gateway for billing cycles and plan management.
    *   Set up email and in-app notification services for analysis completion and billing events.

9.  **Security & Compliance**

    *   Ensure encryption at rest and in transit, implement data retention policies, and conduct a security audit.
    *   Add admin override controls for data archival.

10. **Testing & Quality Assurance**

*   Write unit, integration, and end-to-end tests.
*   Conduct usability testing with pilot users and gather feedback.

1.  **Deployment & Monitoring**

*   Deploy to staging, then production with blue/green or canary releases.
*   Configure auto-scaling, load balancing, and monitoring dashboards.

1.  **Beta Launch & Iteration**

*   Release MVP to select institutions, collect user feedback, and refine AI accuracy and UX.

1.  **Full Launch & Marketing**

*   Ramp up marketing efforts, onboard more institutions, and expand the procedure library.

This plan provides a clear, step-by-step path to deliver the AI-Powered Surgical Education Platform from setup through full launch.
