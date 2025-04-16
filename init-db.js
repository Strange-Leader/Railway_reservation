import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  let connection;
  try {
    // First connect without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "test",
      port: process.env.DB_PORT || 3306,
    });

    console.log("Connected to MySQL server successfully");

    // Create database if it doesn't exist
    try {
      await connection.query(
        `CREATE DATABASE IF NOT EXISTS ${
          process.env.DB_NAME || "railway_reservation"
        }`
      );
      console.log("Database created or already exists");
    } catch (error) {
      if (error.code !== "ER_DB_CREATE_EXISTS") {
        throw error;
      }
      console.log("Database already exists");
    }

    // Use the database
    await connection.query(
      `USE ${process.env.DB_NAME || "railway_reservation"}`
    );
    console.log(
      "Using database:",
      process.env.DB_NAME || "railway_reservation"
    );

    // Read the SQL file
    const sqlFile = fs.readFileSync(
      path.join(process.cwd(), "Table.txt"),
      "utf8"
    );

    // Split the file into individual statements and filter out database creation
    const statements = sqlFile
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => {
        // Skip database creation statements and empty statements
        return (
          statement.length > 0 &&
          !statement.toLowerCase().includes("create database") &&
          !statement.toLowerCase().includes("use database")
        );
      });

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (const statement of statements) {
      try {
        await connection.query(statement);
        console.log("Successfully executed SQL statement");
      } catch (error) {
        // If table already exists, log and continue
        if (error.code === "ER_TABLE_EXISTS_ERROR") {
          console.log("Table already exists, skipping...");
          continue;
        }
        console.error("Error executing statement:", error.message);
        console.error("Failed statement:", statement);
        throw error;
      }
    }

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the initialization
initializeDatabase().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
