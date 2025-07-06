# Implementation plan

## Phase 1: Environment Setup

1. Step 1: **Prevalidation** – Check if current directory already contains a project (e.g., `.git` folder, `frontend/`, `backend/`). If yes, skip initialization; otherwise proceed. (**Project Requirements Document: Section 1.2**)  
2. Step 2: Install Node.js v20.2.1 and Python 3.11.4. (**Tech Stack Document: Core Tools**)  
3. Step 3: **Validation** – Run `node -v` and `python --version` to confirm correct versions. (**Tech Stack Document: Core Tools**)  
4. Step 4: Install AWS CLI v2. (**Tech Stack Document: Infrastructure**)  
5. Step 5: **Validation** – Run `aws --version` to confirm AWS CLI installation. (**Tech Stack Document: Infrastructure**)  
6. Step 6: Install Docker Engine v20.10.x. (**Tech Stack Document: Infrastructure**)  
7. Step 7: **Validation** – Run `docker --version` and `docker ps` to confirm Docker is running. (**Tech Stack Document: Infrastructure**)  
8. Step 8: Initialize Git repository if none exists: `git init` at project root. (**Q&A: Version Control**)  
9. Step 9: Create top-level directories: `/frontend` and `/backend`. (**App Flow Document: Project Structure**)  

## Phase 2: Frontend Development

10. Step 10: Navigate into `/frontend`. (`cd frontend`) (**App Flow Document: Frontend Setup**)  
11. Step 11: Scaffold React app using Create React App v5.0.1:  
    ```bash
    npx create-react-app@5.0.1 . --template typescript
    ```  
    (**Tech Stack Document: Frontend**)  
12. Step 12: Install UI & utility libraries:  
    ```bash
    npm install lovable.dev@1.2.3 bolt@0.9.0 cline@2.1.1 react-router-dom@6.3.0 axios@1.3.5 @auth0/auth0-react@2.1.0
    ```  
    (**Tech Stack Document: Frontend**)  
13. Step 13: Create routing file at `/frontend/src/routes/AuthRoutes.tsx` defining routes for `/login`, `/dashboard`, `/upload`. (**App Flow Document: Step 1**)  
14. Step 14: Create `/frontend/src/components/Login.tsx` with institutional SSO (OAuth2/OIDC) integration and fallback email/password. (**PRD Section 3.3**)  
15. Step 15: Create `/frontend/src/components/VideoUpload.tsx` supporting MP4/MOV upload to AWS S3 with a progress bar. (**PRD Section 2.1**)  
16. Step 16: Create `/frontend/src/components/Dashboard.tsx` showing progress tracking, past videos, analysis status. (**App Flow Document: Dashboard**)  
17. Step 17: Create `/frontend/src/components/FeedbackView.tsx` to display AI annotations side-by-side with original video and text suggestions. (**PRD Section 2.2**)  
18. Step 18: Update `/frontend/src/App.tsx` to include a Navbar with notification badge (in-app/email triggers). (**PRD Section 4.1**)  
19. Step 19: **Validation** – Run `npm test` in `/frontend` and ensure all unit tests pass. (**Q&A: Testing**)  

## Phase 3: Backend Development

20. Step 20: Navigate into `/backend` and create Python venv:  
    ```bash
    python3.11 -m venv venv
    source venv/bin/activate
    ```  
    (**Tech Stack Document: Backend**)  
21. Step 21: Install core backend dependencies:  
    ```bash
    pip install fastapi==0.95.2 uvicorn==0.22.0 psycopg2-binary==2.9.6 boto3==1.26.72 python-jose==3.3.0
    ```  
    (**Tech Stack Document: Backend**)  
22. Step 22: Install AI/ML dependencies:  
    ```bash
    pip install torch==2.0.1 torchvision==0.15.2 slowfast==1.0
    ```  
    (**Tech Stack Document: AI/ML**)  
23. Step 23: Create `/backend/app/main.py` and initialize FastAPI app with CORS for `http://localhost:3000`. (**App Flow Document: Integration**)  
24. Step 24: Create `/backend/app/auth.py` implementing OAuth2/OIDC flows for institutional SSO. (**PRD Section 3.4**)  
25. Step 25: Create `/backend/app/models.py` defining SQLAlchemy models for User (roles: student, instructor, admin), Video, Analysis, Feedback, Resource. (**PRD Section 1.1**)  
26. Step 26: Create `/backend/app/database.py` to connect to PostgreSQL 15.3 using `DATABASE_URL` env var. (**Tech Stack Document: Database**)  
27. Step 27: Create `/backend/app/routes/videos.py` with endpoints:  
    - `POST /api/v1/upload`  
    - `GET /api/v1/videos/{video_id}`  
    (**PRD Section 2.1**)  
