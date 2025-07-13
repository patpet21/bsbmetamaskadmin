# Best Sicily Bottega - Supabase Setup

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Set project details:
   - **Name**: `best-sicily-bottega`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with the free tier
6. Click "Create new project"

## Step 2: Get Project Details

Once your project is created, you'll see the dashboard. Copy these values:

### From Settings > API:
- **Project URL**: `https://[your-project-id].supabase.co`
- **Project API Key (anon/public)**: `eyJ...` (the `anon` key)

### From Settings > Database:
- **Connection String**: `postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres`

## Step 3: Set Up Database Schema

1. Go to the **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy and paste the entire content from `supabase-setup.sql`
4. Run the query to create all tables and sample data

## Step 4: Configure Environment Variables

Add these to your Replit Secrets:

```
DATABASE_URL=postgresql://postgres:[your-password]@db.[your-project-id].supabase.co:5432/postgres
SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_ANON_KEY=eyJ[your-anon-key]
```

## Step 5: Test Connection

After setting up the environment variables, restart your application. You should see:
- Categories loading from Supabase
- Menu items with proper category relationships
- Extras with category associations
- Ability to create orders

## Features Included

### Database Tables:
- **categories**: Food categories (Pizza, Pasta, Dolci, Antipasti)
- **menu**: Menu items with prices, descriptions, and images
- **extras**: Additional items customers can add
- **orders**: Customer orders with payment tracking

### Sample Data:
- 4 categories with icons
- 16 menu items (4 per category) with Unsplash images
- 10 extras with category associations
- Realistic pricing and descriptions

### Security:
- Row Level Security (RLS) enabled
- Public read access for menu data
- Public order creation for customers
- Secure API key authentication

### Real-time Features:
- Live updates enabled for all tables
- Automatic timestamp tracking
- Data validation at database level

## Admin Features

The admin panel will work with:
- Create/edit/delete categories
- Manage menu items
- Configure extras
- View orders and payment tracking

## Payment Integration

Orders table supports:
- Multiple payment methods
- Transaction hash tracking
- Discount calculations
- Payment token tracking (PRDX/USDC)
- Order status management

Your Supabase project URL will be: `https://[your-project-id].supabase.co`