# Example · QED-style login gate

A runnable [Next.js](https://nextjs.org) login gate — the same shape as the QED
study site — that uses **letter-minion** for the animated `QED` letters. Revealing
the password makes the letters shut their eyes (`eyesClosed`).

It also shows the *whole* gate pattern: an Edge `middleware` that redirects
unauthenticated requests to `/login`, an `/api/login` route that checks an access
code and sets a signed HMAC session cookie, and `/api/logout`.

> The library itself ships **only the visual components**. This auth code lives
> here in the example as a reference you can copy into your own app.

## Run it

```bash
cd examples/login
cp .env.local.example .env.local   # then edit the values
npm install                        # pulls in letter-minion from ../.. (file: dep)
npm run dev                        # http://localhost:3000  → redirects to /login
```

`.env.local`:

```ini
AUTH_SECRET=any-long-random-string
ACCESS_CODES=demo        # the access code is "demo"
```

Enter `demo` to pass the gate → lands on `/`. Click the eye icon to watch the
letters close their eyes.

## What's wired to letter-minion

```tsx
import { LetterRow } from "letter-minion";

<LetterRow text="QED" eyesClosed={showPassword} gap={-16} width={128} height={160} />
```

That single line is the entire visual integration — everything else
(`middleware.ts`, `src/lib/auth.ts`, `src/app/api/*`) is app-side auth you own.
