

# 🖥️ Employee Management System – Server

This is the **backend API** for the **Employee Management System**, built with **Node.js, Express.js, and MongoDB**. It provides secure **role-based APIs** for managing employees, payroll requests, authentication, and authorization.

---

## 🚀 Features

✅ **JWT Authentication** for secure API access
✅ **Role-based Access Control** (Employee, HR, Admin)
✅ **CRUD Operations** for employees and payroll
✅ **Payroll Request & Approval Flow**
✅ **Middleware Protection** for admin/HR-only routes
✅ **MongoDB Database Integration**
✅ **CORS-enabled** for frontend communication
✅ **Environment-based configuration with dotenv**

---

## 🛠️ Tech Stack

* **Node.js + Express.js** → Backend framework
* **MongoDB + Mongoose** → Database
* **JWT (JSON Web Token)** → Authentication
* **dotenv** → Environment variable management
* **CORS** → Cross-Origin Resource Sharing

---

## 📂 Project Structure

```
server/
├── routes/           # Route definitions
│   ├── makePayment.js
│   ├── users.js
│   ├── payrollRoutes.js
│   ├── user.routes.js
├── index.js         # Main entry point
└── .env              # Environment variables
```

---

## 🔧 Installation & Setup

1️⃣ **Clone the repository**

```bash
git clone https://github.com/your-username/employee-management-system.git
cd employee-management-system/server
```

2️⃣ **Install dependencies**

```bash
npm install
```

3️⃣ **Create a `.env` file**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

4️⃣ **Run the server**

```bash
npm run dev   # For development (nodemon)
npm start     # For production
```

Server will start on **[http://localhost:5000](http://localhost:5000)**

---

## 🔑 API Authentication

All protected routes require a **JWT token** in the `Authorization` header:

```
Authorization: Bearer <your-token>
```

You can obtain the token from the **/auth/login** endpoint after a successful login.

---

## 📡 API Endpoints

### ✅ Auth Routes

| Method | Endpoint         | Description              |
| ------ | ---------------- | ------------------------ |
| POST   | `/auth/register` | Register new user        |
| POST   | `/auth/login`    | Login & get JWT token    |
| GET    | `/auth/me`       | Get current user details |

---

### ✅ Employee Routes

| Method | Endpoint                | Role Required | Description         |
| ------ | ----------------------- | ------------- | ------------------- |
| GET    | `/employees`            | HR/Admin      | Get all employees   |
| GET    | `/employees/:id`        | HR/Admin      | Get single employee |
| PATCH  | `/employees/:id/verify` | HR/Admin      | Verify employee     |
| POST   | `/employees`            | Admin         | Add new employee    |
| DELETE | `/employees/:id`        | Admin         | Delete an employee  |

---

### ✅ Payroll Routes

| Method | Endpoint                       | Role Required | Description                  |
| ------ | ------------------------------ | ------------- | ---------------------------- |
| GET    | `/payroll`                     | HR/Admin      | Get all payroll requests     |
| POST   | `/payroll/request`             | HR            | Request payroll for employee |
| PATCH  | `/payroll/:id/approve`         | Admin         | Approve payroll request      |
| GET    | `/payroll/history/:employeeId` | Employee      | Get own salary history       |

---

## 🔒 Middleware

* **verifyToken** → Checks JWT validity
* **requireRole('HR')** → Allows only HR
* **requireRole('Admin')** → Allows only Admin

Example usage:

```js
router.post('/payroll/request', verifyToken, requireRole('HR'), requestPayroll);
```

---

## ✅ Admin Test Credentials

To test Admin routes, use:

* **Email:** `eagletheboss@eagle.com`
* **Password:** `@Eagleboss123`

After login, include the token in `Authorization: Bearer <token>`

---

## 🐞 Common Issues

* **CORS error?** → Ensure `CORS` middleware is enabled:

  ```js
  app.use(cors({ origin: "http://localhost:5173" }));
  ```
* **Token invalid?** → Check if `JWT_SECRET` in `.env` matches what frontend expects
* **MongoDB connection failed?** → Ensure `MONGO_URI` is correct

---

## 📝 Future Enhancements

* ✅ WebSocket for real-time payroll updates
* ✅ Activity logs for all actions
* ✅ Payment gateway integration
* ✅ Advanced filtering & pagination

---

## 📜 License

This project is for **educational purposes**. You’re free to modify & use it.

