# 🔍 User Lookup API

This is a full-stack application that allows you to store user information in a MongoDB database and retrieve it through keyword-based queries. Built using **Express.js** for the backend and **MongoDB** as the database.

---

## 🚀 Features

- Add and store user information (name, email, role, etc.)
- Query users by keyword (e.g., name or role)
- JSON API responses
- Built for integration with a React frontend

---

## 🧠 Technologies Used

- **Node.js / Express** for backend server
- **MongoDB** with Mongoose for database
- **Render** for deployment (backend & frontend)
- **React** (if used in `client/`)

---

## 📦 API Endpoints

### `GET /api/users?keyword=value`

Search for users by name, email, or any supported field.

#### Example:

