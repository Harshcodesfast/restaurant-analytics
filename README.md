# 🍽️ Restaurant Analytics

A Laravel-based web application for managing and analyzing restaurant data — including locations, cuisines, and ratings. This is a minimum viable product (MVP) built with simplicity in mind using Laravel, SQLite, and artisan seeders for easy setup and local development.

---

## 🚀 Features

-   Manage restaurant information (name, cuisine, location)
-   SQLite database for lightweight setup
-   Laravel migrations and seeders for demo data
-   RESTful API ready for frontend integration
-   Easily extendable for analytics and dashboard use

---

## 🧰 Tech Stack

-   **Backend:** Laravel 12
-   **Database:** SQLite
-   **Language:** PHP 8+
-   **Tools:** Composer, Artisan CLI

---

## 🛠️ Installation & Setup

Follow these steps to run the project locally 👇

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Harshcodesfast/restaurant-analytics.git
cd restaurant-analytics
```

###2️⃣ Install dependencies

```bash
Make sure you have Composer installed, then run:
composer install
npm install
```

###3️⃣ Copy the environment file

.env.example .env to .env

###4️⃣ Set up the SQLite database
create database\database.sqlite

###5️⃣ Generate the application key

```bash
php artisan key:generate
```

###6️⃣ Run migrations and seed demo data

```bash
php artisan migrate --seed
```
This will create tables and insert sample restaurant records.

###7️⃣ Start the development server

```bash
composer run dev
```
