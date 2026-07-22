# Ingredients API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the missing `/api/ingredients` backend and matching admin CRUD tooling so the already-built `/ingredients` frontend page works with real, staff-editable data.

**Architecture:** One new `ingredients` table in the existing Supabase project, one public read-only API route, a mirrored pair of admin CRUD routes gated by the existing per-file `requireAdmin` pattern, and admin UI components that closely mirror the existing Concerns admin feature (same list/form structure, same `apiFetch` client helper).

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (Postgres + `@supabase/supabase-js`), Tailwind CSS (admin UI), `psql` for the one-off schema migration.

## Global Constraints

- Public route path: `GET /api/ingredients` (optional `?type=` query param), response shape `{ success: true, data: { ingredients: Ingredient[] } }` exactly matching `types/ingredient.ts`.
- Valid `type` enum values (from `types/ingredient.ts`): `traditional_african`, `natural`, `organic`, `herbal`, `vegan`.
- No image field, no slug column, no detail route — ingredients are viewed via an in-page modal on `/ingredients`, not a dedicated URL.
- All admin routes must use the same per-file `requireAdmin(request)` auth check already used by every route under `app/api/admin/*` (verified consistent across all 17 existing admin routes during the design review).
- Table ships empty. No seed data.
- This project has no test framework (no jest/vitest/playwright, confirmed via `package.json` and a repo-wide search). Verification steps in this plan use `curl` and manual browser checks against the local dev server — the same approach already used to verify every other fix in this review session — not a fabricated test suite.

---

### Task 1: Create the `ingredients` table

**Files:**
- None created/modified in the repo — this is a database schema change executed directly against Supabase via `psql`.

**Interfaces:**
- Produces: a Postgres table `public.ingredients` with columns `id, name, origin, type, description, detail, benefits, sort_order, created_at, updated_at`, which Task 2 and Task 3 depend on.

- [ ] **Step 1: Confirm with the user before running any schema change**

This step is a checkpoint, not a command: before running Step 2, tell the user exactly what SQL you are about to run against their live Supabase project (the CREATE TABLE statement below) and wait for explicit go-ahead. Schema changes are hard to reverse — do not skip this confirmation even though the design was already approved in the spec.

- [ ] **Step 2: Run the migration**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
source <(grep -E '^DATABASE_URL=' .env.local)
psql "$DATABASE_URL" -c "
CREATE TABLE ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  origin text NOT NULL,
  type text NOT NULL CHECK (type IN ('traditional_african', 'natural', 'organic', 'herbal', 'vegan')),
  description text NOT NULL,
  detail text,
  benefits text[] DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
"
```

Expected output: `CREATE TABLE`

- [ ] **Step 3: Verify the table exists and is empty**

```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM ingredients;"
```

Expected output: a single row, `count` = `0`.

- [ ] **Step 4: Verify the type CHECK constraint rejects invalid values**

```bash
psql "$DATABASE_URL" -c "INSERT INTO ingredients (name, origin, type, description) VALUES ('Test', 'Test', 'not_a_real_type', 'Test');"
```

Expected output: an error containing `violates check constraint "ingredients_type_check"`. This confirms the constraint is active. No row should be inserted — this command is expected to fail, which is the desired outcome.

No commit for this task — it's a database change, not a code change.

---

### Task 2: Public `GET /api/ingredients` route

**Files:**
- Create: `app/api/ingredients/route.ts`

**Interfaces:**
- Consumes: `ingredients` table from Task 1; `supabase` client from `@/lib/supabase-server` (already exists, used identically by every other API route in this codebase).
- Produces: `GET /api/ingredients` returning `{ success: true, data: { ingredients: Array<{ id, name, origin, type, description, detail, benefits, sortOrder }> } }`. `hooks/useIngredients.ts` (already exists, unmodified) consumes this directly.

- [ ] **Step 1: Write the route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

const VALID_TYPES = ['traditional_african', 'natural', 'organic', 'herbal', 'vegan'];

function toDTO(i: any) {
  return {
    id: i.id,
    name: i.name,
    origin: i.origin,
    type: i.type,
    description: i.description ?? '',
    detail: i.detail ?? null,
    benefits: i.benefits ?? [],
    sortOrder: i.sort_order ?? 0,
  };
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');

  let query = supabase
    .from('ingredients')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (type && VALID_TYPES.includes(type)) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { ingredients: (data ?? []).map(toDTO) } });
}
```

