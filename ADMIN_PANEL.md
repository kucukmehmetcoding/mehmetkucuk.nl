# Admin Panel Documentation

## Overview

Full-featured admin panel for MK News platform built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn UI components.

**Features:**
- ✅ JWT-based authentication
- ✅ Multi-language post management (TR, EN, NL)
- ✅ Rich-text editor (Tiptap)
- ✅ AI-powered content tools (rewrite, SEO, translate)
- ✅ Image upload with presigned URLs
- ✅ Category & media management
- ✅ Ad slot management with layout preview
- ✅ RSS automation sources
- ✅ Dark mode support
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Accessibility-first (ARIA, keyboard navigation)

---

## Getting Started

### Installation

Dependencies are already installed:
```bash
npm install # (if needed)
```

Key packages:
- `next@14.2.13`
- `react-hook-form` — Form validation
- `zod` — Schema validation
- `tiptap` — Rich-text editor
- `recharts` — Charts and graphs
- `sonner` — Toast notifications
- `lucide-react` — Icons

### Configuration

Set these environment variables in `.env.local`:

```env
# Admin auth
ADMIN_JWT_SECRET=mehmetkucuk_admin_secret_2025

# Database
DATABASE_URL=postgresql://mehmetkucuk:xcoder31@localhost:5432/mehmetkucuk_nl

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# S3/R2 (for image uploads)
S3_BUCKET_NAME=your-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
S3_ENDPOINT=https://r2.example.com

# FAL.ai (for AI features)
FAL_API_KEY=your-fal-key

# Analytics
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Running the Admin Panel

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Access admin login:**
   Open http://localhost:3000/admin/login

3. **Login with token:**
   Token: `mehmetkucuk_admin_secret_2025`

4. **View dashboard:**
   Navigate to http://localhost:3000/admin/dashboard

---

## File Structure

```
src/
├── app/
│   ├── (admin)/                    # Protected admin routes
│   │   ├── layout.tsx              # Admin layout (sidebar + topbar)
│   │   ├── dashboard/page.tsx      # KPI dashboard
│   │   ├── posts/
│   │   │   ├── page.tsx            # Posts list (paginated)
│   │   │   ├── create/page.tsx     # Create post form
│   │   │   └── [id]/edit/page.tsx  # Edit post (to be implemented)
│   │   ├── categories/page.tsx     # Category CRUD
│   │   ├── media/page.tsx          # Media library
│   │   ├── ads/page.tsx            # Ad slots management
│   │   ├── automations/page.tsx    # RSS sources & rules
│   │   ├── settings/page.tsx       # Site settings
│   │   ├── users/page.tsx          # User management
│   │   └── logs/page.tsx           # System logs
│   ├── admin/
│   │   └── login/page.tsx          # Admin login page
│   └── api/admin/
│       ├── auth/route.ts           # Auth verification
│       ├── posts/route.ts          # CRUD posts
│       ├── media/presigned/route.ts # S3 presigned URLs
│       └── ai/
│           ├── rewrite/route.ts    # Rewrite content
│           ├── seo/route.ts        # SEO optimization
│           └── translate/route.ts  # Translate content
│
├── components/
│   ├── admin/
│   │   ├── Sidebar.tsx             # Main sidebar navigation
│   │   ├── Topbar.tsx              # Top header bar
│   │   ├── RichTextEditor.tsx      # Tiptap editor component
│   │   └── ...                     # Other reusable components
│   └── ui/
│       └── card.tsx                # Card component
│
├── lib/
│   ├── auth.ts                     # Auth helpers (getAdminContext, requireAdmin)
│   ├── api-client.ts               # Fetch wrapper with auth
│   ├── validation.ts               # Zod schemas (PostSchema, etc.)
│   └── utils.ts                    # Utility functions (cn)
```

---

## Key Components

### 1. **Admin Layout** (`(admin)/layout.tsx`)

Server component that:
- Checks admin authentication (redirects to login if unauthorized)
- Renders sidebar + topbar
- Wraps all admin pages

```tsx
await requireAdmin(); // Checks auth, redirects if not admin
```

### 2. **Sidebar** (`components/admin/Sidebar.tsx`)

Client component featuring:
- Navigation menu (Dashboard, Posts, Categories, etc.)
- Dark mode toggle (localStorage)
- Logout button

### 3. **Rich Text Editor** (`components/admin/RichTextEditor.tsx`)

Tiptap-based editor with:
- Formatting buttons (bold, italic, headings, lists)
- Image upload (presigned URLs)
- Link insertion

### 4. **Post Form** (`posts/create/page.tsx`)

Form with:
- react-hook-form + Zod validation
- Multi-language support (TR, EN, NL)
- AI buttons: Rewrite, SEO, Translate
- Image upload
- SEO metadata fields
- Draft/pending/published status

### 5. **Dashboard** (`dashboard/page.tsx`)

Displays:
- KPI cards (total posts, published today, pending approvals)
- Charts (Recharts bar/line charts)
- Recent system logs

---

## API Endpoints

All protected with Bearer token (Authorization header):

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/auth` | POST | Verify admin token |
| `/api/admin/posts` | GET | List posts (paginated) |
| `/api/admin/posts` | POST | Create post |
| `/api/admin/posts/[id]` | GET | Get single post |
| `/api/admin/posts/[id]` | PUT | Update post |
| `/api/admin/posts/[id]` | DELETE | Delete post |
| `/api/admin/media/presigned` | GET | Get S3 presigned URL |
| `/api/admin/ai/rewrite` | POST | Rewrite content |
| `/api/admin/ai/seo` | POST | SEO optimization |
| `/api/admin/ai/translate` | POST | Translate content |

