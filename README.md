# AthletiX

A comprehensive fitness platform connecting clients, trainers, and sports clubs. The application enables workout planning, progress tracking, client management, payment processing, and business analytics for the fitness industry.

![Dashboard](https://github.com/user-attachments/assets/30327073-c45e-42bf-b069-b9a73a2c04b8)

---

## Technologies

- **Frontend:** Next.js 15 (React 19, TypeScript, Tailwind CSS, next-intl, next-themes, Heroicons)
- **Backend:** Next.js API Routes (NextAuth, MongoDB, Mongoose, bcryptjs)
- **Database:** MongoDB
- **Other:** Stripe integration, Google OAuth, file uploads, real-time messaging

---

## Features

### User (Client)

- Plan and track workouts
- Monitor progress (weight, measurements, goals)
- Manage nutrition
- View workout templates
- Track calendar events
- Participate in community
- Premium subscription (Personal)

### Professional (Trainer)

- Manage clients
- Create and assign workout plans
- Track client progress
- Generate invoices
- View professional analytics
- Manage calendar and events
- Premium subscription (Professional)

### Business Owner

- Manage sports club
- Manage members and staff
- Client portal with announcements
- Business analytics and reports
- Financial management
- Schedule management
- Membership management

### Administrator

- Full access to all features
- Manage users and roles
- System administration

---

## Project Structure

```
AthletiX/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── user/         # User endpoints
│   │   │   ├── professional/ # Professional endpoints
│   │   │   ├── business/     # Business endpoints
│   │   │   ├── workouts/     # Workout endpoints
│   │   │   ├── stripe/       # Payment endpoints
│   │   │   └── messaging/   # Messaging endpoints
│   │   ├── auth/             # Auth pages (login, register)
│   │   ├── dashboard/        # Dashboard pages
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── auth/            # Auth components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── community/       # Community components
│   │   └── layout/          # Layout components
│   ├── models/              # Mongoose models
│   │   ├── User.ts          # User model
│   │   ├── Workout.ts       # Workout model
│   │   ├── Plan.ts          # Training plan model
│   │   ├── Message.ts       # Message model
│   │   └── ...
│   ├── lib/                 # Libraries
│   │   ├── mongodb.ts       # MongoDB connection
│   │   ├── mongoose.ts      # Mongoose connection
│   │   └── stripe.ts        # Stripe configuration
│   ├── containers/          # Page containers
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── theme/               # Theme configuration
├── messages/                # i18n translations
│   ├── en/                 # English translations
│   └── pl/                 # Polish translations
├── public/                 # Static assets
├── scripts/                # Helper scripts
├── tests/                  # Test files
└── package.json
```

---

## Requirements

- Node.js >= 18.x
- MongoDB (locally or Atlas)
- Google OAuth account (for login)
- Stripe account (for payments)

---

## Installation & Running

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd AthletiX
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and fill in the required data:

   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/athletix

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # NextAuth Configuration
   NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
   ```

4. Generate `NEXTAUTH_SECRET`:

   ```bash
   openssl rand -base64 32
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Roles & Permissions

- **user** - Regular client (plan workouts, track progress, manage nutrition, use community features)
- **professional** - Trainer (manage clients, create plans, generate invoices, view analytics)
- **business_owner** - Club owner (manage club, members, staff, business analytics)
- **admin** - Full access to all features and user management
  
---

## API Endpoints

Example main endpoints:

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (login, logout, session)
- `POST /api/auth/add-role` - Add role to user
- `POST /api/auth/update-role` - Update user role

### User

- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Update user profile
- `GET /api/user/progress` - Get user progress data
- `POST /api/user/progress` - Update user progress
- `GET /api/user/nutrition` - Get nutrition data
- `POST /api/user/nutrition` - Add nutrition entry
- `GET /api/user/plans` - Get user's training plans

### Workouts

- `GET /api/workouts` - List workouts
- `POST /api/workouts` - Create workout
- `GET /api/workouts/[id]` - Get workout details
- `PUT /api/workouts/[id]` - Update workout
- `DELETE /api/workouts/[id]` - Delete workout
- `GET /api/workouts/templates` - Get workout templates

### Professional

- `GET /api/professional/clients` - List clients
- `GET /api/professional/plans` - List training plans
- `GET /api/professional/analytics` - Get analytics data
- `GET /api/professional/invoices` - List invoices

### Business

- `GET /api/business` - Get business data
- `POST /api/business` - Create business
- `GET /api/business/members` - List members
- `GET /api/business/analytics` - Get business analytics
- `GET /api/business/finances` - Get financial data

### Payments

- `POST /api/stripe/checkout` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /api/stripe/check-status` - Check subscription status

### Messaging

- `GET /api/messaging/conversations` - List conversations
- `GET /api/messaging/messages` - Get messages
- `POST /api/messaging/messages` - Send message
- `GET /api/messaging/stream` - Real-time messaging stream

**More details can be found in the source code in the `src/app/api/` directory**

---

## Screenshots

### Dashboard

![localhost_3000_dashboard](https://github.com/user-attachments/assets/bdcedc4d-b091-4b0c-97d4-1ac20784b40d)

### Workout

![localhost_3000_dashboard-(2)](https://github.com/user-attachments/assets/e5f18e8c-28e0-4ff9-a034-b2f85d3c528f)
![localhost_3000_dashboard_profile-(3)](https://github.com/user-attachments/assets/15cfb375-7238-4a15-b138-629b55ba8637)

### Community

![localhost_3000_dashboard_profile-(1)](https://github.com/user-attachments/assets/1c86657e-bf1c-4ccf-8b1d-0ea336b81f53)

### Client 

![localhost_3000_dashboard_profile-(2)](https://github.com/user-attachments/assets/54640f1d-be1c-4ad7-9d24-5eb974ec97d2)

### Profile

![localhost_3000_dashboard_profile](https://github.com/user-attachments/assets/076c0bf9-5c93-44e1-9286-c966abc25fe9)


---

