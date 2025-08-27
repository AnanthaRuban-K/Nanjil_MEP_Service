# நாஞ்சில் MEP சேவை - Nanjil MEP Services

An electrical and plumbing services booking application built with Next.js, Hono, and Nx monorepo.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm
- PostgreSQL database (local or Neon)
- Clerk account for authentication

### Installation

1. **Clone and setup:**
```bash
git clone <repository-url>
cd nanjil-mep-services
npm install
```

2. **Environment setup:**
```bash
cp .env.example .env.local
# Fill in your database URL, Clerk keys, and other configuration
```

3. **Database setup:**
```bash
npm run db:generate
npm run db:push
```

4. **Start development servers:**
```bash
# Start both frontend (3000) and backend (3001)
npm run dev

# Or start individually
npm run dev:frontend
npm run dev:backend
```

### Project Structure

```
nanjil-mep-services/
├── apps/
│   ├── frontend/          # Next.js app (port 3000)
│   └── backend/           # Hono API (port 3001)
├── libs/
│   ├── shared/
│   │   ├── types/         # Shared TypeScript types
│   │   └── utils/         # Shared utilities
│   └── ui/
│       └── components/    # Shared UI components
├── package.json
└── nx.json
```

## 🛠️ Tech Stack

- **Monorepo:** Nx with npm
- **Frontend:** Next.js 14, TailwindCSS, Zustand, React Hook Form + Zod
- **Backend:** Hono API, Drizzle ORM 0.30.10, PostgreSQL
- **Database:** Neon PostgreSQL
- **Auth:** Clerk with RBAC
- **UI:** shadcn/ui, Radix UI primitives
- **Fonts:** Noto Sans Tamil for Tamil language support

## 🌐 Features

### Customer Features
- Bilingual support (Tamil/English)
- Service booking (Electrical/Plumbing/Emergency)
- Voice input for problem description
- Photo upload capabilities
- Real-time booking status
- WhatsApp integration
- Product catalog browsing
- Cash payment system

### Admin Features
- Dashboard with live metrics
- Booking queue management
- Team assignment and tracking
- Inventory management
- Performance analytics
- Revenue reports
- Emergency alert system

## 📱 Mobile Optimization

- Tamil font support (Noto Sans Tamil)
- Touch-first design with 44px+ touch targets
- High contrast colors for sunlight visibility
- Voice input support for accessibility
- Offline capability for basic functions
- Fast loading on 2G networks

## 🔧 Database Commands

```bash
# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## 🎨 Design System

Custom design system with:
- Service-specific color themes (Electrical: Orange, Plumbing: Blue, Emergency: Red)
- Tamil-optimized typography
- Mobile-first responsive design
- Accessibility-focused components
- Status badges and indicators

## 📦 Available Scripts

```bash
npm run dev              # Start both apps in development
npm run build           # Build all applications
npm run test            # Run tests
npm run lint            # Run linting
npm run format          # Format code with Biome
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables including:
- Database URL
- Clerk authentication keys
- API URLs
- Optional services (Redis, Storage, SMS)

## 🚀 Deployment

The application is configured for deployment with:
- Frontend: Vercel/Netlify
- Backend: Fly.io/Railway
- Database: Neon PostgreSQL
- Redis: Upstash
- Storage: MinIO/AWS S3

## 📖 Documentation

Complete project documentation with screen mockups, API specifications, and user flows is available in the project documentation file.

## 🤝 Contributing

1. Follow the established code style (Biome + Prettier)
2. Use conventional commits
3. Ensure Tamil translations are accurate
4. Test on mobile devices
5. Maintain accessibility standards

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ for the Tamil-speaking community in Nagercoil, Tamil Nadu.