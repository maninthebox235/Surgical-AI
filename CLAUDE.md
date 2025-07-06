# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Powered Surgical Education Platform that analyzes surgical procedure videos using computer vision to provide feedback to medical students. The platform uses PyTorch/TensorFlow models (SlowFast) to detect surgical techniques and provides real-time collaborative annotation features.

## Commands

### Frontend (React TypeScript)
```bash
cd frontend
npm install              # Install dependencies
npm start                # Run development server (http://localhost:3000)
npm test                 # Run tests with Jest
npm run build            # Build for production
```

### Backend (FastAPI Python)
```bash
cd backend
python -m venv venv      # Create virtual environment
source venv/bin/activate # Activate venv (Windows: venv\Scripts\activate)
pip install -r requirements.txt

# Development
uvicorn app.main:app --reload  # Run development server (http://localhost:8000)
pytest                          # Run tests with coverage
mypy app                        # Type checking
black app                       # Format code (100 char line limit)

# Database
alembic upgrade head     # Run migrations
alembic revision --autogenerate -m "message"  # Create new migration
```

## Architecture

### Frontend Structure
- **Components**: Reusable UI components (VideoPlayer, AnnotationEditor, Dashboard)
- **Pages**: Route-level components matching user flows
- **Services**: API client, WebSocket collaboration, keyboard shortcuts
- **Contexts**: AuthContext for Auth0 authentication
- **Types**: TypeScript interfaces for strong typing

### Backend Structure
- **FastAPI** app with async request handling
- **SQLAlchemy ORM** with PostgreSQL
- **Routers**: RESTful endpoints for auth, videos, analysis, annotations
- **Models**: User, Video, Analysis, Annotation with relationships
- **Utils**: AI analyzer (PyTorch/TensorFlow), video processor (OpenCV), S3 integration
- **Security**: OAuth2/OIDC with Auth0, role-based access control

### Key Features
- Real-time collaborative annotation via WebSocket
- AI-powered surgical technique analysis using SlowFast models
- Video processing with frame extraction and annotation overlay
- HIPAA-compliant security implementation
- AWS S3 for video storage, EC2 GPU instances for AI processing

### Database Schema
- **Users**: Medical students/professionals with Auth0 integration
- **Videos**: Uploaded surgical procedures with metadata
- **Analysis**: AI-generated feedback with confidence scores
- **Annotations**: Time-coded expert annotations with drawing data
- **Comments**: Collaborative feedback on annotations

### API Patterns
- RESTful design with consistent naming
- Pydantic schemas for request/response validation
- Dependency injection for auth and database sessions
- Async processing for video analysis tasks
- WebSocket for real-time collaboration features