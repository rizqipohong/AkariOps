# AkariOps

AkariOps is an AI-first troubleshooting web application for retail operations. It uses an original anime-inspired agent named Akari to guide users through scanner, receipt printer, POS, network, and inventory sync issues before escalating to human support.

The local folder in this workspace is still named `Naruhina`, but the product brand inside the app is `AkariOps`.

## Overview

AkariOps is designed around a clear AI narrative:

- AI is the core diagnosis engine, not a generic chatbot layer.
- Akari acts as the product guide, brand character, and troubleshooting agent.
- Users move through a browser flow from symptom intake, to structured diagnosis, to support handoff.
- The app supports either live AI via OpenAI or OpenRouter, or a smarter local fallback mode for offline/demo use.

## Core Features

- Structured AI diagnosis for:
  - scanner issues
  - receipt printer issues
  - POS workflow issues
  - network issues
  - inventory sync issues
- Bilingual interface:
  - English
  - Indonesian
- AI-powered support handoff summary
- Local session history stored in browser storage
- Loading states for AI requests
- Safe server-side API key usage through Next.js route handlers

## Tech Stack

- Next.js App Router
- TypeScript
- OpenAI SDK
- OpenAI or OpenRouter as the AI provider
- Vercel-ready deployment target

## Routes

- `/` landing page
- `/diagnose` new diagnosis workspace
- `/diagnose/[sessionId]` continue an existing diagnosis
- `/summary/[sessionId]` support handoff summary
- `/history` local session archive

## Local Development

### Requirements

- Node.js 20+
- npm

### Quick Start

```bash
cd Naruhina
cp .env.example .env.local
./ops/install.sh
./ops/dev.sh
```

Open:

- [http://localhost:3000](http://localhost:3000)

### Available Commands

```bash
./ops/install.sh
./ops/dev.sh
./ops/lint.sh
./ops/build.sh
./ops/start.sh
```

Or:

```bash
make dev
make build
make start
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill one provider:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
OPENROUTER_API_KEY=
OPENROUTER_MODEL=openai/gpt-4.1-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### OpenAI mode

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
```

### OpenRouter mode

```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openai/gpt-4.1-mini
```

If no API key is configured, the app falls back to a local adaptive diagnosis mode.

## Deployment

This project is ready for Vercel deployment.

### Recommended Vercel setup

1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Add the required environment variables in the Vercel project settings.
4. Deploy.

Required production env values:

- `AI_PROVIDER`
- `OPENAI_API_KEY` or `OPENROUTER_API_KEY`
- `OPENAI_MODEL` or `OPENROUTER_MODEL`
- `NEXT_PUBLIC_APP_URL`

## GitHub Push Checklist

Before pushing this repository:

1. Make sure `.env`, `.env.local`, `.next`, and `node_modules` are not tracked.
2. Keep `.env.example` committed.
3. Run:

```bash
./ops/lint.sh
./ops/build.sh
```

4. Review sensitive values:
   - API keys
   - local URLs
   - personal machine paths in screenshots or docs

If this folder is not yet a git repository, initialize it first:

```bash
git init
git add .
git commit -m "Initial commit"
```

## Repository Notes

- Session history is stored in browser `localStorage` for MVP speed.
- The mascot and brand direction are original anime-inspired placeholders, not direct franchise assets.
- AI requests are made server-side through `app/api/*` routes.

## Project Structure

```text
app/                  Next.js routes and API handlers
components/           UI and diagnosis components
docs/                 product and structure notes
lib/                  AI provider, fallback logic, i18n, session helpers
ops/                  local helper scripts
public/               brand assets
types/                shared TypeScript types
```
