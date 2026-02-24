# Inventory Management System

A modern, full-stack inventory management application with AI-powered search, role-based access control, and real-time updates.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Supabase](https://img.shields.io/badge/Supabase-2.39-green)
![Claude API](https://img.shields.io/badge/Claude-API-purple)

## Features

### Core Functionality
- ✅ **Full CRUD Operations** - Create, read, update, and delete inventory items
- ✅ **Real-time Updates** - Live synchronization across users using Supabase real-time subscriptions
- ✅ **Role-Based Access Control** - Three user roles (Admin, Manager, Viewer) with granular permissions
- ✅ **Smart Status Tracking** - Automatic status updates based on quantity thresholds
- ✅ **Activity Logging** - Complete audit trail of all inventory changes

### Advanced Features
- 🤖 **AI-Powered Search** - Natural language queries using Claude API
  - Example: "show me low stock electronics"
  - Example: "items under $500"
- 📊 **Analytics Dashboard** - Real-time inventory statistics and insights
- 📥 **CSV Import/Export** - Bulk operations for inventory management
- 🔍 **Advanced Filtering** - Search by text, category, status, quantity, and price
- 📱 **Mobile Responsive** - Fully optimized for mobile and tablet devices
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Built-in authentication
  - Row-Level Security (RLS)
  - Real-time subscriptions
- **Claude API** - AI-powered natural language processing

### Deployment
- **Vercel** - Serverless deployment platform

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([sign up free](https://supabase.com))
- Anthropic API key ([get one here](https://console.anthropic.com))

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd aspire
npm install
```

### 2. Set Up Supabase

Follow the detailed instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Run database migrations
- Create test users
- Configure authentication

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Login with Test Accounts

```
Admin:   admin@test.com   / password123
Manager: manager@test.com / password123
Viewer:  viewer@test.com  / password123
```

## Project Structure

```
aspire/
├── app/                          # Next.js app directory
│   ├── (auth)/                  # Authentication pages
│   │   ├── login/
│   │   └── callback/
│   ├── (dashboard)/             # Protected dashboard pages
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── inventory/           # Inventory management
│   │   └── admin/               # Admin-only pages
│   ├── api/                     # API routes
│   │   ├── inventory/
│   │   └── search/ai/           # AI search endpoint
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── inventory-table.tsx      # Inventory data table
│   ├── inventory-form.tsx       # Add/edit form
│   ├── smart-search.tsx         # AI search component
│   └── navbar.tsx               # Navigation bar
├── lib/                         # Utility libraries
│   ├── supabase/                # Supabase clients
│   ├── ai/                      # Claude API integration
│   ├── auth/                    # Auth helpers
│   ├── types/                   # TypeScript types
│   └── utils/                   # Utility functions
├── supabase/                    # Database files
│   ├── migrations/              # SQL migrations
│   └── seed.sql                 # Sample data
├── middleware.ts                # Route protection
└── next.config.js               # Next.js configuration
```

## Database Schema

### Tables

**inventory_items**
- Core inventory data with auto-updating status
- Tracks creator and modification history
- Enforces data integrity with constraints

**user_profiles**
- Extends Supabase auth.users
- Stores role and full name
- Links to auth system

**activity_logs**
- Automatic audit trail
- Logs all create/update/delete operations
- Stores change history in JSONB format

### Row-Level Security

| Role | View | Create | Update | Delete | Manage Users |
|------|------|--------|--------|--------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

## API Endpoints

### Inventory Management
- `GET /inventory` - List all items
- `POST /inventory` - Create new item
- `PATCH /inventory/:id` - Update item
- `DELETE /inventory/:id` - Delete item (admin only)

### AI Search
- `POST /api/search/ai` - Natural language search
  ```json
  {
    "query": "show me low stock electronics"
  }
  ```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables (copy from `.env.local`)
5. Click "Deploy"

### 3. Configure Environment Variables in Vercel

Add these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL (set to your Vercel URL)
```

### 4. Update Supabase Redirect URLs

In your Supabase project settings:
1. Go to Authentication > URL Configuration
2. Add your Vercel URL to "Site URL"
3. Add `https://your-app.vercel.app/auth/callback` to "Redirect URLs"

## Usage Guide

### For Admins

1. **Manage Inventory** - Full CRUD operations on all items
2. **Manage Users** - Assign roles and permissions via `/admin/users`
3. **Delete Items** - Only admins can permanently delete inventory
4. **Export/Import** - Bulk operations with CSV files

### For Managers

1. **Add Items** - Create new inventory items
2. **Update Items** - Modify existing inventory
3. **Export Data** - Download inventory as CSV
4. **Import Data** - Bulk upload via CSV

### For Viewers

1. **View Inventory** - Read-only access to all items
2. **Search & Filter** - Use AI search and traditional filters
3. **Export Data** - Download current view as CSV

### AI Search Examples

```
"show me all electronics that are running low"
"furniture items under $300"
"what items do we need to reorder"
"office supplies in stock"
"cameras and lenses under $1000"
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Adding New Features

1. **Database Changes** - Add migration in `supabase/migrations/`
2. **API Routes** - Add routes in `app/api/`
3. **UI Components** - Add to `components/`
4. **Types** - Update `lib/types/database.types.ts`

## Troubleshooting

### Common Issues

**Login fails**
- Verify Supabase credentials in `.env.local`
- Check if user exists in Supabase dashboard
- Ensure RLS policies are set up correctly

**AI search not working**
- Verify `ANTHROPIC_API_KEY` is set
- Check API key has sufficient credits
- Review browser console for errors

**Real-time updates not working**
- Check Supabase project status
- Verify real-time is enabled in Supabase
- Check network tab for WebSocket connection

**Permission denied errors**
- Verify user role in database
- Check RLS policies in Supabase
- Ensure user is logged in

## Performance Optimizations

- Server-side rendering for initial page loads
- Client-side caching for repeated queries
- Optimistic UI updates for better UX
- Database indexes on frequently queried columns
- Real-time subscriptions only where needed

## Security Features

- Row-Level Security (RLS) at database level
- JWT-based authentication
- HTTPS-only in production
- Environment variables for secrets
- Input validation and sanitization
- SQL injection prevention via Supabase

## Future Enhancements

- [ ] Email notifications for low stock
- [ ] Barcode scanning support
- [ ] Advanced reporting and charts
- [ ] Multi-warehouse support
- [ ] Purchase order management
- [ ] Supplier management
- [ ] Product images upload

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Check the [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) guide
- Review the troubleshooting section above
- Open an issue on GitHub

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- AI by [Anthropic Claude](https://www.anthropic.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Built for interview demonstration - showcasing full-stack development, AI integration, and modern best practices.**
