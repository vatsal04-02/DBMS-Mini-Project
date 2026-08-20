# 🏨 Hotel Management System

A **DBMS-based Hotel Management System** developed as a mini project to demonstrate the practical implementation of **Database Management System concepts** using a full-stack web application.

The system helps manage hotel operations such as **rooms, guests, bookings, payments, staff, and hotel records** through a structured relational database.

---

## 📌 Project Overview

The **Hotel Management System** provides a centralized platform for managing hotel information and daily operations.

The main objective of this project is to apply DBMS concepts to a real-world problem while providing a user-friendly web interface.

The project demonstrates:

* Relational database design
* Primary and foreign keys
* Entity relationships
* Database normalization
* SQL queries
* CRUD operations
* Joins
* Constraints
* Data integrity
* Aggregation and reporting
* Backend–database connectivity

---

## 🎯 Objectives

* Manage hotel rooms and their availability.
* Store and manage guest information.
* Handle room reservations and bookings.
* Maintain payment records.
* Manage hotel staff information.
* Reduce data redundancy using database normalization.
* Maintain consistency and integrity of hotel data.
* Generate useful reports using SQL queries.
* Provide a web-based interface for interacting with the database.

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Development Tools

* Visual Studio Code
* MySQL Workbench
* Git & GitHub

---

## 🗄️ DBMS Concepts Implemented

This project focuses on applying important DBMS concepts in a practical application.

### 1. Relational Database

The system stores hotel data using multiple related tables instead of maintaining everything in a single table.

Examples include:

* Guests
* Rooms
* Bookings
* Payments
* Staff

---

### 2. Primary Keys

Each major entity has a unique identifier.

For example:

```text
guest_id
room_id
booking_id
payment_id
staff_id
```

Primary keys ensure that every record can be uniquely identified.

---

### 3. Foreign Keys

Foreign keys establish relationships between tables.

For example:

```text
Bookings → Guests
Bookings → Rooms
Payments → Bookings
```

This maintains referential integrity between related records.

---

### 4. Relationships

The database implements relationships such as:

```text
Guest 1 ──────── N Booking

Room  1 ──────── N Booking

Booking 1 ────── N Payment
```

These relationships represent real-world hotel operations.

---

### 5. Normalization

The database is designed using normalization principles to reduce:

* Data redundancy
* Update anomalies
* Insertion anomalies
* Deletion anomalies

The tables are organized into logically independent entities with relationships between them.

---

### 6. Constraints

Database constraints are used to maintain valid data.

Examples include:

* `PRIMARY KEY`
* `FOREIGN KEY`
* `NOT NULL`
* `UNIQUE`
* `CHECK`
* `DEFAULT`

These constraints help maintain database integrity.

---

### 7. CRUD Operations

The application performs the four fundamental database operations:

| Operation | Purpose                 |
| --------- | ----------------------- |
| Create    | Add new records         |
| Read      | Retrieve records        |
| Update    | Modify existing records |
| Delete    | Remove records          |

These operations are performed through the backend and reflected in the MySQL database.

---

### 8. SQL Queries

SQL is used to perform database operations such as:

* `SELECT`
* `INSERT`
* `UPDATE`
* `DELETE`
* `JOIN`
* `GROUP BY`
* `ORDER BY`
* Aggregate functions

Example:

```sql
SELECT r.room_id, r.room_type, r.price
FROM rooms r
WHERE r.status = 'Available';
```

---

## 🏗️ System Architecture

```text
┌─────────────────────────┐
│        Frontend         │
│     HTML/CSS/JS         │
└────────────┬────────────┘
             │
             │ HTTP Requests
             ▼
┌─────────────────────────┐
│        Backend          │
│    Node.js + Express    │
└────────────┬────────────┘
             │
             │ SQL Queries
             ▼
┌─────────────────────────┐
│        MySQL DB         │
│   Relational Database   │
└─────────────────────────┘
```

---

## 📂 Project Structure

```text
HOTEL-MANAGEMENT-SYSTEM/
│
├── hotel_backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── config/
│   └── ...
│
├── hotel_frontend/
│   ├── HTML files
│   ├── CSS files
│   ├── JavaScript files
│   └── ...
│
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   └── ...
│
├── .gitignore
└── README.md
```

> The exact structure may vary depending on the implementation.

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hotel-management-system.git
```

### 2. Navigate to the Project

```bash
cd HOTEL-MANAGEMENT-SYSTEM
```

### 3. Set Up MySQL Database

Open **MySQL Workbench** and create the database.

Run the SQL files provided in the project:

```text
database/schema.sql
database/seed.sql
```

The `schema.sql` file creates the required tables and relationships, while `seed.sql` inserts sample data.

---

### 4. Configure Database Connection

Update the database configuration in the backend with your MySQL credentials.

Example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hotel_management
DB_PORT=3306
```

> Do not upload your `.env` file to GitHub.

---

### 5. Install Backend Dependencies

```bash
cd hotel_backend
npm install
```

### 6. Start the Backend

```bash
npm start
```

or, depending on the project configuration:

```bash
node server.js
```

---

## 💾 Main Database Modules

### 👤 Guest Management

Stores guest information such as:

* Guest ID
* Name
* Contact information
* Email
* Address

---

### 🛏️ Room Management

Maintains:

* Room number
* Room type
* Room price
* Room status
* Availability

---

### 📅 Booking Management

Handles:

* Guest reservations
* Room allocation
* Check-in date
* Check-out date
* Booking status

---

### 💳 Payment Management

Maintains:

* Payment information
* Booking reference
* Payment amount
* Payment method
* Payment status

---

### 👨‍💼 Staff Management

Stores hotel staff details such as:

* Staff ID
* Name
* Department
* Role
* Contact information

---

## 📊 Database Operations & Reports

The system can generate useful information using SQL queries, such as:

* Available rooms
* Current bookings
* Guest booking history
* Revenue generated
* Room occupancy
* Payment records
* Staff information
* Booking statistics

SQL joins and aggregate functions can be used to generate these reports.

Example:

```sql
SELECT 
    r.room_type,
    COUNT(*) AS total_bookings
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
GROUP BY r.room_type;
```

---

## 🔐 Data Integrity

The database uses relational constraints to ensure that invalid or inconsistent data is not stored.

For example:

* A booking cannot reference a non-existent guest.
* A booking cannot reference a non-existent room.
* A payment must be associated with a valid booking.
* Unique identifiers prevent duplicate primary keys.

---

## 🚀 Future Enhancements

The system can be extended with:

* Online room booking
* User authentication and authorization
* Admin dashboard
* Automatic bill generation
* Email/SMS notifications
* Room availability calendar
* Advanced revenue analytics
* Customer reviews and ratings
* Payment gateway integration
* Role-based access control

---

## 🎓 Academic Relevance

This project demonstrates the practical application of concepts studied in **Database Management Systems (DBMS)**, including:

* ER Model
* Relational Model
* Primary Keys
* Foreign Keys
* Functional Dependencies
* Normalization
* SQL
* Joins
* Constraints
* CRUD Operations
* Data Integrity
* Database Connectivity
* Aggregation and Reporting

---

## 👨‍💻 Project Type

**Academic Mini Project — Database Management System**

**Domain:** Hotel Management
**Database:** MySQL
**Backend:** Node.js + Express.js
**Frontend:** HTML, CSS & JavaScript

---

## 📜 License

This project is developed for **educational and academic purposes**.