- [ ] **Step 2: Start the dev server if it isn't already running**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/ --max-time 5
```

If this doesn't print `200`, start it: `npm run dev &` (from `/home/urinrin/Documents/projects/agrocosmetics/site/app`) and wait a few seconds before continuing.

- [ ] **Step 3: Verify the empty-table response**

```bash
curl -s http://localhost:3000/api/ingredients
```

Expected output: `{"success":true,"data":{"ingredients":[]}}`

- [ ] **Step 4: Verify the `type` filter doesn't error on an empty table**

```bash
curl -s "http://localhost:3000/api/ingredients?type=natural"
```

Expected output: `{"success":true,"data":{"ingredients":[]}}`

- [ ] **Step 5: Verify an invalid `type` value is ignored rather than erroring**

```bash
curl -s "http://localhost:3000/api/ingredients?type=bogus"
```

Expected output: `{"success":true,"data":{"ingredients":[]}}` (falls back to unfiltered, per the design spec's error-handling section — never a hard error for a bad filter value).

- [ ] **Step 6: Load the live page and confirm the empty state (not an error)**

Navigate to `http://localhost:3000/ingredients` in a browser and confirm the page shows its built-in "no ingredients" empty state rather than the "Unable to load ingredients — Failed to fetch ingredients (404)" error seen before this task.

- [ ] **Step 7: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add app/api/ingredients/route.ts
git commit -m "$(cat <<'EOF'
Add public GET /api/ingredients endpoint

Unblocks the existing /ingredients page, which had no backing API.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Admin CRUD API routes

**Files:**
- Create: `app/api/admin/ingredients/route.ts`
- Create: `app/api/admin/ingredients/[id]/route.ts`

**Interfaces:**
- Consumes: `ingredients` table from Task 1; `supabase` client from `@/lib/supabase-server`.
- Produces:
  - `GET /api/admin/ingredients` → `{ success: true, data: { ingredients: Array<AdminIngredientDTO> } }`
  - `POST /api/admin/ingredients` → `{ success: true, data: { ingredient: AdminIngredientDTO } }` (201)
  - `PUT /api/admin/ingredients/:id` → `{ success: true, data: { ingredient: AdminIngredientDTO } }`
  - `DELETE /api/admin/ingredients/:id` → `{ success: true }`
  - where `AdminIngredientDTO` is `{ id, name, origin, type, description, detail, benefits, sortOrder, createdAt, updatedAt }`.
- Task 4/5's admin UI components call these four endpoints by exact path and method shown above.

- [ ] **Step 1: Write the list + create route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

const VALID_TYPES = ['traditional_african', 'natural', 'organic', 'herbal', 'vegan'];

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

function toDTO(i: any) {
  return {
    id: i.id,
    name: i.name,
    origin: i.origin,
    type: i.type,
    description: i.description ?? '',
    detail: i.detail ?? null,
    benefits: i.benefits ?? [],
    sortOrder: i.sort_order ?? 0,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  };
}

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data: { ingredients: (data ?? []).map(toDTO) } });
}

export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { name, origin, type, description, detail, benefits, sortOrder } = await request.json();
  if (!name) return NextResponse.json({ success: false, message: 'name is required' }, { status: 400 });
  if (!origin) return NextResponse.json({ success: false, message: 'origin is required' }, { status: 400 });
  if (!description) return NextResponse.json({ success: false, message: 'description is required' }, { status: 400 });
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ success: false, message: `type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ingredients')
    .insert({
      name,
      origin,
      type,
      description,
      detail: detail || null,
      benefits: Array.isArray(benefits) ? benefits : [],
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { ingredient: toDTO(data) } }, { status: 201 });
}
```

- [ ] **Step 2: Write the update + delete route**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

const VALID_TYPES = ['traditional_african', 'natural', 'organic', 'herbal', 'vegan'];

async function requireAdmin(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', user.id).single();
  return data ? user : null;
}

