Amar Kharcha
A personal expense tracker where users define their own expense cycles (periods) and log daily expenses against them.

Stack: Next.js 14 (App Router) · TypeScript · Tailwind CSS v4 · MongoDB · Better Auth · Redux Toolkit / RTK Query · Recharts

Concept
Traditional expense apps group by calendar month. This one doesn't. Users create periods — custom date ranges like 28 Sep → 28 Oct — to match their salary cycle. Every new expense is auto-attached to the active period.

Features
Auth

Email/password registration and login (Better Auth)

Session cookie + route protection via middleware

Logout

Periods

Create, edit, delete periods with name + date range

One active period at a time

Navbar dropdown to switch

Auto-promote newest period if active one is deleted

Delete blocked if transactions exist

Onboarding

New users redirected to /onboarding until they create their first period

Enforced client-side via PeriodGate

Categories

18 default categories auto-seeded per user (Medicine, Grocery, Rent, Transport, etc.)

Custom categories: create, edit, delete

26 icons available

Defaults are protected

Renames denormalize to transactions

Expenses

Add: date, item (required), quantity (optional), unit (optional), price (required), category (required), note (optional)

Auto-attach to active period

Filter by period/category, pagination

Delete via API

Dashboard

Stat cards: Current Period, Today, This Month, All Time

Daily bar chart (last 30 days)

Period summary table with grand total

UI

Dark/light/system theme (greenish dark mode)

Fully responsive
