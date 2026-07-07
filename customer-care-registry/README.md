# Customer Care Registry

A full-stack **Customer Care Registry** platform for nonprofit organizations, built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). Support teams can register customers, log complaints, track interaction history, collect feedback, and monitor everything from a central dashboard with reports and analytics.

---

## 1. Features

- **Authentication & Authorization** — JWT-based auth, bcrypt password hashing, role-based access (`admin`, `agent`)
- **Dashboard** — live stats (customers, complaints, open/closed cases), recent activity feed, charts
- **Customer Management** — full CRUD, search, filters, pagination, customer profile with full history
- **Complaint Management** — CRUD, priority (Low/Medium/High), category, status workflow (Pending → In Progress → Resolved → Closed), agent assignment, status timeline
- **Interaction History** — log calls, emails, meetings, and notes per customer
- **Feedback Module** — 1–5 star ratings + comments, feedback reports
- **Search & Filter** — by name, complaint ID, status, priority, assigned agent; sort by latest
- **Reports & Analytics** — complaints by category, resolution rate, monthly trend, CSAT stats, CSV/PDF export
- **Notifications** — toast alerts for all actions
- **Modern responsive UI** — sidebar + top navbar, cards, tables, pagination, loading states

---

## 2. Tech Stack

| Layer      | Technology                                   |
|------------|-----------------------------------------------|
| Frontend   | React 18, React Router 6, Axios, Recharts, React-Toastify, jsPDF, PapaParse |
| Backend    | Node.js, Express.js                          |
| Database   | MongoDB + Mongoose                           |
| Auth       | JWT + bcryptjs                               |
| Validation | express-validator                            |

---

## 3. Project Structure

```
customer-care-registry/
├── server/
│   ├── config/          # DB connection
│   ├── controllers/     # Route handlers / business logic
│   ├── middleware/      # auth, role guard, error handler, validation
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── utils/           # helpers (token generation, etc.)
│   ├── seed/            # seed script with sample data
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── client/
    ├── public/
    └── src/
        ├── components/  # Reusable UI (Navbar, Sidebar, Table, StatCard, etc.)
        ├── pages/        # Route-level pages
        ├── context/      # AuthContext (global auth state)
        ├── services/     # Axios API wrappers
        ├── hooks/        # Custom hooks
        ├── utils/        # Formatters, constants
        └── App.js
```

---

## 4. Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

### 4.1 Backend Setup

```bash
cd server
npm install
cp .env.example .env
# edit .env with your MongoDB URI and JWT secret
npm run seed      # optional: populates sample data (users, customers, complaints...)
npm run dev       # starts server with nodemon on http://localhost:5000
```

Seeded login credentials (after `npm run seed`):

| Role  | Email                | Password    |
|-------|-----------------------|-------------|
| Admin | admin@ccr.org         | Admin@123   |
| Agent | agent@ccr.org         | Agent@123   |

### 4.2 Frontend Setup

```bash
cd client
npm install
cp .env.example .env    # set REACT_APP_API_URL if backend isn't on localhost:5000
npm start                # starts React dev server on http://localhost:3000
```

The app will open at `http://localhost:3000` and proxy API calls to the backend.

---

## 5. Environment Variables

### server/.env.example
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/customer_care_registry
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

### client/.env.example
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 6. API Documentation (summary)

Base URL: `/api`

### Auth
| Method | Endpoint             | Access | Description            |
|--------|-----------------------|--------|-------------------------|
| POST   | /auth/register        | Public | Register user (agent)  |
| POST   | /auth/login            | Public | Login, returns JWT      |
| GET    | /auth/me                | Private | Get logged-in profile |

### Customers
| Method | Endpoint             | Access        | Description |
|--------|-----------------------|---------------|--------------|
| GET    | /customers             | Private       | List (search/filter/paginate) |
| POST   | /customers             | Private       | Create customer |
| GET    | /customers/:id         | Private       | Get single customer + history summary |
| PUT    | /customers/:id         | Private       | Update customer |
| DELETE | /customers/:id         | Admin only    | Delete customer |

### Complaints
| Method | Endpoint             | Access   | Description |
|--------|-----------------------|----------|--------------|
| GET    | /complaints            | Private  | List (search/filter/sort/paginate) |
| POST   | /complaints            | Private  | Create complaint |
| GET    | /complaints/:id        | Private  | Get single complaint + timeline |
| PUT    | /complaints/:id        | Private  | Update complaint (status/priority/agent/etc.) |
| DELETE | /complaints/:id        | Admin only | Delete complaint |

### Interactions
| Method | Endpoint                          | Access  | Description |
|--------|------------------------------------|---------|--------------|
| GET    | /interactions/customer/:customerId | Private | History for a customer |
| POST   | /interactions                      | Private | Log an interaction |
| DELETE | /interactions/:id                  | Admin only | Delete an interaction |

### Feedback
| Method | Endpoint             | Access  | Description |
|--------|-----------------------|---------|--------------|
| GET    | /feedback               | Private | List all feedback |
| POST   | /feedback               | Private | Submit feedback |
| GET    | /feedback/reports        | Private | Aggregated CSAT report |
| DELETE | /feedback/:id            | Admin only | Delete feedback |

### Dashboard
| Method | Endpoint              | Access  | Description |
|--------|-------------------------|---------|--------------|
| GET    | /dashboard/stats          | Private | Card stats |
| GET    | /dashboard/recent-activity | Private | Recent complaints/customers/feedback |
| GET    | /dashboard/trends           | Private | Monthly complaint trend + category breakdown |

All `Private` routes require header: `Authorization: Bearer <token>`.

---

## 7. Security Notes

- Passwords hashed with bcrypt (10 salt rounds)
- JWT signed with `JWT_SECRET`, expires per `JWT_EXPIRES_IN`
- `helmet` + `cors` configured on the server
- Input validation via `express-validator` on all write routes
- Role-based middleware restricts destructive actions (delete) to `admin`

---

## 8. Scripts

### server/package.json
- `npm run dev` — nodemon
- `npm start` — production start
- `npm run seed` — seed sample data

### client/package.json
- `npm start` — CRA dev server
- `npm run build` — production build

---

## 9. Notes for Evaluation

This project is structured for clarity and academic review: controllers are thin and delegate to Mongoose models, routes are grouped by resource, and the frontend separates concerns cleanly (services for API calls, context for global state, components for reusable UI). Sample seed data is provided so the app is immediately explorable after setup.
