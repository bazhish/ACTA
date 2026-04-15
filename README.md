# ACTA

ACTA is a deployable MVP for institutional occurrence management in a school context.

## Structure

```text
ACTA/
  backend/   Express + Prisma + PostgreSQL API
  frontend/  React + Vite interface
```

## Local development

Backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Deployment

### Backend on Render

1. Push this repository to GitHub.
2. In Render, create a new `Web Service` from the repository.
3. Set `Root Directory` to `backend`.
4. Use these commands:

```bash
Build Command: npm install && npm run prisma:generate && npm run prisma:deploy
Start Command: npm start
```

5. Add environment variables in Render:

```bash
DATABASE_URL=your_render_postgres_url
JWT_SECRET=your_secure_secret
PORT=10000
CORS_ORIGIN=https://your-user.github.io
```

6. Deploy and copy the generated backend URL.

The repository also includes `render.yaml` to make this setup easier.

### Frontend on GitHub Pages

1. In `frontend/.env`, set:

```bash
VITE_API_URL=https://your-render-backend.onrender.com
```

2. Build the frontend:

```bash
cd frontend
npm install
npm run build
```

3. Publish the contents of `frontend/dist/` to GitHub Pages.
4. Open the GitHub Pages URL.

The frontend uses hash-based navigation, so it works on GitHub Pages without extra server-side SPA rewrites.
