# BHARAT-TWIN Deployment Guide

This document details the production preparation and architecture configurations for deploying BHARAT-TWIN to cloud platforms (Render, Railway, Firebase Hosting, and PostgreSQL databases) as required by FEATURE 12.

---

## 1. Secrets & Environment Variables

The platform relies on the following environment variables. In production, configure these in your host dashboard:

| Variable | Scope | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | Backend | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `GROQ_API_KEY` | Backend | API Key for llama-3.3-70b-versatile model |
| `GEMINI_API_KEY` | Backend | API Key for gemini-2.5-flash fallback |
| `NEXT_PUBLIC_API_URL` | Frontend | Base URL of the backend (e.g. `https://api.bharat-twin.gov.in`) |

---

## 2. Backend Container Deployment (Railway / Render / Docker)

The backend is fully dockerized. To deploy to Railway or Render:

1. **GitHub Repository Link**: Push the repository to GitHub.
2. **Container Host Build**: Point the service to the `backend/Dockerfile`.
3. **Internal Port Mapping**: Bind the container internal port to `8000`.
4. **Environment Variables**: Configure the secrets in the service settings panel.

### Health Check Endpoint
The backend includes a health monitor path `GET /` which returns the service metadata. Deployments can configure the health monitor probe at this path.

---

## 3. Database Migration (PostgreSQL / PostGIS)

For production databases, PostGIS is required to support geo-spatial geometries:

1. Ensure the PostgreSQL cluster has the PostGIS extension loaded:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
2. Configure `DATABASE_URL` to point to the PostgreSQL instance. SQLAlchemy will automatically connect and create the metadata tables on startup.
3. For large production loads, verify indexes are applied:
   - `ix_climate_observations_region_id`
   - `ix_climate_observations_observation_date`
   - `ix_climate_observations_latitude`
   - `ix_climate_observations_longitude`

---

## 4. Frontend Deployment (Firebase Hosting / Vercel / Netlify)

The Next.js frontend has been configured to build statically:

1. Run compile command:
   ```bash
   npm run build
   ```
2. **Firebase Hosting**:
   Initialize and deploy using Firebase CLI tools:
   ```bash
   firebase deploy
   ```
   Firebase will read from the `firebase.json` configuration and deploy files in `frontend/out` directly.

---

## 5. Security & Rate Limiting Guidelines

- **Nginx Reverse Proxy**: For public deployments, configure Nginx or Cloudflare as a proxy to rate-limit requests to 120 requests/minute per IP address on `/decision-support/generate` and `/forecast/generate` endpoints to prevent API resource exhaustion.
- **SSL Configuration**: All backend API endpoints should be accessed over HTTPS to ensure database connection query queries remain secure.
