# 💰 Amar Kharcha

> A personal expense tracker built around **real salary cycles — not calendar months.**

**Amar Kharcha** helps you track daily expenses according to your actual salary period. Instead of forcing everyone into a January–December or 1st–30th/31st cycle, users can create their own custom periods such as:

`28 Sep → 28 Oct`

Every expense is automatically attached to the currently active period, making it easier to understand exactly where your money is going.

---

## ✨ Why Amar Kharcha?

Most people don't get paid on the 1st of the month.

Traditional expense trackers organize spending around calendar months, which doesn't always match how people actually manage their money.

**Amar Kharcha solves this by making your salary cycle the center of your expense tracking.**

You can:

- Create custom salary periods
- Track expenses within each period
- Switch between periods instantly
- View period-wise summaries
- Filter and sort transactions
- Export detailed reports as DOCX

---

## 🚀 Features

### 📅 Period-Based Tracking

- Create unlimited custom periods
- Set a custom name and date range
- Only one period can be active at a time
- Instantly switch between periods from the navbar
- Automatically promote the newest period if the active one is deleted
- View a summary of total spending and transaction count for every period

---

### 💸 Expense Management

Add expenses with:

- Date
- Item name
- Quantity
- Unit
- Price
- Category
- Optional note

#### Quantity Units

Quantity and unit are optional and support dropdown values such as:

`kg` · `ml` · `pcs` · `L` · `dozen` · and more

#### Expense Tools

- Automatically attach expenses to the active period
- Filter by category
- Filter by date range
- Filter by period
- Sort by:
  - Newest
  - Oldest
  - Price: High → Low
  - Price: Low → High

- Pagination with **20 transactions per page**

---

### 🏷️ Smart Categories

Amar Kharcha comes with **18 default categories**:

> Medicine · Grocery · Vegetables · Snacks · Rent · Transport · Electricity · Water · Internet · Mobile Recharge · Education · Health · Clothing · Entertainment · Restaurant · Fuel · Gift · Other

You can also create your own categories.

#### Category Management

- Create custom categories
- Choose from **26 available icons**
- Edit custom categories
- Delete custom categories
- Default categories are protected
- Category renames automatically reflect on existing transactions

---

### 🤝 Pending — Who Owes Whom?

Keep track of money you owe or money others owe you.

#### Two Tabs

**They Owe Me**

Track money that other people need to pay you.

**I Owe Them**

Track money that you need to pay others.

Each entry can contain:

- Person name
- Amount
- Optional note

Additional features:

- Live total on each tab
- Bottom total for the current tab
- Themed confirmation dialog before deletion

---

### 🏢 Business & Investments

Track your business investments and profits in one place.

#### Business Tracking

Store:

- Business name
- Person name
- Investment amount
- Investment date

Each business has its own detail page with:

- Total invested capital
- Total profit
- Return percentage
- Monthly profit entries
- Profit history
- Running profit total

Deleting a business also removes its related profit records.

---

### 📊 Dashboard & Reports

The dashboard provides a quick overview of your financial activity.

#### Live Statistics

- **Current Period**
- **Today**
- **This Month**
- **All Time**

#### Visual Reports

- Daily expense bar chart for the last 30 days
- Period Summary table
- Total spending across every period

---

### 📄 DOCX Report Export

Generate a properly formatted expense report before downloading it.

#### Report Includes

- Category-wise breakdown
- Item counts
- Total amounts
- Period information
- Generated date
- Signature block

The report can be downloaded as:

`.docx`

Compatible with:

- Microsoft Word
- Google Docs
- LibreOffice

A preview is shown before downloading to prevent accidental exports.

---

### 🎨 UI & UX

Amar Kharcha is designed to stay simple and responsive.

- 🌙 Dark / Light / System theme
- 🟢 Green-tinted dark mode
- 🔢 Animated number count-up
- 🔔 Toast notifications for actions
- ✅ Themed confirmation dialogs
- 📱 Smooth mobile navigation drawer
- ✨ Staggered navigation animations
- 📐 Fully responsive
- 💻 Mobile, tablet, and desktop support

---

## 🧱 Tech Stack

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Framework        | **Next.js 16 — App Router**   |
| Language         | **TypeScript**                |
| Styling          | **Tailwind CSS v4**           |
| Authentication   | **Better Auth**               |
| Database         | **MongoDB — Native Driver**   |
| State Management | **Redux Toolkit + RTK Query** |
| Charts           | **Recharts**                  |
| Icons            | **react-icons**               |
| DOCX Generation  | **docx**                      |
| Notifications    | **sonner**                    |

---

## 🗺️ Routes

```text
/
├── Home
│   └── Add expense + recent transactions
│
├── /transactions
│   └── All expenses + filters + sorting + pagination
│
├── /dashboard
│   └── Statistics + charts + period summary
│
├── /categories
│   └── Category management
│
├── /periods
│   └── Period management
│
├── /pending
│   └── They Owe Me / I Owe Them
│
├── /business
│   └── Business & investment list
│
├── /business/[id]
│   └── Business details + profit history
│
├── /login
├── /register
└── /onboarding
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd amar-kharcha
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
MONGODB_URI=...
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=<32+ character random secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Generate a secure secret

```bash
openssl rand -base64 32
```

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## 🧠 Key Design Decisions

### 1. Denormalized Names

Each transaction stores:

```text
categoryName
categoryIcon
periodName
```

This avoids unnecessary joins when reading transactions.

When a category or period is renamed, a single `updateMany` operation updates the related transactions.

---

### 2. Native MongoDB Driver

The project uses the **native MongoDB driver** instead of Mongoose.

Better Auth already works with MongoDB, and keeping a single database access strategy avoids unnecessary connection complexity.

---

### 3. RTK Query Tags

RTK Query tags are used to keep related data synchronized.

For example:

```text
Category added/deleted
        ↓
Related data automatically refetched
```

The same approach is used for:

- Categories
- Periods
- Businesses
- Dependent resources

This reduces the need for manual cache invalidation.

---

### 4. Single Active Period

Only one period can be active at a time.

The active state is stored directly as a boolean instead of requiring a separate settings collection.

---

### 5. Client-Side Onboarding Gate

Middleware only performs lightweight cookie checks.

`PeriodGate` verifies whether the user has configured their periods without adding unnecessary database work to every page load.

---

### 6. Icons as Strings

Icons are stored in MongoDB as strings:

```text
"FaPills"
"FaCar"
"FaHome"
```

They are resolved to React components during rendering.

This keeps the database documents serializable and lightweight.

---

### 7. Tailwind CSS v4

The project follows the CSS-first approach introduced in Tailwind CSS v4.

Theme variables are maintained directly inside:

```text
globals.css
```

No `tailwind.config.js` is required.

---

## 🚫 Not Included

The current version intentionally does **not** include:

- Income tracking
- Multi-currency support
- Budget management
- Recurring expenses
- Transaction editing
- Email verification
- Password reset
- Social login
- Offline mode
- CSV export
- PDF export
- Category-wise pie chart

---

## 🛣️ Project Vision

Amar Kharcha is built with a simple goal:

> **Make personal expense tracking fit the way people actually earn and spend money.**

Instead of organizing finances around the calendar, the system organizes them around the user's real financial cycle.

---

## 👨‍💻 Built By
