# Inventory Reconciliation Tool (IM-07)

AI-powered Infrastructure Maintenance Management and Inventory Reconciliation Platform.

---

## Architecture Diagram

```mermaid
graph TD
    subgraph Client Environment
        F[React SPA + Vite Container: 5173]
    end

    subgraph Service Layer (Docker Container Networking)
        B[FastAPI Backend Container: 8000]
        H[GET /health check]
        B --> H
    end

    subgraph Database Layer
        D[PostgreSQL DB Container: 5432]
        V[(pgdata Local Volume)]
        D --> V
    end

    F -->|Fetch requests| B
    B -->|SQL Alchemy Queries| D
    B -->|AI Insights| G[Google Gemini API]
```

---

## Tech Stack

- **Frontend**: React 19, Recharts, React Router v7
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, PyJWT, Bcrypt
- **Database**: PostgreSQL 17
- **AI Service**: Google Gemini API

---

## Containerized Deployment (Docker)

To launch the entire platform (database, backend, frontend) in a containerized environment, follow these steps:

### 1. Prerequisites
- Install **Docker** and **Docker Compose** on your system.

### 2. Configure Environment Variables
Create a `.env` file in the root directory and define the required variables (see [.env.example](file:///c:/Users/Mohammed/Desktop/Infra%20Maintenance/Infra-Maintenance/.env.example)):
```env
# PostgreSQL Database Credentials
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=im07_reconciler
DATABASE_URL=postgresql://postgres:postgres@db:5432/im07_reconciler

# App Configuration
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key
```

### 3. Build and Run Containers
From the root directory, execute the build command:
```powershell
docker-compose up --build
```
This will:
- Set up a private network for all three containers.
- Create a persistent local database volume `pgdata`.
- Build the slim Python backend container.
- Build the Node.js frontend container.
- Start the database, run the health check, run automatic tables migration on FastAPI startup, and launch all services.

### 4. Port Access Map
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`
- **Backend Health Check**: `http://localhost:8000/health`
- **PostgreSQL Database**: `http://localhost:5432`

---

## Development Operations (Local Dev Server)

If you prefer to run services individually for debugging:

### Backend
1. Go to `backend/`:
   ```powershell
   cd backend
   ```
2. Activate virtualenv and install packages:
   ```powershell
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run FastAPI dev server:
   ```powershell
   uvicorn app.main:app --reload
   ```

### Frontend
1. Go to `frontend/`:
   ```powershell
   cd frontend
   ```
2. Install packages:
   ```powershell
   npm install
   ```
3. Run Vite server:
   ```powershell
   npm run dev
   ```