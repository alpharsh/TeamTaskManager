# AeroTask — Premium Full-Stack Team Task Manager

AeroTask is an ultra-premium, high-fidelity **Team Task & Project Management** web application featuring a stunning **Aero Nebula (Glassmorphic Dark Mode)** user interface, robust **Role-Based Access Controls (RBAC)**, interactive **Kanban boards with native HTML5 Drag-and-Drop**, and deep dashboard analytics.

This repository is organized into a fully decoupled, production-ready structure:
- **/server**: Standalone Express.js REST API server (deployable to container hosts like Railway, Render, etc.).
- **/client**: Standalone React.js (Vite) client application (deployable to static hosts like Vercel, Netlify, Cloudflare Pages, etc.).

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

- **Frontend**: React (Vite), React Router DOM (v7), Modern CSS Variables (Custom Design Tokens).
- **Backend**: Node.js, Express, JWT Authentication, BcryptJS (Password Hashing).
- **Database**: MongoDB (Mongoose Object Modeling ORM).

---

## 📁 Decoupled Folder Structure

```text
team-task-manager/
├── .gitignore               # Main Git exclusion list
├── README.md                # General developer guide
├── client/                  # Standalone Frontend React (Vite) App
│   ├── index.html           # Main HTML entry point
│   ├── vite.config.js       # Vite configuration with local API reverse proxy
│   ├── package.json         # Standalone frontend scripts & dependencies
│   └── src/
│       ├── main.jsx         # React bootstrapping
│       ├── index.css        # Core Design System (themes & selectors)
│       ├── App.jsx          # Route manager & persistent session checker
│       ├── components/      # Glassmorphic UI layout components
│       └── pages/           # High-Fidelity App Views (Login, Dashboard, etc.)
└── server/                  # Standalone Backend Express API Server
    ├── server.js            # Main entry point (loads .env from its own directory)
    ├── Dockerfile           # Multi-stage optimized production Docker image
    ├── .dockerignore        # Excludes node_modules and local secrets from container
    ├── .gitignore           # Server specific exclusion list
    ├── package.json         # Standalone backend scripts & dependencies
    ├── config/              # MongoDB connection & Automated DB Seeder
    ├── models/              # User, Project, and Task Mongoose schemas
    ├── middleware/          # JWT protection and project RBAC guards
    ├── controllers/         # Auth, Project, Task, and Dashboard logic
    └── routes/              # Express API route configurations
```

---

## 💻 Standalone Local Execution Guide

To run your decoupled client and server locally:

### 1. Terminal 1: Backend Express API
```bash
cd server
npm install
npm run dev
```
* **Runs on:** [http://localhost:5000](http://localhost:5000)
* **Configuration:** Loads your database credentials directly from `server/.env`.
* **Standard `.env` Format**:
  ```text
  PORT=5000
  MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager
  JWT_SECRET=super_secret_jwt_key_123_abc_xyz
  JWT_EXPIRE=30d
  NODE_ENV=development
  ```

### 2. Terminal 2: Frontend React (Vite) Client
```bash
cd client
npm install
npm run dev
```
* **Runs on:** [http://localhost:3000](http://localhost:3000)
* **Configuration:** Automatically routes `/api` requests to port 5000 using Vite's internal development proxy.

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

## 🌐 Standalone Cloud Hosting Steps (Railway + Vercel)

By separating the client and server, we can deploy them independently to specialized hosting services for maximum performance and stability:

### 🖥️ A. Standalone Backend (Railway)
1. Initialize a new git repository, commit all files, and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "deploy: finalize isolated backend and frontend structure"
   # Push to your GitHub repo
   ```
2. Log into [Railway.app](https://railway.app/).
3. Click **New Project** and select **Deploy from GitHub repo**. Select your `team-task-manager` repository.
4. In your Railway service dashboard, go to **Settings** -> **General** -> **Root Directory** and set it to **`server`**.
   - *This ensures Railway only builds the server subdirectory and uses the optimized standalone `/server/Dockerfile`!*
5. Go to the **Variables** tab and add:
   - `MONGODB_URI`: (Your Atlas MongoDB connection string)
   - `JWT_SECRET`: `your_secure_random_string`
   - `JWT_EXPIRE`: `30d`
   - `NODE_ENV`: `production`
6. Click **Deploy**! Once completed, your backend will be live (e.g. `https://your-backend.up.railway.app/api/health`).

### 🎨 B. Standalone Frontend (Vercel)
1. Log into [Vercel](https://vercel.com/).
2. Create a **New Project** and import the same GitHub repository.
3. In the project configure page, set the **Root Directory** to **`client`**.
4. Add the following **Environment Variable**:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://your-backend.up.railway.app/api` (Point this to your Railway URL with `/api` appended).
5. Click **Deploy**! Vercel will compile the React bundle and host it on a global CDN.
