# Contributing Guidelines

## Documentation Rules

### 1. No Emojis in Markdown Headers

**Rule:** Never put emojis or status indicators in Markdown headers (`##`) that will be linked to from a table of contents.

**Why:** GitHub removes emoji from anchor IDs but keeps the rest of the text, causing link mismatches.

**Examples:**

```markdown
## ❌ Wrong
## 1. Feature Name ✅ IMPLEMENTED
```
- Anchor generated: `#1-feature-name-implemented`
- Link in table: `[Feature](#1-feature-name)` → **BROKEN**

```markdown
## ✅ Correct
## 1. Feature Name

**Status:** ✅ IMPLEMENTED
```
- Anchor generated: `#1-feature-name`
- Link in table: `[Feature](#1-feature-name)` → **WORKS**

### 2. Anchor Link Format

GitHub generates anchors by:
1. Converting to lowercase
2. Replacing spaces with hyphens
3. Removing emoji
4. Keeping all other text

Example:
- Header: `## Hello World 🎉`
- Anchor: `#hello-world`

### 3. Documentation Structure

- `docs/` - User-facing documentation
- `backend/docs/` - Backend-specific docs
- Root `.md` files - Project meta (README, CONTRIBUTING, etc.)

### 4. Commit Message Format

```
type: Short description

Longer explanation if needed.

- Bullet points for details
- Another point
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Code Style

### TypeScript
- Use strict mode
- Explicit return types on exported functions
- No `any` without justification

### CSS
- Use CSS modules or styled-components
- Avoid global styles when possible

## Testing

All changes must pass:
1. Backend build
2. Frontend build
3. Unit tests (Vitest)
4. Pre-push hook (runs automatically)

## Questions?

Open an issue or check existing documentation in `docs/`.
