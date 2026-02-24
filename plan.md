Inventory Management System - Implementation Plan                                                                                                  │
│                                                                                                                                                    │
│ Context                                                                                                                                            │
│                                                                                                                                                    │
│ Building a full-stack Inventory Management System for a job interview with a 1-hour completion constraint. The system needs CRUD operations,       │
│ status tracking, AI-powered smart search, role-based access control, and live deployment. This plan optimizes for speed while delivering a         │
│ feature-complete, production-ready application.                                                                                                    │
│                                                                                                                                                    │
│ Technology Stack                                                                                                                                   │
│                                                                                                                                                    │
│ Frontend & Backend:                                                                                                                                │
│ - Next.js 14+ (App Router) - Full-stack React framework with built-in API routes                                                                   │
│ - TypeScript - Type safety and better developer experience                                                                                         │
│ - Tailwind CSS - Rapid UI development with utility classes                                                                                         │
│ - shadcn/ui - Pre-built, accessible components for speed                                                                                           │
│                                                                                                                                                    │
│ Backend Services:                                                                                                                                  │
│ - Supabase - Backend-as-a-Service providing:                                                                                                       │
│   - PostgreSQL database (with real-time subscriptions)                                                                                             │
│   - Built-in authentication (email/password + SSO)                                                                                                 │
│   - Row-level security for RBAC                                                                                                                    │
│   - Auto-generated REST & GraphQL APIs                                                                                                             │
│                                                                                                                                                    │
│ AI Integration:                                                                                                                                    │
│ - Claude API (Anthropic) - Natural language search and intelligent querying                                                                        │
│                                                                                                                                                    │
│ Deployment:                                                                                                                                        │
│ - Vercel - Zero-config Next.js deployment with instant preview URLs                                                                                │
│                                                                                                                                                    │
│ Database Schema                                                                                                                                    │
│                                                                                                                                                    │
│ Tables:                                                                                                                                            │
│                                                                                                                                                    │
│ 1. inventory_items                                                                                                                                 │
│ - id (uuid, primary key)                                                                                                                           │
│ - name (text, required)                                                                                                                            │
│ - description (text)                                                                                                                               │
│ - quantity (integer, required)                                                                                                                     │
│ - category (text, required)                                                                                                                        │
│ - sku (text, unique)                                                                                                                               │
│ - unit_price (decimal)                                                                                                                             │
│ - status (enum: 'in_stock', 'low_stock', 'ordered', 'discontinued')                                                                                │
│ - low_stock_threshold (integer, default: 10)                                                                                                       │
│ - created_at (timestamp)                                                                                                                           │
│ - updated_at (timestamp)                                                                                                                           │
│ - created_by (uuid, foreign key to users)                                                                                                          │
│                                                                                                                                                    │
│ 2. users (Supabase built-in)                                                                                                                       │
│ - Extended with custom fields via user_profiles table                                                                                              │
│                                                                                                                                                    │
│ 3. user_profiles                                                                                                                                   │
│ - id (uuid, primary key, foreign key to auth.users)                                                                                                │
│ - role (enum: 'admin', 'manager', 'viewer')                                                                                                        │
│ - full_name (text)                                                                                                                                 │
│ - created_at (timestamp)                                                                                                                           │
│                                                                                                                                                    │
│ 4. activity_logs (bonus feature for tracking)                                                                                                      │
│ - id (uuid, primary key)                                                                                                                           │
│ - user_id (uuid, foreign key)                                                                                                                      │
│ - action (enum: 'create', 'update', 'delete')                                                                                                      │
│ - item_id (uuid, foreign key to inventory_items)                                                                                                   │
│ - changes (jsonb)                                                                                                                                  │
│ - timestamp (timestamp)                                                                                                                            │
│                                                                                                                                                    │
│ Role-Based Access Control                                                                                                                          │
│                                                                                                                                                    │
│ Roles & Permissions:                                                                                                                               │
│                                                                                                                                                    │
│ ┌─────────┬────────────┬───────────┬────────────┬──────────────┬──────────────┐                                                                    │
│ │  Role   │ View Items │ Add Items │ Edit Items │ Delete Items │ Manage Users │                                                                    │
│ ├─────────┼────────────┼───────────┼────────────┼──────────────┼──────────────┤                                                                    │
│ │ Admin   │ ✅         │ ✅        │ ✅         │ ✅           │ ✅           │                                                                    │
│ ├─────────┼────────────┼───────────┼────────────┼──────────────┼──────────────┤                                                                    │
│ │ Manager │ ✅         │ ✅        │ ✅         │ ❌           │ ❌           │                                                                    │
│ ├─────────┼────────────┼───────────┼────────────┼──────────────┼──────────────┤                                                                    │
│ │ Viewer  │ ✅         │ ❌        │ ❌         │ ❌           │ ❌           │                                                                    │
│ └─────────┴────────────┴───────────┴────────────┴──────────────┴──────────────┘                                                                    │
│                                                                                                                                                    │
│ Implementation via Supabase Row-Level Security (RLS):                                                                                              │
│ - Policies defined in Supabase dashboard                                                                                                           │
│ - Automatic enforcement at database level                                                                                                          │
│ - No backend code needed for basic permissions                                                                                                     │
│                                                                                                                                                    │
│ Core Features Implementation                                                                                                                       │
│                                                                                                                                                    │
│ 1. Inventory CRUD Operations                                                                                                                       │
│                                                                                                                                                    │
│ Files to create:                                                                                                                                   │
│ - app/inventory/page.tsx - Main inventory dashboard with data table                                                                                │
│ - app/inventory/new/page.tsx - Add new inventory item form                                                                                         │
│ - app/inventory/[id]/edit/page.tsx - Edit existing item                                                                                            │
│ - app/api/inventory/route.ts - API endpoints for CRUD operations                                                                                   │
│ - components/inventory-table.tsx - Reusable data table with sorting/filtering                                                                      │
│ - components/inventory-form.tsx - Reusable form component                                                                                          │
│                                                                                                                                                    │
│ Key Functionality:                                                                                                                                 │
│ - Server-side rendering for initial data load (better SEO)                                                                                         │
│ - Client-side state management with React hooks                                                                                                    │
│ - Optimistic updates for better UX                                                                                                                 │
│ - Form validation with react-hook-form + zod                                                                                                       │
│                                                                                                                                                    │
│ 2. Status Tracking                                                                                                                                 │
│                                                                                                                                                    │
│ Auto-status Logic:                                                                                                                                 │
│ - in_stock: quantity > low_stock_threshold                                                                                                         │
│ - low_stock: 0 < quantity <= low_stock_threshold                                                                                                   │
│ - ordered: manually set when order placed                                                                                                          │
│ - discontinued: manually set                                                                                                                       │
│                                                                                                                                                    │
│ Implementation:                                                                                                                                    │
│ - Database trigger to auto-update status based on quantity                                                                                         │
│ - Visual indicators (color-coded badges) in UI                                                                                                     │
│ - Filter by status in main table                                                                                                                   │
│                                                                                                                                                    │
│ 3. AI-Powered Smart Search                                                                                                                         │
│                                                                                                                                                    │
│ Files to create:                                                                                                                                   │
│ - app/api/search/ai/route.ts - Claude API integration endpoint                                                                                     │
│ - components/smart-search.tsx - Search interface with AI toggle                                                                                    │
│ - lib/ai/claude-client.ts - Claude API wrapper                                                                                                     │
│                                                                                                                                                    │
│ Features:                                                                                                                                          │
│ - Natural language queries: "Show me electronics running low" → filters category:electronics AND status:low_stock                                  │
│ - Semantic search: "camera equipment" matches "Canon EOS", "Sony Lens", etc.                                                                       │
│ - Query understanding: AI interprets intent and generates structured filters                                                                       │
│ - Fallback to traditional search if AI unavailable                                                                                                 │
│                                                                                                                                                    │
│ Implementation Flow:                                                                                                                               │
│ 1. User enters natural language query                                                                                                              │
│ 2. Send query to Claude API with inventory schema context                                                                                          │
│ 3. Claude returns structured search parameters (JSON)                                                                                              │
│ 4. Apply filters to Supabase query                                                                                                                 │
│ 5. Display results with explanation of interpretation                                                                                              │
│                                                                                                                                                    │
│ 4. Search & Filtering (Traditional)                                                                                                                │
│                                                                                                                                                    │
│ Standard search capabilities:                                                                                                                      │
│ - Text search across name, description, SKU, category                                                                                              │
│ - Multi-select filters: category, status                                                                                                           │
│ - Range filters: quantity, price                                                                                                                   │
│ - Sort by: name, quantity, created_at, updated_at                                                                                                  │
│ - Debounced search input for performance                                                                                                           │
│                                                                                                                                                    │
│ 5. Authentication & User Management                                                                                                                │
│                                                                                                                                                    │
│ Supabase Auth Setup:                                                                                                                               │
│ - Email/password authentication                                                                                                                    │
│ - Social SSO (Google OAuth) - quick setup in Supabase                                                                                              │
│ - Protected routes via middleware                                                                                                                  │
│ - Session management                                                                                                                               │
│                                                                                                                                                    │
│ Files to create:                                                                                                                                   │
│ - app/auth/login/page.tsx - Login page                                                                                                             │
│ - app/auth/signup/page.tsx - Signup page (admin creates users)                                                                                     │
│ - app/admin/users/page.tsx - User management dashboard (admin only)                                                                                │
│ - middleware.ts - Route protection                                                                                                                 │
│ - lib/auth/supabase-client.ts - Auth helpers                                                                                                       │
│                                                                                                                                                    │
│ Additional Features (Creativity & Polish)                                                                                                          │
│                                                                                                                                                    │
│ 1. Dashboard Analytics                                                                                                                             │
│   - Total inventory value                                                                                                                          │
│   - Low stock alerts count                                                                                                                         │
│   - Recent activity feed                                                                                                                           │
│   - Category distribution chart (using recharts)                                                                                                   │
│ 2. Bulk Operations                                                                                                                                 │
│   - Bulk import via CSV upload                                                                                                                     │
│   - Bulk export to CSV/Excel                                                                                                                       │
│   - Bulk status updates                                                                                                                            │
│ 3. Real-time Updates                                                                                                                               │
│   - Supabase real-time subscriptions                                                                                                               │
│   - Multiple users see updates instantly                                                                                                           │
│   - "User X is viewing this item" presence indicators                                                                                              │
│ 4. Mobile Responsive                                                                                                                               │
│   - Tailwind responsive utilities                                                                                                                  │
│   - Mobile-optimized table (card view on small screens)                                                                                            │
│   - Touch-friendly interactions                                                                                                                    │
│ 5. Audit Trail                                                                                                                                     │
│   - Activity logs table tracks all changes                                                                                                         │
│   - "View History" button on each item                                                                                                             │
│   - Filter logs by user, date, action type                                                                                                         │
│                                                                                                                                                    │
│ Project Structure                                                                                                                                  │
│                                                                                                                                                    │
│ aspire/                                                                                                                                            │
│ ├── app/                                                                                                                                           │
│ │   ├── (auth)/                                                                                                                                    │
│ │   │   ├── login/page.tsx                                                                                                                         │
│ │   │   └── signup/page.tsx                                                                                                                        │
│ │   ├── (dashboard)/                                                                                                                               │
│ │   │   ├── layout.tsx (shared nav)                                                                                                                │
│ │   │   ├── page.tsx (analytics dashboard)                                                                                                         │
│ │   │   ├── inventory/                                                                                                                             │
│ │   │   │   ├── page.tsx                                                                                                                           │
│ │   │   │   ├── new/page.tsx                                                                                                                       │
│ │   │   │   └── [id]/edit/page.tsx                                                                                                                 │
│ │   │   └── admin/                                                                                                                                 │
│ │   │       └── users/page.tsx                                                                                                                     │
│ │   ├── api/                                                                                                                                       │
│ │   │   ├── inventory/route.ts                                                                                                                     │
│ │   │   ├── search/ai/route.ts                                                                                                                     │
│ │   │   └── users/route.ts                                                                                                                         │
│ │   ├── layout.tsx (root)                                                                                                                          │
│ │   └── globals.css                                                                                                                                │
│ ├── components/                                                                                                                                    │
│ │   ├── ui/ (shadcn components)                                                                                                                    │
│ │   ├── inventory-table.tsx                                                                                                                        │
│ │   ├── inventory-form.tsx                                                                                                                         │
│ │   ├── smart-search.tsx                                                                                                                           │
│ │   ├── navbar.tsx                                                                                                                                 │
│ │   └── analytics-cards.tsx                                                                                                                        │
│ ├── lib/                                                                                                                                           │
│ │   ├── supabase/                                                                                                                                  │
│ │   │   ├── client.ts                                                                                                                              │
│ │   │   └── server.ts                                                                                                                              │
│ │   ├── ai/                                                                                                                                        │
│ │   │   └── claude-client.ts                                                                                                                       │
│ │   ├── types/                                                                                                                                     │
│ │   │   └── database.types.ts                                                                                                                      │
│ │   └── utils.ts                                                                                                                                   │
│ ├── supabase/                                                                                                                                      │
│ │   ├── migrations/                                                                                                                                │
│ │   │   └── 001_initial_schema.sql                                                                                                                 │
│ │   └── seed.sql                                                                                                                                   │
│ ├── middleware.ts                                                                                                                                  │
│ ├── next.config.js                                                                                                                                 │
│ ├── tailwind.config.ts                                                                                                                             │
│ ├── tsconfig.json                                                                                                                                  │
│ ├── package.json                                                                                                                                   │
│ └── README.md                                                                                                                                      │
│                                                                                                                                                    │
│ Implementation Timeline (60 minutes)                                                                                                               │
│                                                                                                                                                    │
│ Minutes 0-10: Project Setup                                                                                                                        │
│ - Initialize Next.js project with TypeScript + Tailwind                                                                                            │
│ - Install dependencies (supabase-js, @anthropic-ai/sdk, shadcn/ui, zod, react-hook-form)                                                           │
│ - Create Supabase project                                                                                                                          │
│ - Configure environment variables                                                                                                                  │
│ - Initialize shadcn/ui components                                                                                                                  │
│                                                                                                                                                    │
│ Minutes 10-20: Database & Auth                                                                                                                     │
│ - Create database schema in Supabase                                                                                                               │
│ - Set up RLS policies for RBAC                                                                                                                     │
│ - Create seed data (5-10 sample inventory items, test users)                                                                                       │
│ - Configure Google OAuth (if time permits)                                                                                                         │
│ - Test auth flow                                                                                                                                   │
│                                                                                                                                                    │
│ Minutes 20-35: Core Inventory Features                                                                                                             │
│ - Create inventory table component with sorting/filtering                                                                                          │
│ - Build inventory form (add/edit)                                                                                                                  │
│ - Implement API routes for CRUD operations                                                                                                         │
│ - Set up real-time subscriptions                                                                                                                   │
│ - Test CRUD operations for all roles                                                                                                               │
│                                                                                                                                                    │
│ Minutes 35-45: Search & AI                                                                                                                         │
│ - Build traditional search/filter UI                                                                                                               │
│ - Set up Claude API client                                                                                                                         │
│ - Implement AI search endpoint                                                                                                                     │
│ - Create smart search component                                                                                                                    │
│ - Test AI query interpretation                                                                                                                     │
│                                                                                                                                                    │
│ Minutes 45-55: Polish & Extras                                                                                                                     │
│ - Create analytics dashboard                                                                                                                       │
│ - Add activity logging                                                                                                                             │
│ - Implement bulk operations (CSV import/export)                                                                                                    │
│ - Mobile responsive testing                                                                                                                        │
│ - Error handling & loading states                                                                                                                  │
│ - Add toast notifications for actions                                                                                                              │
│                                                                                                                                                    │
│ Minutes 55-60: Deployment                                                                                                                          │
│ - Push to GitHub                                                                                                                                   │
│ - Deploy to Vercel                                                                                                                                 │
│ - Test deployed app                                                                                                                                │
│ - Verify environment variables in production                                                                                                       │
│ - Create README with setup instructions                                                                                                            │
│                                                                                                                                                    │
│ Critical Dependencies                                                                                                                              │
│                                                                                                                                                    │
│ npm packages to install:                                                                                                                           │
│ {                                                                                                                                                  │
│   "dependencies": {                                                                                                                                │
│     "next": "^14.1.0",                                                                                                                             │
│     "react": "^18.2.0",                                                                                                                            │
│     "react-dom": "^18.2.0",                                                                                                                        │
│     "@supabase/supabase-js": "^2.39.0",                                                                                                            │
│     "@anthropic-ai/sdk": "^0.17.0",                                                                                                                │
│     "react-hook-form": "^7.49.0",                                                                                                                  │
│     "zod": "^3.22.0",                                                                                                                              │
│     "@hookform/resolvers": "^3.3.0",                                                                                                               │
│     "recharts": "^2.10.0",                                                                                                                         │
│     "lucide-react": "^0.309.0",                                                                                                                    │
│     "class-variance-authority": "^0.7.0",                                                                                                          │
│     "clsx": "^2.1.0",                                                                                                                              │
│     "tailwind-merge": "^2.2.0"                                                                                                                     │
│   },                                                                                                                                               │
│   "devDependencies": {                                                                                                                             │
│     "typescript": "^5.3.0",                                                                                                                        │
│     "@types/node": "^20.10.0",                                                                                                                     │
│     "@types/react": "^18.2.0",                                                                                                                     │
│     "tailwindcss": "^3.4.0",                                                                                                                       │
│     "autoprefixer": "^10.4.0",                                                                                                                     │
│     "postcss": "^8.4.0"                                                                                                                            │
│   }                                                                                                                                                │
│ }                                                                                                                                                  │
│                                                                                                                                                    │
│ Environment Variables                                                                                                                              │
│                                                                                                                                                    │
│ .env.local:                                                                                                                                        │
│ # Supabase                                                                                                                                         │
│ NEXT_PUBLIC_SUPABASE_URL=your_supabase_url                                                                                                         │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key                                                                                               │
│ SUPABASE_SERVICE_ROLE_KEY=your_service_role_key                                                                                                    │
│                                                                                                                                                    │
│ # Claude API                                                                                                                                       │
│ ANTHROPIC_API_KEY=your_claude_api_key                                                                                                              │
│                                                                                                                                                    │
│ # Next.js                                                                                                                                          │
│ NEXT_PUBLIC_APP_URL=http://localhost:3000                                                                                                          │
│                                                                                                                                                    │
│ Supabase Configuration                                                                                                                             │
│                                                                                                                                                    │
│ Row-Level Security Policies:                                                                                                                       │
│                                                                                                                                                    │
│ -- inventory_items: viewers can read, managers can insert/update, admins can delete                                                                │
│ CREATE POLICY "Anyone can view inventory items"                                                                                                    │
│   ON inventory_items FOR SELECT                                                                                                                    │
│   USING (true);                                                                                                                                    │
│                                                                                                                                                    │
│ CREATE POLICY "Managers and admins can insert items"                                                                                               │
│   ON inventory_items FOR INSERT                                                                                                                    │
│   WITH CHECK (                                                                                                                                     │
│     auth.uid() IN (                                                                                                                                │
│       SELECT id FROM user_profiles                                                                                                                 │
│       WHERE role IN ('manager', 'admin')                                                                                                           │
│     )                                                                                                                                              │
│   );                                                                                                                                               │
│                                                                                                                                                    │
│ CREATE POLICY "Managers and admins can update items"                                                                                               │
│   ON inventory_items FOR UPDATE                                                                                                                    │
│   USING (                                                                                                                                          │
│     auth.uid() IN (                                                                                                                                │
│       SELECT id FROM user_profiles                                                                                                                 │
│       WHERE role IN ('manager', 'admin')                                                                                                           │
│     )                                                                                                                                              │
│   );                                                                                                                                               │
│                                                                                                                                                    │
│ CREATE POLICY "Only admins can delete items"                                                                                                       │
│   ON inventory_items FOR DELETE                                                                                                                    │
│   USING (                                                                                                                                          │
│     auth.uid() IN (                                                                                                                                │
│       SELECT id FROM user_profiles                                                                                                                 │
│       WHERE role = 'admin'                                                                                                                         │
│     )                                                                                                                                              │
│   );                                                                                                                                               │
│                                                                                                                                                    │
│ -- user_profiles: admins can manage, others can view own profile                                                                                   │
│ CREATE POLICY "Users can view own profile"                                                                                                         │
│   ON user_profiles FOR SELECT                                                                                                                      │
│   USING (auth.uid() = id);                                                                                                                         │
│                                                                                                                                                    │
│ CREATE POLICY "Admins can manage all profiles"                                                                                                     │
│   ON user_profiles FOR ALL                                                                                                                         │
│   USING (                                                                                                                                          │
│     auth.uid() IN (                                                                                                                                │
│       SELECT id FROM user_profiles                                                                                                                 │
│       WHERE role = 'admin'                                                                                                                         │
│     )                                                                                                                                              │
│   );                                                                                                                                               │
│                                                                                                                                                    │
│ Database Trigger for Auto-Status:                                                                                                                  │
│                                                                                                                                                    │
│ CREATE OR REPLACE FUNCTION update_item_status()                                                                                                    │
│ RETURNS TRIGGER AS $$                                                                                                                              │
│ BEGIN                                                                                                                                              │
│   IF NEW.quantity = 0 THEN                                                                                                                         │
│     NEW.status := 'low_stock';                                                                                                                     │
│   ELSIF NEW.quantity <= NEW.low_stock_threshold THEN                                                                                               │
│     NEW.status := 'low_stock';                                                                                                                     │
│   ELSIF NEW.status NOT IN ('ordered', 'discontinued') THEN                                                                                         │
│     NEW.status := 'in_stock';                                                                                                                      │
│   END IF;                                                                                                                                          │
│                                                                                                                                                    │
│   NEW.updated_at := NOW();                                                                                                                         │
│   RETURN NEW;                                                                                                                                      │
│ END;                                                                                                                                               │
│ $$ LANGUAGE plpgsql;                                                                                                                               │
│                                                                                                                                                    │
│ CREATE TRIGGER inventory_status_update                                                                                                             │
│   BEFORE INSERT OR UPDATE ON inventory_items                                                                                                       │
│   FOR EACH ROW                                                                                                                                     │
│   EXECUTE FUNCTION update_item_status();                                                                                                           │
│                                                                                                                                                    │
│ AI Search Implementation Details                                                                                                                   │
│                                                                                                                                                    │
│ Claude API Prompt Template:                                                                                                                        │
│                                                                                                                                                    │
│ const systemPrompt = `You are an inventory search assistant. Given a natural language query, convert it to structured search parameters.           │
│                                                                                                                                                    │
│ Database schema:                                                                                                                                   │
│ - name: string (item name)                                                                                                                         │
│ - description: string                                                                                                                              │
│ - category: string                                                                                                                                 │
│ - quantity: number                                                                                                                                 │
│ - status: 'in_stock' | 'low_stock' | 'ordered' | 'discontinued'                                                                                    │
│ - unit_price: number                                                                                                                               │
│ - sku: string                                                                                                                                      │
│                                                                                                                                                    │
│ Return JSON in this format:                                                                                                                        │
│ {                                                                                                                                                  │
│   "filters": {                                                                                                                                     │
│     "text_search": string | null,                                                                                                                  │
│     "categories": string[] | null,                                                                                                                 │
│     "statuses": string[] | null,                                                                                                                   │
│     "quantity_min": number | null,                                                                                                                 │
│     "quantity_max": number | null,                                                                                                                 │
│     "price_min": number | null,                                                                                                                    │
│     "price_max": number | null                                                                                                                     │
│   },                                                                                                                                               │
│   "explanation": string (explain what you understood)                                                                                              │
│ }`;                                                                                                                                                │
│                                                                                                                                                    │
│ // Example queries:                                                                                                                                │
│ // "show me low stock electronics" → filters: { categories: ["electronics"], statuses: ["low_stock"] }                                             │
│ // "cameras under $500" → filters: { text_search: "camera", price_max: 500 }                                                                       │
│ // "items we need to reorder" → filters: { statuses: ["low_stock", "discontinued"] }                                                               │
│                                                                                                                                                    │
│ Verification & Testing                                                                                                                             │
│                                                                                                                                                    │
│ End-to-end Testing Checklist:                                                                                                                      │
│                                                                                                                                                    │
│ 1. Authentication:                                                                                                                                 │
│   - Sign up new user (should default to viewer role)                                                                                               │
│   - Login with credentials                                                                                                                         │
│   - Logout                                                                                                                                         │
│   - Try accessing protected routes while logged out (should redirect)                                                                              │
│ 2. Role-Based Access:                                                                                                                              │
│   - As Viewer: can only view items, no add/edit/delete buttons visible                                                                             │
│   - As Manager: can view, add, edit items (no delete)                                                                                              │
│   - As Admin: can do everything including delete and manage users                                                                                  │
│ 3. Inventory CRUD:                                                                                                                                 │
│   - Add new item with all fields                                                                                                                   │
│   - Edit existing item                                                                                                                             │
│   - Delete item (admin only)                                                                                                                       │
│   - Verify auto-status updates when quantity changes                                                                                               │
│   - Check required field validation                                                                                                                │
│ 4. Search & Filtering:                                                                                                                             │
│   - Text search finds items by name/description                                                                                                    │
│   - Filter by category works                                                                                                                       │
│   - Filter by status works                                                                                                                         │
│   - AI search interprets natural language correctly                                                                                                │
│   - Combine multiple filters                                                                                                                       │
│ 5. Real-time Updates:                                                                                                                              │
│   - Open app in two browser windows                                                                                                                │
│   - Create item in window 1, verify it appears in window 2                                                                                         │
│   - Update quantity in window 1, verify change in window 2                                                                                         │
│ 6. Additional Features:                                                                                                                            │
│   - Dashboard shows correct analytics                                                                                                              │
│   - CSV export downloads valid file                                                                                                                │
│   - CSV import successfully creates items                                                                                                          │
│   - Activity logs track changes                                                                                                                    │
│   - Mobile responsive on phone screen                                                                                                              │
│ 7. Deployment:                                                                                                                                     │
│   - App loads on Vercel URL                                                                                                                        │
│   - Auth works in production                                                                                                                       │
│   - Database operations work                                                                                                                       │
│   - AI search works (API key configured)                                                                                                           │
│   - No console errors                                                                                                                              │
│                                                                                                                                                    │
│ Test Data:                                                                                                                                         │
│                                                                                                                                                    │
│ Create seed data with:                                                                                                                             │
│ - 3 test users: admin@test.com (admin), manager@test.com (manager), viewer@test.com (viewer)                                                       │
│ - 15-20 inventory items across different categories                                                                                                │
│ - Mix of statuses (in stock, low stock, ordered, discontinued)                                                                                     │
│ - Realistic data for demonstration                                                                                                                 │
│                                                                                                                                                    │
│ README Template                                                                                                                                    │
│                                                                                                                                                    │
│ # Inventory Management System                                                                                                                      │
│                                                                                                                                                    │
│ A modern, full-stack inventory management application with AI-powered search, role-based access control, and real-time updates.                    │
│                                                                                                                                                    │
│ ## Features                                                                                                                                        │
│                                                                                                                                                    │
│ ✅ Full CRUD operations for inventory items                                                                                                        │
│ ✅ AI-powered natural language search (Claude API)                                                                                                 │
│ ✅ Role-based access control (Admin, Manager, Viewer)                                                                                              │
│ ✅ Real-time updates across users                                                                                                                  │
│ ✅ Analytics dashboard                                                                                                                             │
│ ✅ Bulk CSV import/export                                                                                                                          │
│ ✅ Activity logging & audit trail                                                                                                                  │
│ ✅ Mobile responsive design                                                                                                                        │
│                                                                                                                                                    │
│ ## Tech Stack                                                                                                                                      │
│                                                                                                                                                    │
│ - **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS                                                                                        │
│ - **Backend:** Next.js API Routes, Supabase (PostgreSQL)                                                                                           │
│ - **Auth:** Supabase Auth with Google SSO                                                                                                          │
│ - **AI:** Claude API (Anthropic)                                                                                                                   │
│ - **Deployment:** Vercel                                                                                                                           │
│                                                                                                                                                    │
│ ## Quick Start                                                                                                                                     │
│                                                                                                                                                    │
│ 1. Clone the repository                                                                                                                            │
│ 2. Install dependencies: `npm install`                                                                                                             │
│ 3. Copy `.env.example` to `.env.local` and fill in values                                                                                          │
│ 4. Run development server: `npm run dev`                                                                                                           │
│ 5. Open http://localhost:3000                                                                                                                      │
│                                                                                                                                                    │
│ ## Environment Setup                                                                                                                               │
│                                                                                                                                                    │
│ Create a `.env.local` file:                                                                                                                        │
│                                                                                                                                                    │
│ ```env                                                                                                                                             │
│ NEXT_PUBLIC_SUPABASE_URL=your_supabase_url                                                                                                         │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key                                                                                               │
│ ANTHROPIC_API_KEY=your_claude_api_key                                                                                                              │
│                                                                                                                                                    │
│ Test Accounts                                                                                                                                      │
│                                                                                                                                                    │
│ - Admin: admin@test.com / password123                                                                                                              │
│ - Manager: manager@test.com / password123                                                                                                          │
│ - Viewer: viewer@test.com / password123                                                                                                            │
│                                                                                                                                                    │
│ Deployment                                                                                                                                         │
│                                                                                                                                                    │
│ Deployed on Vercel: [Your Vercel URL]                                                                                                              │
│                                                                                                                                                    │
│ License                                                                                                                                            │
│                                                                                                                                                    │
│ MIT                                                                                                                                                │
│                                                                                                                                                    │
│ ## Risk Mitigation                                                                                                                                 │
│                                                                                                                                                    │
│ **Potential Issues & Solutions:**                                                                                                                  │
│                                                                                                                                                    │
│ 1. **Supabase setup takes too long**                                                                                                               │
│    - Mitigation: Use Supabase CLI for local dev, skip SSO if needed                                                                                │
│    - Fallback: Use local SQLite + simple JWT auth                                                                                                  │
│                                                                                                                                                    │
│ 2. **Claude API rate limits**                                                                                                                      │
│    - Mitigation: Implement request caching, fallback to traditional search                                                                         │
│    - Have example responses ready for demo                                                                                                         │
│                                                                                                                                                    │
│ 3. **Deployment issues**                                                                                                                           │
│    - Mitigation: Test deploy early (minute 50), have Railway as backup                                                                             │
│    - Ensure environment variables are documented                                                                                                   │
│                                                                                                                                                    │
│ 4. **Time overrun**                                                                                                                                │
│    - Priority order: Core CRUD > Auth > Search > AI > Extras                                                                                       │
│    - Can skip: activity logs, bulk operations, advanced analytics                                                                                  │
│    - Must have: Basic inventory table, add/edit/delete, simple auth, one AI feature                                                                │
│                                                                                                                                                    │
│ ## Success Criteria                                                                                                                                │
│                                                                                                                                                    │
│ **Minimum Viable Product (must have):**                                                                                                            │
│ - ✅ Inventory table with add/edit/delete                                                                                                          │
│ - ✅ Basic authentication (email/password)                                                                                                         │
│ - ✅ Role-based permissions working                                                                                                                │
│ - ✅ Search by name/category                                                                                                                       │
│ - ✅ At least one AI feature (smart search)                                                                                                        │
│ - ✅ Deployed and accessible via URL                                                                                                               │
│ - ✅ README with setup instructions                                                                                                                │
│                                                                                                                                                    │
│ **Impressive Additions (nice to have):**                                                                                                           │
│ - ✅ Real-time updates                                                                                                                             │
│ - ✅ Analytics dashboard                                                                                                                           │
│ - ✅ Bulk import/export                                                                                                                            │
│ - ✅ Activity logging                                                                                                                              │
│ - ✅ Google SSO                                                                                                                                    │
│ - ✅ Mobile responsive                                                                                                                             │
│                                                                                                                                                    │
│ **Show-stopping bugs to avoid:**                                                                                                                   │
│ - ❌ Auth bypass (weak RLS policies)                                                                                                               │
│ - ❌ Data loss on edit/delete                                                                                                                      │
│ - ❌ Crashes on invalid input                                                                                                                      │
│ - ❌ Not mobile responsive at all                                                                                                                  │
│ - ❌ Deployment doesn't work                                                                                                                       │
│                                                                                                                                                    │
│ ---                                                                                                                                                │
│                                                                                                                                                    │
│ **Total Estimated Time:** 60 minutes                                                                                                               │
│ **Difficulty:** Medium-High (tight timeline, but well-scoped)                                                                                      │
│ **Success Probability:** High with this plan and AI assistance    