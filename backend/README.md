# Surgical Education Platform Backend

This is the backend service for the AI-Powered Surgical Education Platform. It provides APIs for video upload, analysis, and feedback generation.

## Features

- Video upload and storage using AWS S3
- Authentication using Auth0
- Video analysis using PyTorch and SlowFast models
- Real-time feedback generation
- PostgreSQL database for data persistence

## Prerequisites

- Python 3.8+
- PostgreSQL 15+
- AWS Account with S3 access
- Auth0 Account
- PyTorch and SlowFast model weights

## Setup

1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. Initialize the database:
   ```bash
   # Create database
   createdb surgical_education
   
   # Run migrations (when implemented)
   alembic upgrade head
   ```

## Running the Application

Start the development server:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── core/          # Core functionality
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── schemas/       # Pydantic schemas
│   └── utils/         # Utility functions
├── tests/             # Test files
├── .env.example       # Example environment variables
├── requirements.txt   # Python dependencies
└── README.md         # This file
```

## Development

1. Install development dependencies:
   ```bash
   pip install -r requirements-dev.txt
   ```

2. Run tests:
   ```bash
   pytest
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 