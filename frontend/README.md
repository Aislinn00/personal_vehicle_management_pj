# 🚗 Personal Vehicle Management System

A full-stack web application for managing personal vehicles, including maintenance records, reminders, and vehicle images.  
The system is built with a React + Tailwind frontend, a Flask REST API backend, MySQL for data persistence, and Azure Blob Storage for image handling.

---

## 📌 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- User-specific data access with strict ownership enforcement

### 🚘 Vehicle Management
- Create, view, update, and delete vehicles
- Vehicles are scoped to authenticated users only

### 🛠 Maintenance Records
- Add, update, view, and delete maintenance logs
- Fields include service date, maintenance type, cost, and status
- Server-side validation and access control

### ⏰ Reminders
- Create reminders per vehicle
- Support for date-based and mileage-based reminders
- Mark reminders as completed
- Filter reminders by status (upcoming / completed)

### 🖼 Vehicle Images
- Upload vehicle images
- Images stored in Azure Blob Storage
- Image URLs persisted in MySQL
- Soft delete with ownership validation
- Responsive image gallery with improved UX

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- React Router

### Backend
- Python (Flask)
- Flask-CORS
- JWT Authentication
- MySQL

### Storage & Deployment
- Azure Blob Storage (vehicle images)
- Backend deployed on Render
- Frontend deployed on Vercel

---

## 🗂 Project Structure

```text
├── backend/
│   ├── routes/             # Flask route blueprints (vehicles, maintenance, reminders, images)
│   ├── utils/              # Utility modules (auth, Azure Blob integration)
│   ├── app.py              # Flask application entry point
│   └── db.py               # Database connection handling
│
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # Axios API clients
│   │   ├── assets/         # Images and static resources
│   │   ├── auth/           # Authentication-related pages
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state (auth, user context)
│   │   ├── layouts/        # Layout wrappers
│   │   ├── maintenance/    # Maintenance feature pages
│   │   ├── reminders/      # Reminder feature pages
│   │   ├── routes/         # Application routing configuration
│   │   ├── vehicleImages/  # Vehicle image upload & gallery
│   │   ├── vehicles/       # Vehicle management pages
│   │   ├── App.jsx         # Root application component
│   │   ├── config.js       # App configuration
│   │   ├── index.css       # Global styles (Tailwind)
│   │   └── main.jsx        # Application entry point
│   └── eslint.config.js    # ESLint configuration
