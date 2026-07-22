# Ingredients API — Design

## Context

The Ingredients page (`_pages/IngredientsPage.tsx`, route `/ingredients`) is fully built on the frontend: filter tabs, ingredient cards, a detail modal, and a `useIngredients` hook (`hooks/useIngredients.ts`) that calls `GET /api/ingredients?type=<type>`. That endpoint does not exist anywhere in the codebase, and there is no `ingredients` table in Supabase (confirmed via direct query — `PGRST205: Could not find the table 'public.ingredients'`). This surfaced during a live site walkthrough: the page renders its header and filter tabs, then shows "Unable to load ingredients — Failed to fetch ingredients (404)" where the ingredient cards should be.

This spec covers building the missing backend and matching admin tooling, following the same patterns already established for the analogous `concerns` feature (table shape, admin route auth, admin form conventions).

## Goals

- Unblock the live `/ingredients` page by implementing `GET /api/ingredients`.
- Let non-technical staff manage ingredient content themselves via `/admin`, consistent with how Concerns/Products/Blog already work — no developer needed for routine content changes.
- Ship with an empty table; the frontend's existing empty-state message covers that until real content is added via the new admin UI.

## Non-goals

- No image field on ingredients. Neither the ingredient card nor the detail modal in `_pages/IngredientsPage.tsx` renders an image — adding one would be unused surface area.
- No slug-based detail route. Ingredients are viewed via an in-page modal, not a dedicated URL per ingredient (unlike concerns/products/blog), so no `slug` column or `[slug]` route is needed.
- No seed content. Table ships empty by design (confirmed with user) — real ingredients get added through the new admin UI after launch.

## Data model

New `ingredients` table in Supabase, modeled on the existing `concerns` table's conventions:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | default `gen_random_uuid()` |
| `name` | text, not null | |
| `origin` | text, not null | e.g. "West Africa" |
| `type` | text, not null | CHECK constraint restricting to the 5 values already defined in `types/ingredient.ts`: `traditional_african`, `natural`, `organic`, `herbal`, `vegan` |
| `description` | text, not null | short description, shown on the card |
| `detail` | text, nullable | long-form detail, shown in the modal's "About this ingredient" section |
| `benefits` | text[], nullable, default `'{}'` | list of short benefit strings, shown as a bulleted list in the modal |
| `sort_order` | int, not null, default 0 | controls display order, matches `concerns.sort_order` |
| `created_at` | timestamptz, default `now()` | |
| `updated_at` | timestamptz, default `now()` | |

**Migration execution:** `.env.local` has a direct `DATABASE_URL` (Postgres connection string) for this Supabase project. The implementation plan will run the `CREATE TABLE` directly against that connection rather than handing off a SQL script — this will be confirmed with the user immediately before executing, since schema changes are hard to reverse.

## API routes

**Public:**
- `GET /api/ingredients` — no auth. Optional `?type=<one of the 5 enum values>` query param filters by type; omitted or `all` returns everything, ordered by `sort_order`. Response shape matches `IngredientsApiResponse` in `types/ingredient.ts` exactly:
  ```
  { success: true, data: { ingredients: Ingredient[] } }
  ```
  where each `Ingredient` is `{ id, name, origin, type, description, detail?, benefits? }` (camelCase, mapped from the snake_case DB columns).

**Admin** (all gated by the same per-file `requireAdmin(request)` pattern used by all 17 existing `app/api/admin/*` routes — verified consistent across every GET/POST/PUT/PATCH/DELETE handler in that tree during the earlier review):
- `GET /api/admin/ingredients` — list, for the admin table view.
- `POST /api/admin/ingredients` — create.
- `GET /api/admin/ingredients/[id]` — fetch one, for the edit form.
- `PUT /api/admin/ingredients/[id]` — update.
- `DELETE /api/admin/ingredients/[id]` — delete.

## Admin UI

- Add an "Ingredients" entry to the admin sidebar (`NAV` array in `app/admin/layout.tsx`) and its corresponding page-title map, alongside the existing Products/Concerns/Blog/etc. entries.
- `app/admin/ingredients/page.tsx` → thin wrapper re-exporting a new `_pages/admin/AdminIngredients.tsx`, mirroring the existing `AdminConcerns.tsx` list page: table of name / type / origin / sort order, with edit and delete actions.
- `app/admin/ingredients/new/page.tsx` and `app/admin/ingredients/[id]/page.tsx` → both wrap a single shared `_pages/admin/AdminIngredientForm.tsx`, mirroring `AdminConcernForm.tsx`'s create/edit-in-one-component structure:
  - Text inputs: name, origin
  - `<select>`: type (the 5 fixed enum values)
  - Textareas: description, detail
  - Textarea for `benefits`, one benefit per line — reusing the exact split-on-newline/filter-blank pattern `AdminConcernForm.tsx` already uses for its `whyItWorks` array field, rather than building a new repeatable-field widget.

## Error handling

- Public `GET /api/ingredients`: malformed `?type=` value falls back to unfiltered (matches the frontend's own `activeFilter ?? 'all'` fallback behavior — never a hard error for a bad filter value).
- Admin routes: same 400/403/404/500 conventions already used by the other admin routes (missing/invalid auth → 403 via `requireAdmin`; not found → 404; validation failure → 400).

## Testing

- Manual verification via the live dev server (same approach used throughout this review session): confirm `/ingredients` loads real data end-to-end, confirm the admin list/create/edit/delete flow works, confirm the public API correctly filters by `type`.
