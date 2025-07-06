# Project Requirements Document

## 1. Project Overview

This AI-Powered Surgical Education Platform is a web-based solution that helps medical students improve their surgical skills by uploading their own operative videos and receiving AI-driven feedback. At its core, the system uses a computer-vision model (SlowFast on PyTorch) to recognize surgical steps and instruments, compare performance against expert benchmarks, and generate visual and textual coaching tips. Students see side-by-side expert comparisons, targeted improvement suggestions, and curated learning resources to reinforce best practices.

We’re building this platform to fill a gap in hands-on surgical training: where real-time expert coaching may not always be available, AI can provide consistent, objective, on-demand feedback. Success will be measured by user engagement (video submissions per month), AI evaluation accuracy (validated against expert reviews), and learning outcomes (improvement in technique scores over time). A seamless experience, HIPAA-compliant security, and easy integration with institutions’ single-sign-on systems are key objectives for Version 1.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (MVP)

*   Single Sign-On via OAuth2/OIDC with institutional identity providers
*   Secure video upload (MP4/MOV) with real-time progress bar
*   HIPAA-compliant storage (AWS S3) with 7-year retention and auto-archival/purge policy
*   AI analysis pipeline (SlowFast model) for step recognition and technique scoring
*   Annotated feedback UI: overlay, side-by-side expert clips, text coaching tips
*   Exportable PDF reports of feedback
*   Curated learning library with filters (procedure type, difficulty) and AI-driven recommendations
*   Instructor/Admin dashboard: review and manually adjust AI feedback, view change history
*   In-app and email notifications for analysis completion, new recommendations, billing events
*   Subscription management: monthly & annual plans, payment handling, renewal reminders

### Out-of-Scope (Phase 2+)

*   Native mobile app (web responsive only for MVP)
*   Canvas/Blackboard grade syncing or deep LMS integrations
*   VR/AR or simulation-based modules
*   Peer-to-peer video sharing or community forums
*   Advanced certification tracking or continuing medical education (CME) credits
*   GDPR/FERPA compliance (only HIPAA in scope)

## 3. User Flow

New users arrive at a landing page and choose their institution from a dropdown. They authenticate via Single Sign-On (OAuth2/OIDC) using existing credentials. First-time users complete a brief onboarding that covers platform features, data policies (7-year retention, HIPAA), and consent. They land on a personalized dashboard showing pending analyses, submission history, and performance charts.

To submit a video, users click “Upload,” select an MP4 or MOV file, and watch an encrypted transfer to cloud storage with a progress bar. The video is queued for AI analysis, and the dashboard displays an estimated completion time. Upon finishing, the user receives an in-app notification and an email with a link to the detailed feedback page, which features an annotated video player, side-by-side expert comparisons, and text coaching tips with links to relevant library resources.

## 4. Core Features

*   **Authentication & Authorization**\
    • Single Sign-On (SSO) with OAuth2/OIDC\
    • Role-based access (Student, Instructor/Admin)
*   **Video Upload & Secure Storage**\
    • Support for MP4/MOV formats\
    • Real-time upload progress\
    • End-to-end encryption, HIPAA-compliant S3 buckets\
    • Retention for 7 years, automatic archival/purge
*   **AI Analysis Engine**\
    • SlowFast action-recognition model fine-tuned on surgical datasets\
    • Detects key steps, instruments, and technique deviations\
    • Generates structured data for feedback
*   **Feedback & Coaching System**\
    • Annotated video overlay and side-by-side expert clips\
    • Textual coaching points with precise error descriptions\
    • Links to curated learning resources
*   **Resource Library**\
    • Searchable database of expert videos and guides\
    • Filters by procedure type and difficulty\
    • AI-powered recommendations based on performance gaps
*   **Instructor/Admin Dashboard**\
    • Review and manually adjust AI feedback\
    • Version history and audit logs\
    • User management and permission controls
*   **Notifications**\
    • In-app banners\
    • Email alerts for analysis completion, billing events, and resource suggestions
*   **Reporting & Export**\
    • PDF export of feedback and performance reports
*   **Subscription & Billing**\
    • Monthly and annual plans\
    • Secure payment processing and renewal reminders

## 5. Tech Stack & Tools

*   **Frontend:** React, v0 (component builder), Expo (responsive), Lovable.dev (UI scaffolding)
*   **Backend:** Python, FastAPI (RESTful API), PostgreSQL
*   **AI & ML:** PyTorch, SlowFast model fine-tuning, CUDA GPUs on AWS EC2
*   **Storage & Hosting:** AWS S3 (videos), AWS EC2 GPU instances (inference), Docker containers
*   **Authentication:** OAuth2/OIDC (institutional SSO)
*   **CI/CD & IDEs:** Replit, Bolt, Cline for scaffolding and collaboration
*   **Export & Docs:** PDF generation library (e.g., ReportLab)
*   **Monitoring & Logging:** CloudWatch, Sentry

## 6. Non-Functional Requirements

*   **Performance:**\
    • AI inference latency ≤ 2 minutes per 10-minute video at scale\
    • Dashboard load times < 1 second
*   **Security & Compliance:**\
    • HIPAA-compliant data handling, encryption at rest/in transit\
    • Role-based access control, audit logs\
    • Regular security audits and penetration testing
*   **Usability & Accessibility:**\
    • WCAG 2.1 AA compliance\
    • Responsive design for desktop and mobile browsers\
    • Clear error messaging and progress indicators
*   **Scalability & Reliability:**\
    • Auto-scaling GPU clusters for peak analysis loads\
    • Load balancing and health checks for high availability (99.9% uptime)

## 7. Constraints & Assumptions

*   **Constraints:**\
    • Reliable availability of GPU instances (AWS or equivalent)\
    • Institutional SSO endpoints conform to OAuth2/OIDC standards\
    • Video datasets available for model fine-tuning
*   **Assumptions:**\
    • Students and instructors already have institutional credentials\
    • No offline/mobile-only features required for MVP\
    • Legal requirements limited to HIPAA; no GDPR/FERPA in scope

## 8. Known Issues & Potential Pitfalls

*   **AI Accuracy vs. Expert Standards:**\
    • Risk: Model may misidentify steps or suggest incorrect feedback.\
    • Mitigation: Continuous expert-in-the-loop validation, regular retraining on new data.
*   **High Compute Costs:**\
    • Risk: GPU inference at scale could be expensive.\
    • Mitigation: Batch processing, spot instances, and model optimizations (quantization).
*   **SSO Integration Challenges:**\
    • Risk: Different institutions may have varying SSO implementations.\
    • Mitigation: Build a flexible OAuth2/OIDC client library and thorough integration docs.
*   **Data Retention Policies:**\
    • Risk: Automated purge might delete active user data.\
    • Mitigation: User-confirm archival settings and admin override controls.
*   **Subscription Payment Failures:**\
    • Risk: Failed billings lock out legitimate users.\
    • Mitigation: Grace periods, reminder notifications, and manual payment options.

This document serves as the definitive guide for AI and engineering teams to implement the AI-Powered Surgical Education Platform. All subsequent technical artifacts (detailed tech stack docs, frontend/backend guidelines, flowcharts, security plans) should reference these clear, unambiguous requirements.
