This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Access the Repository

You can download the repository using one of the following methods:

- Using `wget`:
  ```bash
  wget https://github.com/Strange-Leader/Railway_reservation.git
  ```

- Using `git clone`:
  ```bash
  git clone https://github.com/Strange-Leader/Railway_reservation.git
  ```

## Getting Started


### Step 1: Set up MySQL

1. Install and set up MySQL on your system.
2. Create a new database for the project.

### Step 2: Install Dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

### Step 3: Import Database Tables

1. Open the `Table.txt` file in the project directory.
2. Execute the SQL commands in `Table.txt` to create the necessary tables in your MySQL database.

### Step 4: Add SQL Queries

1. Navigate to `src/lib/sql/search_trains.sql`.
2. Execute the SQL queries in this file to add the required stored procedures or queries to your database.

### Step 5: Add Sample Data

1. Open the `sample_data.txt` file in the project directory.
2. Execute the SQL commands in `sample_data.txt` to populate the database with sample data.

### Step 6: Run the Development Server

Start the development server with the following command:

```bash
npm run dev
```

### Step 7: Access the Application

Open [http://localhost:3000/home](http://localhost:3000/home) in your browser to access the home page.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
