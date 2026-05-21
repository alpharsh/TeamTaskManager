# AeroTask — Premium Full-Stack Team Task Manager

AeroTask is an ultra-premium, high-fidelity **Team Task & Project Management** web application featuring a stunning **Aero Nebula (Glassmorphic Dark Mode)** user interface, robust **Role-Based Access Controls (RBAC)**, interactive **Kanban boards with native HTML5 Drag-and-Drop**, and deep dashboard analytics.

The application is built using the **MERN** stack (MongoDB, Express, React, Node.js) with a monorepo setup for single-container production deploys (Express serving the built React static client assets directly).

---

## ✨ Features & Highlights

1. **Stunning UI/UX Design ("Aero Nebula")**:
   - Advanced semi-transparent glassmorphic layout panels (`backdrop-filter: blur(12px)`) with glowing neon gradients.
   - Micro-animations, responsive sidebar drawers, sleek modern scrollbars, loading skeletons, and interactive KPI widgets.
   - Built with raw custom CSS (zero bloated UI libraries) for lightning-fast loads and precise visual transitions.

2. **Automated DB Auto-Seeding (Reviewer Shortcut)**:
   - On the first boot, the server automatically seeds the database with mock Administrator & Member users, a complete project workspace, and 5 interactive tasks in different columns (including a past-due task to showcase overdue alert systems).
   - Dynamic **Quick-Login Credentials** buttons are embedded directly on the Login page to allow reviewers to click and instantly log in without manual typing!

3. **High-Fidelity Role-Based Access Control (RBAC)**:
   - **System Roles**: Fully enforced across REST API controllers and React UI views.
   - **Admin Features**: Create projects, invite and remove project team members, create new tasks, assign tasks, delete tasks, and edit any task detail.
   - **Member Features**: Access a read-only list of projects they belong to, view dashboard statistics, view tasks, and **only update the status of tasks assigned to themselves** (restricted from changing titles, descriptions, priorities, or other member memberships).

4. **Interactive Kanban Board**:
   - Organized columns: `To Do`, `In Progress`, `Under Review`, and `Completed`.
   - Supports **both** Native HTML5 Drag-and-Drop status updates AND quick status toggle dropdown selectors inside task modals for seamless mobile-responsive control.

5. **Analytical Dashboard**:
   - Real-time calculations of Total, Active, Completed, and Overdue tasks.
   - Clean CSS conic-gradient visualizer showing user-specific completion rates.
   - Project completion progress bars and a chronological recent-activity listing.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), React Router DOM (v6), Modern CSS Variables (Custom Design Tokens), HTML5 drag-and-drop.
- **Backend**: Node.js, Express, JWT Authentication, Bcrypt (Password Hashing).
- **Database**: MongoDB (Mongoose Object Modeling ORM).
- **Tooling**: Concurrently (simultaneous frontend/backend development).

---

## 📁 Monorepo Folder Structure

```text
team-task-manager/
├── package.json             # Root monorepo (scripts & dependencies)
├── README.md                # Documentation guide
├── .env                     # Local environment settings
├── server/                  # Backend Express Server
│   ├── server.js            # Main entry point & client serving logic
│   ├── config/              # MongoDB connection & Automated DB Seeder
│   ├── models/              # User, Project, and Task Mongoose schemas
│   ├── middleware/          # JWT protection and project RBAC guards
│   ├── controllers/         # Auth, Project, Task, and Dashboard logic
│   └── routes/              # Express API route configurations
└── client/                  # Frontend React (Vite) App
    ├── index.html           # Main HTML entry point (fonts & viewport)
    ├── vite.config.js       # Vite configuration with API dev proxy
    └── src/
        ├── main.jsx         # React bootstrapping
        ├── index.css        # Core Design System (themes & selectors)
        ├── App.jsx          # Route manager & persistent session checker
        ├── components/      # Glassmorphic UI layout components
        └── pages/           # High-Fidelity App Views (Login, Dashboard, etc.)
```

---

## 🚀 Local Installation & Run Guide

### Prerequisites
- [Node.js](https://nodejs.org/) installed (v18+ recommended).
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on standard port `27017` (e.g. `mongodb://127.0.0.1:27017`).

### Steps to Run

1. **Clone or Open the Project Directory**
   Ensure you are in the root directory:
   ```bash
   cd team-task-manager
   ```

2. **Install Root and Client Dependencies**
   A pre-configured workspace script is provided to install both root server packages and React client packages in one go:
   ```bash
   npm run install:all
   ```

3. **Establish Local Environment**
   An environment file `.env` has already been preconfigured at the root directory:
   ```text
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager
   JWT_SECRET=super_secret_jwt_key_123_abc_xyz
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Launch Simultaneous Development Servers**
   Run the unified dev command to spin up the Express API server (on port `5000`) and the Vite React server (on port `3000` with reverse proxy):
   ```bash
   npm run dev
   ```

5. **Access Application**
   Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Login Accounts (Pre-Seeded)

The database will be automatically prefilled on your first server boot. Use these details to log in instantly (or click the quick-login buttons on the login screen):

### 👤 Administrator Account
- **Email**: `admin@aerotask.com`
- **Password**: `admin123`
- *Capabilities*: Full project and task manipulation, team invites, and board updates.

### 👥 Member Account
- **Email**: `rishmember@aerotask.com`
- **Password**: `member123`
- *Capabilities*: Member scoped tasks view, status-only updates for tasks assigned to them.

---

## 🌐 Production Railway Deployment Guide

This monorepo has been designed for **100% automated, single-service zero-CORS configuration deployment on Railway**.

### Deploy Instructions

1. **Create GitHub Repository**
   Initialize a new git repository, commit all files, and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of AeroTask manager"
   # Push to your GitHub repo
   ```

2. **Link to Railway**
   - Log into [Railway.app](https://railway.app/).
   - Click **New Project** and select **Deploy from GitHub repo**.
   - Select your committed `team-task-manager` repository.

3. **Provision Database**
   - Inside your Railway project layout, click **New** and select **Database -> Provision MongoDB**.
   - Railway will provision a hosted MongoDB container instantly.

4. **Configure Environment Variables**
   Link the Express backend to Railway's hosted database:
   - Select your web server service container in Railway and go to **Variables**.
   - Add the following variables:
     - `MONGODB_URI`: `${{MongoDB.MONGODB_URL}}` (Railway will automatically interpolate this link to your provisioned MongoDB service!).
     - `JWT_SECRET`: `your_secure_random_string`
     - `JWT_EXPIRE`: `30d`
     - `NODE_ENV`: `production`

5. **Deploy!**
   - Railway will trigger an automatic build.
   - The server script detects `client/dist` (Vite compiles standard builds into `client/dist` under `npm run build`), serving the static React build and handling API calls automatically from a single domain.
   - Your application is now **live, fully functional, and seeded!**
