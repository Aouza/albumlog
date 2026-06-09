# Deployment

AlbumLog production deploys should run application builds and database migrations as separate, explicit steps.

## Environment Variables

Production needs:

```env
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=https://your-domain.com/api/auth/spotify/callback
AUTH_SESSION_SECRET=
TOKEN_ENCRYPTION_SECRET=
DATABASE_URL=
DIRECT_URL=
```

`SPOTIFY_REDIRECT_URI` must match the URI configured in the Spotify Developer Dashboard exactly.

## Database Migrations

Use this command for production:

```bash
npm run db:deploy
```

This runs:

```bash
prisma migrate deploy
```

Use `npm run db:migrate` only for local development because it runs `prisma migrate dev`.

## Release Checklist

- Production environment variables are configured.
- Spotify production redirect URI is configured.
- `npm run lint` passes.
- `npm test` passes.
- `npm run build` passes.
- `npm run db:deploy` has been run against the production database.
