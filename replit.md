# Best Sicily Bottega - Food Delivery Web App

## Overview

Best Sicily Bottega is a full-stack food delivery web application similar to Uber Eats, featuring an authentic Italian restaurant experience. The application allows customers to browse menu items by category, add items to their cart with customizable extras, and complete orders using cryptocurrency payments (PRDX and USDC on Base mainnet). The app now features a 10% MetaMask discount for crypto payments and integrates with NocoDB for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: React Context API for cart management
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Pattern**: RESTful API with Express routes
- **Development**: In-memory storage for rapid prototyping, with database schema ready for production

### Database Schema
The application uses a relational database with four main tables:
- **Categories**: Food categories (Pizza, Pasta, Dolci, Antipasti)
- **Menu**: Menu items with prices, descriptions, and category relationships
- **Extras**: Add-on items that can be associated with menu items
- **Orders**: Customer orders with payment tracking and transaction hashes

## Key Components

### Frontend Components
- **Menu Page**: Main application interface displaying categories and menu items
- **Category Navigation**: Tab-based category filtering
- **Menu Item Cards**: Product display with images, descriptions, and pricing
- **Cart System**: Shopping cart with quantity management and extras tracking
- **Modal System**: Add-to-cart, checkout, and order confirmation modals
- **Crypto Payment Integration**: MetaMask wallet connection and token payments

### Backend Components
- **Route Handlers**: Express routes for categories, menu items, extras, and orders
- **Storage Layer**: Abstracted storage interface supporting both in-memory and NocoDB operations
- **NocoDB Integration**: Real-time data synchronization with NocoDB v2 API
- **Database Models**: Drizzle schema definitions with proper relationships
- **Validation**: Zod schemas for API request validation

## Data Flow

1. **Menu Loading**: Categories and menu items are fetched on page load
2. **Category Filtering**: Client-side filtering updates the displayed menu items
3. **Cart Management**: Items are added to cart with selected extras and quantities
4. **Checkout Process**: Customer information is collected and wallet connection is established
5. **Payment Processing**: Cryptocurrency transactions are sent to the Base network
6. **Order Completion**: Successful payments create orders with transaction hashes

## External Dependencies

### Cryptocurrency Integration
- **Blockchain**: Base mainnet (Chain ID: 8453)
- **Supported Tokens**: PRDX and USDC
- **Wallet**: MetaMask integration using ethers.js
- **Payment Flow**: Direct token transfers to a designated recipient address
- **MetaMask Discount**: 10% automatic discount applied for crypto payments
- **Payment Calculation**: Dynamic discount calculation with transparent pricing display

### UI/UX Libraries
- **Component Library**: Radix UI primitives with shadcn/ui styling
- **Icons**: Lucide React icons
- **Animations**: CSS animations and transitions
- **Form Handling**: React Hook Form with Zod validation

### Development Tools
- **Database Management**: Drizzle Kit for migrations and schema management
- **Development Server**: Vite with HMR and React Fast Refresh
- **Build Process**: ESBuild for server bundling, Vite for client bundling

## Deployment Strategy

### Development Environment
- **Database**: Dual-mode storage (NocoDB + in-memory fallback)
- **Server**: Express development server with hot reload
- **Client**: Vite development server with proxy to backend API
- **NocoDB Integration**: Real-time synchronization with external NocoDB instance

### Production Considerations
- **Database**: PostgreSQL with Drizzle ORM migrations
- **Server**: Node.js with ESM bundle
- **Client**: Static assets served from dist/public
- **Environment Variables**: DATABASE_URL required for database connection

### Build Process
- **Client Build**: `vite build` generates optimized static assets
- **Server Build**: `esbuild` creates a single bundled server file
- **Database Setup**: `drizzle-kit push` applies schema changes

The application is structured as a monorepo with shared types and schemas, enabling type safety across the full stack while maintaining clear separation between client and server code.

## Recent Changes

### January 2025
- **NocoDB Integration**: Added support for NocoDB v2 API with project ID `pf5ksg4e5zqgn89`
- **MetaMask Discount System**: Implemented 10% automatic discount for crypto payments
- **Payment Enhancement**: Added transparent pricing display with subtotal, discount, and final total
- **Fallback Architecture**: Dual-mode storage system (NocoDB primary, in-memory fallback)
- **Order Management**: Enhanced order creation with menu items, extras, and payment method tracking
- **Error Handling**: Improved error handling for NocoDB API failures with graceful fallbacks