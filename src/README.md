# Construction Expense Tracker

A simple, functional web application to track construction expenses for house building projects with INR currency support. Features multi-user access for Owner, Wife, and Architect.

## 🏗️ Features

- **Multi-user Authentication**: Support for Owner, Wife, and Architect roles
- **INR Currency Formatting**: Proper Indian Rupee formatting (₹1,23,456)
- **Expense Management**: Add, view, edit, and delete construction expenses
- **User Permissions**: Only expense creators can delete their own expenses
- **Dashboard**: Overview with summary cards and expense breakdowns
- **Construction Categories**: Pre-loaded with Indian construction expense categories
- **Real-time Updates**: Instant UI updates after expense operations
- **Simple UI**: Clean, functional design focused on usability

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS
- **Authentication**: Session-based auth with cookies

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔑 Demo Accounts

The application comes with pre-seeded demo accounts:

- **Owner**: owner@construction.local / password123
- **Wife**: wife@construction.local / password123  
- **Architect**: architect@construction.local / password123

## 📊 Construction Categories

Pre-loaded categories include:

- **Architect Fees**: Design, supervision, approvals
- **Materials**: Cement, steel/TMT bars, bricks, sand, gravel, wood, plumbing, electrical, paint
- **Labor**: Mason, helper, electrician, plumber, painter wages
- **Equipment**: Tool rentals, machinery
- **Permits**: Municipal approvals, NOCs
- **Utilities**: Construction electricity, water

## 📁 Project Structure

```
construction-expense-tracker/
├── app/
│   ├── api/                 # API routes
│   ├── components/          # Reusable components
│   ├── dashboard/           # Dashboard page
│   ├── expenses/            # Expense management pages
│   ├── lib/                 # Utility functions
│   └── login/               # Authentication pages
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts             # Database seeding script
└── public/                  # Static assets
```

## 🗄️ Database Schema

- **Users**: Multi-role user management
- **Categories**: Expense categorization
- **Expenses**: Expense tracking with INR amounts

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:seed` - Seed database with demo data
- `npm run lint` - Run ESLint

## 💡 Usage Features

### **Expense Management**
- ✅ Add expenses with INR currency formatting
- ✅ Categorize by construction type (Materials, Labor, etc.)
- ✅ View all expenses with filtering and sorting
- ✅ Delete your own expenses (with confirmation)
- ✅ Real-time dashboard updates

### **User Permissions**
- ✅ **Owner, Wife, Architect**: All can add expenses
- ✅ **Delete Protection**: Only expense creator can delete their entries
- ✅ **Role-based UI**: Different user roles displayed with badges

### **Dashboard Insights**
- ✅ Total expenses summary
- ✅ Monthly spending tracking
- ✅ Category-wise breakdown
- ✅ Recent expenses with quick actions

## 🚀 Deployment

### **Quick Deploy to Vercel (Recommended)**

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Construction expense tracker ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and deploy

3. **Set Environment Variables** in Vercel Dashboard:
   ```
   DATABASE_URL=file:./prod.db
   NODE_ENV=production
   ```

### **Alternative Deployment Platforms**

**Railway**:
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

**Render**:
- Connect GitHub repository
- Set build command: `npm run build`
- Set start command: `npm start`

**Manual VPS Deployment**:
```bash
# Build the application
npm run build

# Start production server
npm start
```

### **Production Database Setup**

For production, consider upgrading from SQLite to PostgreSQL:

1. **Update `schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set DATABASE_URL**:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

## 📝 License

This project is for educational and personal use.

---

*Built with ❤️ for construction expense tracking*# Constrruction_Expnese_Tracker
