# Tavlasoğlu Stok Takip Projesi - Project Overview

## Project Information
- **Name**: tavlasoglu-stok
- **Type**: Vue 3 + Vite Application
- **Purpose**: Stock tracking system for Tavlasoğlu Heating and Cooling Systems

## Technology Stack
- **Frontend Framework**: Vue 3 (Composition API with `<script setup>`)
- **State Management**: Pinia
- **Routing**: Vue Router
- **UI Framework**: Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Functions)
- **Build Tool**: Vite
- **Language**: JavaScript (with some TypeScript patterns)

## Project Structure
```
tavlasoglu-stok/
├── docs/                    # Documentation folder
│   └── current-state/      # Current state documentation
├── plans/                  # Implementation plans and documentation
├── public/                 # Static assets
├── src/                    # Source code
│   ├── assets/             # CSS and other assets
│   ├── components/         # Reusable Vue components
│   ├── composables/        # Vue composables (custom hooks)
│   ├── layouts/            # Page layouts
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia stores
│   ├── utils/              # Utility functions
│   ├── views/              # Page components (views)
│   ├── App.vue             # Main application component
│   ├── main.js             # Application entry point
│   └── supabase.js         # Supabase client configuration
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── README.md               # Project README
```

## Key Features
1. **Stock Management**: Product cards, stock entries, warehouse management
2. **Work Order Management**: Work orders, resources, deposits
3. **Customer Management**: Customer information and agreements
4. **Accounting**: Receivables, cost tracking
5. **User Management**: Role-based access control (Admin, Salesperson, Accountant, Unauthorized)
6. **Reporting**: Performance reports, stock logs

## Authentication & Authorization
- **Authentication Provider**: Supabase Auth
- **User Roles**: 
  - `yonetici` (Administrator)
  - `satisci` (Salesperson)
  - `muhasebeci` (Accountant)
  - `yetkisiz` (Unauthorized)
- **Session Management**: Automatic session restoration on page reload
- **Route Protection**: Guarded routes based on roles

## State Management
- **Pinia Stores**: 
  - `userStore`: User authentication and profile management
  - `counter`: Example store (likely for demonstration)

## Database Schema
The application uses Supabase as its backend with multiple tables for different entities:
- Users and profiles
- Products and stock levels
- Work orders and resources
- Customers and agreements
- Stock movements
- Deposits
- Costs and receivables

## Recent Improvements
The project recently implemented atomic transaction patterns to resolve critical data consistency issues:
1. **Stock Entry Editing**: Fixed failures when changing warehouses during entry editing
2. **Work Order Resource Changes**: Fixed failures when converting resources to deposit sources
3. **Atomic Operations**: Implemented database functions to ensure all-or-nothing operations

## Development Setup
1. Install dependencies: `npm install`
2. Configure environment variables in `.env`
3. Run development server: `npm run dev`
4. Build for production: `npm run build`