28. Step 28: Create `/backend/app/routes/analysis.py` with endpoint `POST /api/v1/analysis/{video_id}` to trigger SlowFast inference on GPU. (**PRD Section 2.2**)  
29. Step 29: Create `/backend/app/utils/s3.py` for uploading/downloading video files to AWS S3 bucket `surgical-videos-us-east-1`. (**Tech Stack Document: Infrastructure**)  
30. Step 30: Write SQL migration file `/backend/migrations/001_init.sql` with `CREATE TABLE` statements for all models. (**Tech Stack Document: Database**)  
31. Step 31: **Validation** – Launch local Postgres container:  
    ```bash
    docker run --name db -e POSTGRES_PASSWORD=pass -d postgres:15.3
    psql -h localhost -U postgres -f migrations/001_init.sql
    ```  
    and verify tables exist. (**Tech Stack Document: Database**)  
32. Step 32: Create `/backend/Dockerfile` using `python:3.11.4-slim`, installing dependencies, exposing port 8000, and running `uvicorn app.main:app --host 0.0.0.0`. (**Tech Stack Document: Backend**)  
33. Step 33: **Validation** – Build and run Docker image:  
    ```bash
    docker build -t surgical-backend:latest .
    docker run -p 8000:8000 surgical-backend:latest
    ```  
    then verify `/docs` is reachable. (**Q&A: Pre-Launch Checklist**)  

## Phase 4: Integration

34. Step 34: Confirm CORS and JWT middleware in `/backend/app/main.py` allows requests from `http://localhost:3000` and secures protected routes. (**App Flow Document: Integration**)  
35. Step 35: Create `/frontend/src/services/api.ts` defining Axios instance with `baseURL: http://localhost:8000/api/v1` and JWT header injection. (**App Flow Document: Integration**)  
36. Step 36: In `Login.tsx`, call `/api/v1/auth/login`, retrieve JWT, store in memory or secure cookie. (**PRD Section 3.5**)  
37. Step 37: In `VideoUpload.tsx`, POST FormData to `/api/v1/upload`, handle Axios upload progress events. (**PRD Section 2.1**)  
38. Step 38: After upload, call `/api/v1/analysis/{videoId}`, poll status every 5 seconds until “completed.” (**PRD Section 2.2**)  
39. Step 39: Display feedback in `FeedbackView.tsx` when analysis completes, fetching from `/api/v1/feedback/{videoId}`. (**PRD Section 2.2**)  
40. Step 40: **Validation** – Write and run Cypress E2E in `/frontend/cypress/integration/flow.spec.js` to verify login → upload → analysis flow. (**Q&A: Testing**)  

## Phase 5: Deployment

41. Step 41: Create AWS S3 bucket `surgical-videos-us-east-1` in `us-east-1` with versioning and a 7-year lifecycle policy. (**Tech Stack Document: Infrastructure**)  
42. Step 42: Create IAM user `surgical-platform` with least-privilege policies for S3, ECS, ECR, SES. (**Q&A: Security**)  
43. Step 43: Create AWS ECR repo `surgical-backend`, push `surgical-backend:latest` image. (**Tech Stack Document: Deployment**)  
44. Step 44: Define ECS Fargate service in `/infra/ecs/backend-service.yaml` using `surgical-backend` image, 2 vCPU / 4 GB RAM. (**Tech Stack Document: Deployment**)  
45. Step 45: Build frontend production bundle (`npm run build`) and upload to S3 bucket `surgical-frontend-assets`; configure CloudFront distribution. (**Tech Stack Document: Deployment**)  
46. Step 46: Create GitHub Actions CI/CD in `/github/workflows/ci-cd.yaml` to build/test and deploy frontend & backend on `push` to `main`. (**Q&A: CI/CD**)  
47. Step 47: Implement `/backend/app/utils/notifications.py` using AWS SES to send email on analysis completion. (**PRD Section 4.2**)  
48. Step 48: Configure AWS SNS topic for in-app notification events; subscribe backend endpoint. (**PRD Section 4.2**)  
49. Step 49: **Validation** – Deploy to staging, run E2E tests against staging URL, verify email + in-app notifications triggered. (**Q&A: Pre-Launch Checklist**)  
50. Step 50: Provision CloudWatch alarms for ECS CPU >80%, memory >75%, and enable S3 access logging with 7-year retention. (**Q&A: Security**)