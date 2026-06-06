# letter-minion

Googly-eyed **letter** and **monster** creatures that follow the cursor — built with
React + [`motion`](https://motion.dev). Pure SVG, **no CSS framework required**
(works with or without Tailwind).

- 🔤 **Letter creatures** — turn any character (A–Z, 0–9, punctuation) into a googly-eyed mascot.
- 👀 Eyes track the cursor, blink, and the head tilts; 4 eye shapes (round / half / vertical / horizontal ellipse) with shape-specific closed-eye lids + optional lashes.
- 😌 `eyesClosed` to shut their eyes on demand.
- 👾 **Monsters** — the four interactive monsters (Violetto, Inky, Gloop, Nugget) with eye/face tracking and a password-aware "avert gaze".

## Install

Straight from GitHub (no npm account needed):

```bash
npm i github:XiaoKuge/letter-minion
```

Peer deps (you almost certainly already have these): `react`, `react-dom`, `motion`.

```bash
npm i react react-dom motion
```

## Usage

### Spell a word

```tsx
import { LetterRow } from "letter-minion";

export default function Hero() {
  return <LetterRow text="QED" gap={-16} width={128} height={160} />;
}
```

### A single letter (auto-tracks the cursor)

```tsx
import { GlyphCreature } from "letter-minion";

<GlyphCreature char="A" color="#c2410c" />;
```

### Shut their eyes (e.g. when a password field is revealed)

```tsx
const [show, setShow] = useState(false);
<LetterRow text="QED" eyesClosed={show} />;
```

### Monsters

```tsx
import { InteractiveMonsters } from "letter-minion";

<div style={{ width: 400, height: 400 }}>
  <InteractiveMonsters isFormFocused={focused} isPasswordVisible={show} />
</div>;
```

## API

### `<LetterRow>`
| prop | type | default | notes |
|---|---|---|---|
| `text` | `string` | — | one creature per character; spaces become gaps |
| `colors` | `string[]` | palette | cycled across letters |
| `gap` | `number` | `4` | px between letters; **negative** tucks them closer |
| `width` / `height` | `number` | `96` / `120` | per-letter tile size |
| `eyesClosed` | `boolean` | `false` | shut all eyes |
| `fontFamily` | `string` | Arial Black stack | glyph body font |
| `startIndex` | `number` | `0` | offsets eye-shape/blink variety |

### `<GlyphCreature>`
`char`, `color`, `index`, `eyesClosed`, `fontFamily`, `width`, `height`,
optional `cursorX` / `cursorY` (`MotionValue<number>`; defaults to a shared global cursor).

### `<InteractiveMonsters>`
`isFormFocused?: boolean`, `isPasswordVisible?: boolean`.

### `useGlobalCursor()`
Returns shared `{ cursorX, cursorY }` MotionValues (one window listener, attached lazily).

## Example

A runnable **QED-style login gate** that consumes this library lives in
[`examples/login`](./examples/login) — Next.js app with an access-code gate
(middleware + signed cookie + API) whose animated `QED` letters come from
`letter-minion`. Revealing the password shuts their eyes.

```bash
cd examples/login
cp .env.local.example .env.local
npm install      # pulls letter-minion from ../.. via a file: dependency
npm run dev      # http://localhost:3000  (access code: demo)
```

## License
MIT
