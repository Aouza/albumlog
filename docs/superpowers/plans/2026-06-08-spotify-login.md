# Spotify Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add real Spotify OAuth login to AlbumLog using Next.js route handlers and an HTTP-only session cookie.

**Architecture:** The browser starts at `/login`, which calls `/api/auth/spotify/login` to redirect to Spotify. Spotify returns to `/api/auth/spotify/callback`, the server exchanges the code for tokens, fetches `/v1/me`, stores a compact signed session cookie, and the UI reads `/api/auth/me`.

**Tech Stack:** Next.js App Router, TypeScript, Spotify Web API, Vitest, HTTP-only cookies.

---

## Files

- Create `src/lib/auth/session.ts`: signed session cookie helpers.
- Create `src/lib/auth/spotify.ts`: Spotify URL/token/profile helpers.
- Create `src/lib/auth/spotify.test.ts`: OAuth helper tests.
- Create `src/app/login/page.tsx`: Spotify login UI.
- Create `src/app/api/auth/spotify/login/route.ts`: OAuth redirect start.
- Create `src/app/api/auth/spotify/callback/route.ts`: OAuth callback.
- Create `src/app/api/auth/me/route.ts`: current session endpoint.
- Create `src/app/api/auth/logout/route.ts`: logout endpoint.
- Create `src/components/auth/auth-status.tsx`: user status/logout UI.
- Modify `src/components/layout/app-shell.tsx`: expose login/session state.
- Add `.env.example`: Spotify and session configuration.

## Tasks

- [ ] Write failing tests for Spotify auth URL, state handling, and signed session roundtrip.
- [ ] Implement auth helpers until tests pass.
- [ ] Add Next.js route handlers for login, callback, current user, and logout.
- [ ] Add `/login` page using the project dark UI reference style.
- [ ] Add shell auth status with login/logout.
- [ ] Verify lint, tests, build, and route smoke checks.

## Configuration

Local redirect URI must be:

```text
http://127.0.0.1:3000/api/auth/spotify/callback
```

Spotify Developer Dashboard must contain that exact redirect URI.