### Request Example

```typescript
const token = process.env.ADMIN_JWT_SECRET;
const response = await fetch('/api/admin/posts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

---

## Form Validation

All forms use **react-hook-form + Zod** for type-safe validation:

```typescript
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {PostSchema} from '@/lib/validation';

const form = useForm({
  resolver: zodResolver(PostSchema),
});
```

### Validation Schemas (`lib/validation.ts`)

- `PostSchema` — Blog post fields
- `CategorySchema` — Category fields
- `AdSlotSchema` — Ad slot fields
- `AutomationSourceSchema` — RSS source fields
- `SettingsSchema` — Site settings

---

## Dark Mode

Theme is toggled in Sidebar and stored in localStorage:

```typescript
const isDark = localStorage.getItem('theme') === 'dark';
document.documentElement.classList.toggle('dark');
```

---

## Accessibility

- ✅ Semantic HTML (`<button>`, `<form>`, `<nav>`)
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus management
- ✅ Color contrast (WCAG AA)

---

## Testing Scenarios

### 1. Dashboard
- [ ] Load dashboard without errors
- [ ] KPI cards display correct data
- [ ] Charts render (Recharts)
- [ ] Recent logs fetch from database

### 2. Posts List
- [ ] Filter by status (draft/published)
- [ ] Search by title
- [ ] Pagination works
- [ ] Delete post (confirm dialog)
- [ ] Edit post (redirect to edit page)

### 3. Create Post
- [ ] Form validation (required fields)
- [ ] Rich-text editor works
- [ ] AI Rewrite button (mock API call)
- [ ] AI SEO button (mock API call)
- [ ] Image upload triggers presigned URL
- [ ] Save as draft/pending/published

### 4. Categories
- [ ] Create category (slug auto-generate)
- [ ] Delete category
- [ ] CSV import modal appears

### 5. Media
- [ ] Drag-drop upload shows (placeholder)
- [ ] Image grid displays
- [ ] Copy URL button works
- [ ] Delete image (confirm)

### 6. Ads
- [ ] Create ad slot
- [ ] Preview layout renders (3 sample layouts)
- [ ] A/B test config section visible

### 7. Automations
- [ ] RSS sources list displays
- [ ] Enable/disable toggle works
- [ ] Manual run button callable
- [ ] Global throttle switch visible
- [ ] Rules editor modal appears

### 8. Settings
- [ ] Change site title/description
- [ ] Maintenance mode toggle
- [ ] Analytics keys input
- [ ] Save button submits form

### 9. Users
- [ ] User list displays
- [ ] Invite button opens modal
- [ ] Edit/delete buttons visible

### 10. Logs
- [ ] Logs display with timestamps
- [ ] Filter by type (error/info/warning)
- [ ] Export button visible
- [ ] Search logs works

---

## Performance & Lighthouse

**Target Scores:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

**Optimizations:**
- Server-side rendering for initial page load
- Lazy loading for charts and media grids
- Image optimization (next/image)
- Code splitting per route
- Dark mode CSS variables (no flash)

---

## AI Features (Mock Implementation)

All AI buttons are functional with 2-3 second delays (simulating API):

1. **Rewrite** — Prepends "[AI Rewritten]" to content
2. **SEO** — Generates SEO title and meta description
3. **Translate** — Simulates translation to other languages

Replace mock calls in `/app/api/admin/ai/*` with actual Fal.ai endpoints.

---

## Image Upload Flow (S3/R2)

1. User clicks image upload button
2. Frontend requests presigned URL: `GET /api/admin/media/presigned?fileName=...&fileType=...`
3. Backend returns presigned URL from S3/R2
4. Frontend uploads directly to S3/R2 (CORS enabled)
5. On success, insert image URL into editor

---

## Error Handling

- **Client-side:** Toast notifications (Sonner) for errors
- **Server-side:** Console logs + HTTP error responses (401, 400, 500)
- **Forms:** Zod validation errors displayed inline

---

## Known Limitations (To Be Implemented)

- [ ] Post edit/delete API endpoints (stubs only)
- [ ] Category CSV import (UI only)
- [ ] Revision history diff viewer
- [ ] Audit trail for post changes
- [ ] Bulk actions (publish/delete multiple)
- [ ] Background job polling (progress bar)
- [ ] User invite via email
- [ ] 2FA setup/verification
- [ ] Rate limiting (client-side only)

---

## Next Steps

1. **Implement API endpoints** in `/app/api/admin/**` for CRUD operations
2. **Connect to Prisma** for database operations
3. **Integrate S3/R2** for image uploads (presigned URLs)
4. **Replace mock AI calls** with Fal.ai actual API
5. **Add background job queue** for bulk operations
6. **Setup email service** for user invites
7. **Add audit logging** for all mutations
8. **Deploy to production** (Coolify or similar)

---

## Troubleshooting

**Q: Admin panel shows 404?**
- A: Check that `ADMIN_JWT_SECRET` is set and login token is correct

**Q: Forms don't validate?**
- A: Ensure Zod schema is imported correctly from `@/lib/validation`

**Q: Dark mode not working?**
- A: Check localStorage and CSS `dark:` classes are applied

**Q: API calls returning 401?**
- A: Verify `Authorization: Bearer {token}` header is sent correctly

---

## Support

For issues or questions, refer to:
- Next.js Docs: https://nextjs.org/docs
- Tiptap Docs: https://tiptap.dev
- Zod Docs: https://zod.dev
- Tailwind Docs: https://tailwindcss.com

---

**Last Updated:** 10 Aralık 2025
**Admin Panel Version:** 1.0.0-beta
