# E-Commerce Monorepo

A full-stack e-commerce application built with NestJS (Backend) and Next.js (Frontend).

## Project Structure

```
ecommerce/
├── backend/          # NestJS backend API
├── frontend/         # Next.js frontend application
└── README.md
```

## Features

### Frontend

- 🛍️ Product browsing with pagination
- 🏷️ Category filtering via dropdown
- 🔍 Product detail page with image zoom
- 🛒 Shopping cart with localStorage persistence
- 💳 Complete checkout flow
- 📍 Geolocation integration
- 🚚 Multiple delivery schedule options
- 💰 Multiple payment methods (COD, Bank Transfer, E-Wallet)
- 📱 Fully responsive design

### Backend

- 📦 Product and Category management
- 🛍️ Order management with status tracking
- ✅ Stock validation and management
- 🔐 JWT authentication ready
- 🗄️ Prisma ORM with PostgreSQL
- 📝 Input validation with Zod
- 🚦 Rate limiting
- 🔄 Error handling and CORS enabled

## Tech Stack

### Backend

- **Framework**: NestJS 11
- **Database ORM**: Prisma 7
- **Validation**: Zod
- **Database**: PostgreSQL
- **Authentication**: JWT (Passport)

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Icons**: React Icons

## Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL 12+
- Git

## Getting Started

### 1. Database Setup

Make sure PostgreSQL is running and create a database:

```bash
createdb ecommerce
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
# Edit .env.local with your database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce"
SERVER_PORT=3000

# Run migrations
npx prisma migrate dev --name "initialize"

# Seed sample data
npm run seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:3000/v1`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
# Edit .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/v1

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Categories

- `GET /categories` - List all categories
- `GET /categories/:slug` - Get category details

### Products

- `GET /products` - List products with pagination
  - Query params: `page`, `limit`, `category_id`, `search`
- `GET /products/:slug` - Get product details
- `GET /products/:id/check-stock` - Check stock availability

### Orders

- `POST /orders` - Create a new order
- `GET /orders/:order_number` - Get order by order number
- `GET /orders/admin/all` - List all orders (admin)
- `PATCH /orders/:id/approve` - Approve an order (admin)
- `PATCH /orders/:id/reject` - Reject an order (admin)

## Database Schema

### Category

- id (string)
- name (string)
- slug (string, unique)
- description (text, optional)
- created_at
- updated_at

### Product

- id (string)
- name (string)
- slug (string, unique)
- description (text, optional)
- price (decimal)
- stock (int)
- image_url (text, optional)
- category_id (foreign key)
- created_at
- updated_at

### Order

- id (string)
- order_number (string, unique)
- customer_name (string)
- customer_phone (string)
- customer_address (text)
- latitude (decimal, optional)
- longitude (decimal, optional)
- delivery_schedule (enum: pagi, siang, sore)
- payment_method (enum: cod, transfer, ewallet)
- total_amount (decimal)
- status (enum: PENDING, APPROVED, REJECTED, SHIPPED, DELIVERED, CANCELLED)
- created_at
- updated_at

### OrderItem

- id (string)
- order_id (foreign key)
- product_id (foreign key)
- quantity (int)
- price_at_time (decimal)
- created_at
- updated_at

## Order Flow

1. **Browse Products**
   - User visits homepage and browses products
   - Can filter by category using dropdown
   - Can view product details with image zoom

2. **Add to Cart**
   - User adds products to cart
   - Cart is stored in localStorage
   - Stock validation prevents over-ordering

3. **Checkout**
   - User fills customer information form
   - Optional geolocation capture
   - Selects delivery schedule (Pagi/Siang/Sore)
   - Selects payment method

4. **Order Confirmation**
   - Order is created with status PENDING
   - Customer receives order number
   - Owner receives notification (ready to implement)

5. **Order Approval (Admin)**
   - Owner approves order
   - Stock is automatically reduced
   - Order status changes to APPROVED

6. **Shipping & Delivery**
   - Order status changes to SHIPPED, then DELIVERED

## Features Breakdown

### Delivery Schedules

- **Pagi** (06:00 - 09:00): Early morning delivery
- **Siang** (11:00 - 14:00): Midday delivery
- **Sore** (17:00 - 20:00): Evening delivery

### Payment Methods

- **COD** (Cash on Delivery): Pay when order arrives
- **Bank Transfer**: Manual bank transfer
- **E-Wallet**: Digital payment via e-wallet apps

## Development Notes

### Adding Products

Use the seed function or create via database directly:

```bash
npm run seed
```

### Styling

Uses Tailwind CSS v4 with @tailwindcss/postcss. Customize in `tailwind.config.ts`.

### State Management

Zustand is used for cart state with localStorage persistence. No Redux needed!

### API Integration

All API calls go through `lib/api.ts`. Add new endpoints there as needed.

## Testing Checklist

- [x] Backend API endpoints respond correctly
- [x] Frontend product listing works
- [x] Cart persists after page reload
- [x] Stock validation prevents over-ordering
- [x] Geolocation works (with permission)
- [x] Checkout form validates inputs
- [x] Order creation works
- [x] Responsive design on mobile/tablet/desktop

## Performance Optimizations

- Next.js Image component for automatic optimization
- Pagination for product listing (20 items per page)
- localStorage for cart (no server round trip on page load)
- Zustand for lightweight state management
- CSS-based image zoom (no extra library)

## Security Considerations

- Input validation with Zod on backend
- HTML sanitization in product descriptions (use next/script or DOMPurify for production)
- CORS enabled only for frontend
- JWT ready for admin features
- Rate limiting enabled (30 requests/minute)

## Environment Variables

### Backend (.env.local)

```
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
SERVER_PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

## Common Issues & Solutions

### Database Connection Error

- Ensure PostgreSQL is running
- Check DATABASE_URL in .env.local
- Verify database exists: `psql -l`

### Port Already in Use

- Backend: Change `SERVER_PORT` in .env.local
- Frontend: Use `npm run dev -- -p 3001`

### CORS Errors

- Ensure NEXT_PUBLIC_API_URL matches backend URL
- Check CORS whitelist in backend/src/main.ts

### Cart Not Persisting

- Check browser localStorage is enabled
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors

## Future Enhancements

- [ ] User accounts & authentication
- [ ] Order history for customers
- [ ] Admin dashboard for order management
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Coupon/discount codes
- [ ] Inventory management
- [ ] Real-time order tracking

## License

MIT

## Support

For issues or questions, please check existing documentation or create an issue in the repository.
