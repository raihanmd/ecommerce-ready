# eCommerce Frontend

A modern, full-featured eCommerce frontend built with Next.js 16, React 19, and shadcn/ui components.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (or Bun)
- npm/yarn/pnpm/bun

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📋 Project Structure

```
ecommerce/frontend/
├── app/                           # Next.js App Router pages
│   ├── page.tsx                   # Home page
│   ├── products/                  # Products listing
│   │   ├── page.tsx              # Products list
│   │   └── [slug]/               # Product detail
│   ├── cart/                      # Shopping cart
│   ├── checkout/                  # Checkout form
│   ├── order-confirmation/        # Order success page
│   ├── admin/                     # Admin dashboard
│   │   ├── login/                # Admin login
│   │   ├── dashboard/            # Dashboard overview
│   │   ├── orders/               # Orders management
│   │   ├── products/             # Products CRUD
│   │   └── categories/           # Categories CRUD
│   ├── layout.tsx                 # Root layout
│   ├── globals.css                # Global styles + shadcn theme
│   └── middleware.ts              # Next.js middleware (auth)
├── components/                    # React components
│   ├── ui/                        # shadcn/ui components
│   ├── ProductCard.tsx            # Product card component
│   ├── CartItem.tsx               # Cart item component
│   ├── Navbar.tsx                 # Navigation bar
│   ├── CategoryDropdown.tsx       # Category dropdown
│   ├── Pagination.tsx             # Pagination component
│   └── providers/                 # React providers
├── lib/                           # Utility functions
│   ├── api.ts                     # API client instances
│   ├── queryClient.ts             # TanStack Query setup
│   ├── queries/                   # Custom hooks (TanStack Query)
│   │   ├── useProducts.ts
│   │   ├── useOrders.ts
│   │   ├── useAdmin.ts
│   │   └── ...
│   └── utils/                     # Helper functions
├── hooks/                         # Custom React hooks
│   ├── useCart.ts                 # Shopping cart management
│   ├── useGeolocation.ts          # Geolocation API
│   ├── useAdminAuth.ts            # Admin authentication
│   └── ...
├── store/                         # Zustand stores
│   └── authStore.ts               # Auth state management
├── types/                         # TypeScript types
│   └── index.ts                   # All type definitions
├── public/                        # Static assets
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind CSS config
├── postcss.config.mjs             # PostCSS config
├── components.json                # shadcn/ui config
└── next.config.ts                 # Next.js config
```

## 🎨 UI Components

This project uses **shadcn/ui** - a collection of beautifully designed, accessible React components built with Tailwind CSS and Radix UI primitives.

### Installed Components

- `Button` - Interactive button with multiple variants
- `Input` - Form input field
- `Textarea` - Multi-line text input
- `Label` - Form labels
- `Card` - Container component
- `Badge` - Status badges
- `Alert` - Alert/notification component
- `Dialog` - Modal dialog
- `Sheet` - Sliding drawer
- `DropdownMenu` - Dropdown menu
- `RadioGroup` - Radio button group
- `Select` - Select dropdown
- `Table` - Data table
- `Pagination` - Pagination controls
- `Tabs` - Tabbed interface
- `Popover` - Popover component
- `ScrollArea` - Scrollable area

### Icons

All icons use **lucide-react** for consistency and smaller bundle size.

```tsx
import { ShoppingCart, Loader2, AlertCircle } from "lucide-react";

<ShoppingCart className="h-4 w-4" />  // Standard size
<Loader2 className="h-6 w-6 animate-spin" />  // Loading spinner
```

## 🔄 State Management

### TanStack Query (React Query)

Handles server state, caching, and data synchronization:

- Product queries
- Order management
- Admin CRUD operations

```tsx
const { data, isLoading, error } = useProducts({ page: 1, limit: 12 });
```

### Zustand

Lightweight client-side state management:

- Shopping cart
- Authentication state
- User preferences

```tsx
const { items, addItem } = useCart();
```

## 📡 API Integration

The application communicates with a NestJS backend API at `http://localhost:3001/v1`.

### Key Endpoints

