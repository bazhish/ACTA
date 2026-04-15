# ACTA Backend

Production-ready MVP API for institutional occurrence management using Node.js, Express, PostgreSQL, Prisma, and JWT.

## Environment

```bash
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/acta?schema=public"
JWT_SECRET="change-me-in-production"
CORS_ORIGIN="http://localhost:5173"
```

## Local run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

## Production run

```bash
npm install
npm run prisma:generate
npm run prisma:deploy
npm start
```
