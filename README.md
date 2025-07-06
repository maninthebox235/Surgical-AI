# AI-Powered Surgical Education Platform

An advanced platform for surgical education that uses AI to analyze surgical procedures and provide feedback to medical students and professionals.

## Prerequisites

- Node.js v20.2.1 (or newer)
- Python 3.11.4 (or newer)
- AWS CLI v2
- Docker Engine v20.10.x (or newer)

## Project Structure

```
.
├── frontend/           # React TypeScript frontend application
├── backend/           # FastAPI Python backend application
└── documentation/     # Project documentation and specifications
```

## Getting Started

1. Clone the repository
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

3. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## Development

- Frontend runs on http://localhost:3000
- Backend API runs on http://localhost:8000
- API documentation available at http://localhost:8000/docs

## Testing

- Frontend tests: `cd frontend && npm test`
- Backend tests: `cd backend && pytest`

## Deployment

See the deployment documentation in the `documentation/` directory for detailed instructions on deploying to AWS.

## License

This project is proprietary and confidential. 