# GitHub Actions Configuration

## Setup Instructions

Since automatic GitHub App installation failed, follow these manual steps:

### 1. Push to GitHub
First, push your repository to GitHub:
```bash
git add .
git commit -m "Add GitHub Actions workflow"
git push origin main
```

### 2. Configure Repository Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `AUTH0_DOMAIN`: Your Auth0 domain
- `AUTH0_CLIENT_ID`: Your Auth0 client ID
- `AUTH0_CLIENT_SECRET`: Your Auth0 client secret
- `AWS_ACCESS_KEY_ID`: AWS access key for S3
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `S3_BUCKET_NAME`: Your S3 bucket name

### 3. Enable GitHub Actions
- Go to Actions tab in your repository
- Enable workflows if prompted

### 4. Configure Branch Protection (Optional)
- Go to Settings → Branches
- Add rule for `main` branch
- Enable "Require status checks to pass before merging"
- Select the CI jobs as required checks

## Workflows

### Main CI/CD Pipeline (`main.yml`)
- **Triggers**: Push to main/develop, Pull requests to main
- **Jobs**:
  - Backend testing (Python 3.11, PostgreSQL)
  - Frontend testing (Node.js 18.x)
  - Mobile app testing
  - Security vulnerability scanning
  - Deployment (on main branch only)

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):
```bash
brew install act  # macOS
act -j backend-test  # Run specific job
```