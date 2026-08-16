Claro. Te lo dejo como **`README.en.md`**, listo para copiar y subir al repositorio.

# DeportesURJC - University Sports Management Web App

This project is part of my Final Degree Project and is built using the **MERN stack**: **MongoDB Atlas**, **Express.js**, **React**, and **Node.js**.

---

## 🔧 Main Technologies

* **Frontend:** React + Vite
* **Backend:** Node.js + Express
* **Database:** MongoDB Atlas
* **Authentication:** Express Session + Connect-Mongo
* **Testing:** Jest + React Testing Library
* **Containers:** Docker + Docker Compose (optional for development and testing)

---

## ✨ Main Features

* **🔐 Complete authentication system:** Login/logout with persistent sessions
* **👥 User management:** Registration, profiles, and roles (admin/user)
* **🏢 Sports facility management:** Rooms, gyms, and courts
* **📅 Booking system:** Facility reservations by time slot
* **🏆 Internal leagues:** Team and sports result management
* **💰 Balance system:** Virtual balance for service payments
* **📧 Email notifications:** Confirmations and reminders
* **📱 Responsive design:** Optimized for mobile and desktop
* **🧪 Comprehensive testing:** Test coverage for both frontend and backend

---

## 🚀 Local Development Setup

### Prerequisites

* Node.js installed

### Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Alexrguez9/deportesURJC.git
   cd deportesURJC
   ```

2. Create a `.env` file inside the `backend/` directory with the following environment variables:

   ```env
   NODE_ENV=development
   BACKEND_PORT=4000
   FRONTEND_URL=http://localhost:8080
   MONGO_ATLAS_URI="mongodb+srv://username:<password>@cluster.mongodb.net/database?retryWrites=true&w=majority"
   MONGO_ATLAS_URI_TESTS="mongodb+srv://username:<password>@cluster.mongodb.net/database_test?retryWrites=true&w=majority"
   SESSION_SECRET=<SESSION_SECRET>
   SENDGRID_API_KEY=<sendgrid_api_key>
   EMAIL_SENDER=<your_verified_sendgrid_email>
   ADMIN_EMAIL=<administrator_email>
   ```

   **📱 Production application:**
   [https://deportes-urjc.vercel.app/](https://deportes-urjc.vercel.app/)

   ⚠️ **Important:**

   * Replace `<password>` with your MongoDB Atlas database password.
   * Replace `<SESSION_SECRET>` with a strong, secret string known only to you.
   * Set `<your_verified_sendgrid_email>` to an email address verified in SendGrid for sending emails.
   * Set `<administrator_email>` to identify administrator accounts.
   * **NEVER commit the `.env` file to the public repository** — it is included in `.gitignore` for security reasons.

3. Create a `.env` file inside the `frontend/` directory with the following variable:

   ```env
   VITE_API_URL=http://localhost:4000
   ```

   This allows frontend requests to connect to the backend through a configurable API URL.

4. Open two terminals:

   **Terminal 1 — Frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   **Terminal 2 — Backend:**

   ```bash
   cd backend
   npm install
   npm run dev
   ```

---

## 🌐 Production Application

The application is deployed and available at:

[https://deportes-urjc.vercel.app/](https://deportes-urjc.vercel.app/)

### Production Configuration

* **Frontend:** Deployed on Vercel
* **Backend:** Deployed on Render
* **Database:** MongoDB Atlas
* **Environment variables:** Configured on the respective deployment platforms

### Differences from Local Development

* `NODE_ENV=production`
* `FRONTEND_URL=https://deportes-urjc.vercel.app`
* `VITE_API_URL` points to the production backend
* Cookies are configured with `sameSite: 'None'` and `secure: true`

---

## 🐳 Docker Deployment (Optional)

The project can also be run using Docker containers to facilitate deployment and ensure reproducibility across different environments.

### Steps

1. Make sure **Docker** and **Docker Compose** are installed.

2. Create a `.env` file inside the `backend/` directory with the variables mentioned above.

3. Run:

   ```bash
   docker-compose up --build
   ```

   This will start the **frontend** and **backend** services connected to the **MongoDB Atlas** database.

---

## 🧪 Testing

The project includes comprehensive tests for both the frontend and backend.

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:coverage
```

### CI/CD Testing

Tests are automatically executed through **GitHub Actions** on every pull request and push to the main branches.

---

## ℹ️ Additional Notes

### Security and Configuration

* The `SESSION_SECRET` environment variable is essential for securing user sessions and must be kept secret.
* Use strong passwords and store them securely.
* In production, manage environment variables through the deployment platform and never commit them to the repository.

### Database

* The main database is managed through **MongoDB Atlas**.
* A separate database is used for testing, allowing functionality to be verified without affecting development data.
* Sessions are persistently stored in MongoDB using `connect-mongo`.

### Architecture

* **Frontend:** React with Vite for fast development and optimized builds.
* **Backend:** Express.js following an MVC (Model-View-Controller) architecture.
* **Authentication:** Secure session-based authentication without JWT tokens, suitable for web applications.
* **Testing:** Comprehensive testing using Jest and React Testing Library.

### Deployment

* **Frontend:** Deployed on **Vercel**
* **Backend:** Configured for **Render** or other Node.js hosting platforms
* **Database:** MongoDB Atlas
* **Docker:** Optional for local development and integration testing
* **CI/CD:** GitHub Actions for automated testing
