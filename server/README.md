# Image Dataset Server

Express + MongoDB backend providing auth, projects, billing stubs, and Google Drive stubs.

## Setup

1. Install dependencies

```
cd server
npm install
```

2. Configure environment

```
cp .env.example .env
# edit .env with your values
```

3. Start the server

```
npm run dev
# or
npm start
```

Server runs on http://localhost:4000

## Endpoints

- `POST /api/auth/register` { email, password, name }
- `POST /api/auth/login` { email, password }
- `GET /api/projects` (auth)
- `POST /api/projects` (auth)
- `GET /api/projects/:id` (auth)
- `PUT /api/projects/:id` (auth)
- `DELETE /api/projects/:id` (auth)
- `POST /api/billing/create-checkout-session` (auth) – requires STRIPE_SECRET_KEY
- `GET /api/drive/status` (auth) – placeholder for Google Drive linking

## Notes

- Passwords are hashed with bcrypt.
- JWT is used for auth. Set `JWT_SECRET` in `.env`.
- Replace Stripe key to enable billing.
- Google Drive linking is a stub; will be implemented with OAuth. 