function toDTO(i: any) {
  return {
    id: i.id,
    name: i.name,
    origin: i.origin,
    type: i.type,
    description: i.description ?? '',
    detail: i.detail ?? null,
    benefits: i.benefits ?? [],
    sortOrder: i.sort_order ?? 0,
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  };
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });

  const { name, origin, type, description, detail, benefits, sortOrder } = await request.json();
  if (!name) return NextResponse.json({ success: false, message: 'name is required' }, { status: 400 });
  if (!origin) return NextResponse.json({ success: false, message: 'origin is required' }, { status: 400 });
  if (!description) return NextResponse.json({ success: false, message: 'description is required' }, { status: 400 });
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ success: false, message: `type must be one of: ${VALID_TYPES.join(', ')}` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ingredients')
    .update({
      name,
      origin,
      type,
      description,
      detail: detail || null,
      benefits: Array.isArray(benefits) ? benefits : [],
      sort_order: sortOrder ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data: { ingredient: toDTO(data) } });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin(request);
  if (!user) return NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 });
  const { error } = await supabase.from('ingredients').delete().eq('id', params.id);
  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Verify admin routes reject unauthenticated requests**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/api/admin/ingredients
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3000/api/admin/ingredients -H 'Content-Type: application/json' -d '{}'
```

Expected output: `403` for both (no `Authorization` header supplied).

- [ ] **Step 4: Verify type validation on create rejects a bad payload even with no auth complexity involved yet**

This is checked implicitly by Step 3 already returning 403 before reaching validation — full validation behavior gets exercised end-to-end in Task 5's manual admin-UI walkthrough, once there's a way to authenticate as an admin through the browser.

- [ ] **Step 5: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add app/api/admin/ingredients
git commit -m "$(cat <<'EOF'
Add admin CRUD API routes for ingredients

Mirrors the existing /api/admin/concerns routes' auth pattern
(per-route requireAdmin check) and DTO shape conventions.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Admin nav entry + ingredients list page

**Files:**
- Modify: `app/admin/layout.tsx` (add nav entry + page title entries)
- Create: `_pages/admin/AdminIngredients.tsx`
- Create: `app/admin/ingredients/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/ingredients` and `DELETE /api/admin/ingredients/:id` from Task 3; `apiFetch` from `@/lib/apiFetch` (already exists).
- Produces: the `/admin/ingredients` page, linked from the sidebar. Task 5's "Add Ingredient" / "Edit" links point to `/admin/ingredients/new` and `/admin/ingredients/:id`, which this task's list page also links to.

- [ ] **Step 1: Add the nav entry**

In `app/admin/layout.tsx`, find the `Concerns` entry in the `NAV` array (it ends right before the `Content` entry). Insert a new entry immediately after it:

```typescript
  {
    label: 'Ingredients', to: '/admin/ingredients',
    icon: (
      <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
```

- [ ] **Step 2: Add page titles**

In the same file's `TITLES` map, find the line `'/admin/concerns/new': 'New Concern',` and add two lines immediately after it:

```typescript
  '/admin/ingredients': 'Ingredients',
  '/admin/ingredients/new': 'New Ingredient',
```

- [ ] **Step 3: Write the list page component**

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_URL = '';

const TYPE_LABELS: Record<string, string> = {
  traditional_african: 'Traditional African',
  natural: 'Natural',
  organic: 'Organic',
  herbal: 'Herbal',
  vegan: 'Vegan',
};

interface Ingredient {
  id: string;
  name: string;
  origin: string;
  type: string;
  sortOrder: number;
}

const AdminIngredients: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const load = () => {
    setLoading(true);
    apiFetch(`${API_URL}/api/admin/ingredients`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        setIngredients(json.data.ingredients);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/ingredients/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setIngredients((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400 animate-pulse">Loading ingredients…</div>;
  if (error) return <div className="p-8 text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ingredients</h2>
          <p className="text-sm text-gray-500 mt-0.5">{ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => router.push('/admin/ingredients/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Add Ingredient
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          No ingredients yet.{' '}
          <button onClick={() => router.push('/admin/ingredients/new')} className="text-primary hover:underline">
            Add your first ingredient
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Origin</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Order</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-medium text-gray-900">{ingredient.name}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {TYPE_LABELS[ingredient.type] ?? ingredient.type}
                    </code>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell text-gray-500">{ingredient.origin}</td>
                  <td className="px-5 py-4 text-center text-gray-500">{ingredient.sortOrder}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/ingredients/${ingredient.id}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(ingredient.id, ingredient.name)}
                        className="text-xs font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminIngredients;
```

- [ ] **Step 4: Write the page wrapper**

```tsx
'use client';
import AdminIngredients from '@/_pages/admin/AdminIngredients';
export default AdminIngredients;
```

Save this as `app/admin/ingredients/page.tsx`.

- [ ] **Step 5: Verify the nav entry and empty list render**

In a browser, log into `/admin/login` as an existing admin user, then confirm:
1. An "Ingredients" entry appears in the sidebar between "Concerns" and "Content".
2. Clicking it navigates to `/admin/ingredients` and shows "Ingredients" as the page title, "0 ingredients", and the "No ingredients yet. Add your first ingredient" empty state.
3. Clicking "+ Add Ingredient" or "Add your first ingredient" navigates to `/admin/ingredients/new` (this will 404 until Task 5 is done — that's expected at this point).

- [ ] **Step 6: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add app/admin/layout.tsx _pages/admin/AdminIngredients.tsx app/admin/ingredients/page.tsx
git commit -m "$(cat <<'EOF'
Add Ingredients admin nav entry and list page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Admin create/edit form

**Files:**
- Create: `_pages/admin/AdminIngredientForm.tsx`
- Create: `app/admin/ingredients/new/page.tsx`
- Create: `app/admin/ingredients/[id]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/ingredients` (to look up the record being edited, by id, from the list response — the same pattern `AdminConcernForm.tsx` uses, since the `[id]` route from Task 3 intentionally has no GET handler, mirroring `concerns/[id]/route.ts`), `POST /api/admin/ingredients`, `PUT /api/admin/ingredients/:id`, `DELETE /api/admin/ingredients/:id` from Task 3.
- Produces: working `/admin/ingredients/new` and `/admin/ingredients/:id` pages, completing the admin CRUD loop that Task 4's list page links to.

- [ ] **Step 1: Write the form component**

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/apiFetch';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const API_URL = '';

const TYPE_OPTIONS = [
  { value: 'traditional_african', label: 'Traditional African' },
  { value: 'natural', label: 'Natural' },
  { value: 'organic', label: 'Organic' },
  { value: 'herbal', label: 'Herbal' },
  { value: 'vegan', label: 'Vegan' },
];

interface FormData {
  name: string;
  origin: string;
  type: string;
  description: string;
  detail: string;
  benefits: string;
  sortOrder: string;
}

const INITIAL: FormData = {
  name: '',
  origin: '',
  type: 'natural',
  description: '',
  detail: '',
  benefits: '',
  sortOrder: '0',
};

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30';

const AdminIngredientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`${API_URL}/api/admin/ingredients`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) throw new Error(json.message);
        const i = json.data.ingredients.find((x: any) => x.id === id);
        if (!i) throw new Error('Ingredient not found');
        setForm({
          name: i.name,
          origin: i.origin,
          type: i.type,
          description: i.description ?? '',
          detail: i.detail ?? '',
          benefits: (i.benefits ?? []).join('\n'),
          sortOrder: String(i.sortOrder ?? 0),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const benefits = form.benefits
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const body = {
        name: form.name,
        origin: form.origin,
        type: form.type,
        description: form.description,
        detail: form.detail || null,
        benefits,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
      };

      const url = isEdit ? `${API_URL}/api/admin/ingredients/${id}` : `${API_URL}/api/admin/ingredients`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/ingredients');
    } catch (err: any) {
      setError(err.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    try {
      const res = await apiFetch(`${API_URL}/api/admin/ingredients/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      router.push('/admin/ingredients');
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-sm text-gray-400">Loading…</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <Link href="/admin/ingredients" className="text-xs text-gray-500 hover:text-primary flex items-center gap-1">
        ← Back to Ingredients
      </Link>

      <div>
        <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Ingredient' : 'New Ingredient'}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {isEdit ? `Editing: ${form.name}` : 'Add a new ingredient to the transparency library'}
        </p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="name">
              Name <span className="text-red-500">*</span>
            </label>
            <input id="name" type="text" value={form.name} onChange={set('name')} required
              placeholder="e.g. Shea Butter" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="sortOrder">Display Order</label>
            <input id="sortOrder" type="number" min="0" value={form.sortOrder} onChange={set('sortOrder')} className={inputCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="origin">
              Origin <span className="text-red-500">*</span>
            </label>
            <input id="origin" type="text" value={form.origin} onChange={set('origin')} required
              placeholder="e.g. West Africa" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="type">
              Type <span className="text-red-500">*</span>
            </label>
            <select id="type" value={form.type} onChange={set('type')} required className={inputCls}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Descriptions</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="description">
            Short Description <span className="text-red-500">*</span> <span className="text-gray-400 font-normal">(shown on the ingredient card)</span>
          </label>
          <textarea id="description" value={form.description} onChange={set('description')} rows={2} required
            placeholder="A rich, deeply moisturising butter that soothes and repairs dry skin."
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="detail">
            Detail <span className="text-gray-400 font-normal">(shown in the ingredient detail modal, optional)</span>
          </label>
          <textarea id="detail" value={form.detail} onChange={set('detail')} rows={4}
            placeholder="Cold-pressed from the nuts of the shea tree, traditionally used across West Africa for centuries..."
            className={`${inputCls} resize-none`} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Key Benefits</h3>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1.5" htmlFor="benefits">
            Bullet points <span className="text-gray-400 font-normal">(one per line, optional)</span>
          </label>
          <textarea id="benefits" value={form.benefits} onChange={set('benefits')} rows={5}
            placeholder={"Deeply moisturises and repairs the skin barrier\nRich in vitamins A and E\nSoothes irritation and inflammation"}
            className={`${inputCls} resize-y font-mono text-xs`} />
        </div>
      </div>

      <div className="flex items-center gap-3 pb-8">
        <button type="submit" disabled={saving}
          className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Ingredient'}
        </button>
        <Link href="/admin/ingredients"
          className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </Link>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="ml-auto text-sm text-red-500 hover:text-red-700 font-medium">
            Delete Ingredient
          </button>
        )}
      </div>
    </form>
  );
};

export default AdminIngredientForm;
```

- [ ] **Step 2: Write the two page wrappers**

`app/admin/ingredients/new/page.tsx`:

```tsx
'use client';
import AdminIngredientForm from '@/_pages/admin/AdminIngredientForm';
export default AdminIngredientForm;
```

`app/admin/ingredients/[id]/page.tsx`:

```tsx
'use client';
import AdminIngredientForm from '@/_pages/admin/AdminIngredientForm';
export default AdminIngredientForm;
```

- [ ] **Step 3: Verify the full create → view → edit → delete loop in the browser**

While logged in as admin:
1. Go to `/admin/ingredients/new`. Fill in Name = `Shea Butter`, Origin = `West Africa`, Type = `Traditional African`, Short Description = `A rich, deeply moisturising butter.`, Detail = `Cold-pressed from the nuts of the shea tree.`, Benefits = two lines (`Deeply moisturises\nRich in vitamins A and E`). Click "Create Ingredient".
2. Confirm it redirects to `/admin/ingredients` and the new row appears in the table with the correct Name/Type/Origin.
3. Click "Edit" on that row. Confirm every field you entered is pre-filled correctly, including both benefit lines.
4. Change the Name to `Shea Butter (Unrefined)` and click "Save Changes". Confirm it redirects back and the table shows the updated name.
5. Click "Edit" again, then "Delete Ingredient", confirm the browser confirm dialog, and confirm the row disappears from the table and the list returns to the "No ingredients yet" empty state.

- [ ] **Step 4: Verify the public page now serves real data end-to-end**

Repeat step 3.1 above to create one ingredient again (so the next check has something to show), then:

```bash
curl -s http://localhost:3000/api/ingredients
```

Expected: `success: true` with one ingredient object containing the fields you entered, in camelCase.

Then load `http://localhost:3000/ingredients` in a browser and confirm the ingredient card renders with the correct name, origin, type badge, and description, and that clicking it opens the modal showing the detail text and both benefit bullet points.

- [ ] **Step 5: Clean up the test ingredient so the table ships empty**

In the admin UI, edit the ingredient you just created and click "Delete Ingredient". Confirm with:

```bash
curl -s http://localhost:3000/api/ingredients
```

Expected output: `{"success":true,"data":{"ingredients":[]}}` — the table is empty again, per the approved design (ship empty, real content added by the user later via this admin UI).

- [ ] **Step 6: Commit**

```bash
cd /home/urinrin/Documents/projects/agrocosmetics/site/app
git add _pages/admin/AdminIngredientForm.tsx app/admin/ingredients/new/page.tsx "app/admin/ingredients/[id]/page.tsx"
git commit -m "$(cat <<'EOF'
Add Ingredients admin create/edit form

Completes the admin CRUD loop for ingredients: create, list, edit,
and delete are all now working end-to-end, and the public
/ingredients page renders real data.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
