# AkariOps Folder Structure

```text
AkariOps/
  app/
    api/
      diagnose/
      summary/
    diagnose/
      [sessionId]/
    history/
    summary/
      [sessionId]/
  components/
    brand/
    diagnosis/
    history/
    ui/
  docs/
  lib/
    ai/
    session-store.ts
    utils.ts
  public/
    brand/
  types/
```

## Key Decisions

- `app/api` keeps API keys on the server side
- `lib/ai` contains prompts, provider calls, and fallback logic
- `lib/session-store.ts` keeps MVP persistence simple with local storage
- `components/diagnosis` owns the main user journey