- `GET /v1/products` - List products
- `GET /v1/products/detail/:slug` - Product details
- `GET /v1/categories` - List categories
- `POST /v1/orders` - Create order
- `GET /v1/orders/:orderNumber` - Get order status

See backend API documentation for complete endpoints.

## 🔐 Authentication

### Admin Access Control

- Protected routes via Next.js middleware
- JWT token stored in cookies
- Automatic token validation on protected pages
- Role-based access control (RBAC)

### Protected Routes

- `/admin/*` - All admin pages require authentication
- Unauthorized users are redirected to login

## 🛒 Key Features

### Product Browsing

- Filter by category
- Search products
- Pagination
- Product detail page with stock checking
- Quick add to cart

### Shopping Cart

- Add/remove items
- Adjust quantities
- Real-time price calculation
- Persistent cart (localStorage)

### Checkout

- Customer information form validation
- Delivery schedule selection (pagi/siang/sore)
- Payment method options (COD/transfer/e-wallet)
- Geolocation integration
- Order creation

### Admin Dashboard

- Order management and status tracking
- Product CRUD operations
- Category management
- Order approval/rejection workflow
- User authentication

## 🎯 Best Practices

### Component Organization

```tsx
// Always use "use client" for client-side components
"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export default function ProductCard() {
  return (
    <Button className="gap-2">
      <ShoppingCart className="h-4 w-4" />
      Add to Cart
    </Button>
  );
}
```

### Form Handling

```tsx
// Use proper labels with inputs
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="..." />
</div>
```

### Error Handling

```tsx
// Use Alert component for error states
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Error message here</AlertDescription>
</Alert>
```

### Loading States

```tsx
// Use Loader2 icon with animation
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

## 🧪 Testing

Currently uses manual testing. Consider adding:

- Jest for unit tests
- Cypress for E2E tests
- Testing Library for component tests

## 📚 Documentation

- `SHADCN_MIGRATION.md` - shadcn/ui migration guide
- `TANSTACK_QUERY_MIGRATION.md` - TanStack Query migration guide
- `REFACTORING_SUMMARY.md` - Project refactoring summary

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 📦 Dependencies

### Core Framework

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety

### UI & Styling

- **shadcn/ui** - Component library
- **Tailwind CSS 4** - Utility-first CSS
- **Radix UI** - Primitives for shadcn
- **lucide-react** - Icon library

### State Management

- **TanStack Query 5** - Server state management
- **Zustand 5** - Client state management

### Forms & Validation

- **React Hook Form** - Form management
- **Zod** - Schema validation

### Utilities

- **Axios** - HTTP client
- **Next-Themes** - Theme management
- **React Hot Toast** - Toast notifications
- **clsx** / **tailwind-merge** - Class name utilities

## 🌐 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables
4. Deploy

### Other Platforms

- Build: `npm run build`
- Start: `npm run start`
- Ensure Node.js 18+ is available

## 📝 Migration Guides

### From Custom Components to shadcn/ui

See `SHADCN_MIGRATION.md` for detailed migration notes, including:

- Completed component migrations
- Color system and CSS variables
- Icon replacements
- Usage examples

### From Fetch to TanStack Query

See `TANSTACK_QUERY_MIGRATION.md` for details on:

- Query hooks
- Mutations
- Caching strategies
- Error handling

## 🐛 Known Issues

- CORS must be configured on backend to accept `http://localhost:3000`
- Admin routes require proper JWT token in cookies
- Product images must be valid URLs

## 📞 Support

For issues or questions:

- Check documentation files
- Review component examples in codebase
- Consult shadcn/ui and Next.js official docs

## 📄 License

This project is part of the eCommerce fullstack application.

## 👨‍💻 Development Tips

1. **Always use component composition** - Combine shadcn components for complex UIs
2. **Leverage CSS variables** - Theme colors use CSS variables in `globals.css`
3. **Use Tailwind utilities** - Combine with component props for custom styling
4. **Check lucide icons** - Icon library at https://lucide.dev
5. **Test dark mode** - Components automatically support dark mode via CSS variables

---

Happy coding! 🎉
