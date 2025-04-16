import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function resetDatabase() {
  let connection;
  try {
    // First connect without database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "test",
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
    });

    console.log("Connected to MySQL server successfully");

    // Drop and recreate database
    await connection.query(
      `DROP DATABASE IF EXISTS ${process.env.DB_NAME || "railway_reservation"}`
    );
    await connection.query(
      `CREATE DATABASE ${process.env.DB_NAME || "railway_reservation"}`
    );
    console.log("Database recreated");

    // Use the database
    await connection.query(
      `USE ${process.env.DB_NAME || "railway_reservation"}`
    );
    console.log(
      "Using database:",
      process.env.DB_NAME || "railway_reservation"
    );

    // Read and execute tables.sql
    console.log("Creating tables...");
    const tablesSQL = fs.readFileSync(
      path.join(process.cwd(), "tables.sql"),
      "utf8"
    );
    await connection.query(tablesSQL);
    console.log("Tables created successfully");

    // Read and execute procedures.sql
    console.log("Creating procedures and functions...");
    const proceduresSQL = fs
      .readFileSync(path.join(process.cwd(), "procedures.sql"), "utf8")
      .split("DELIMITER ;")
      .filter((p) => p.trim())
      .map((p) => p.replace(/DELIMITER \/\//, "").trim());

    for (const procedure of proceduresSQL) {
      if (procedure.trim()) {
        try {
          await connection.query(procedure);
          console.log("Successfully created procedure/function");
        } catch (error) {
          console.error("Error creating procedure/function:", error.message);
          throw error;
        }
      }
    }

    console.log("Database reset completed successfully");
  } catch (error) {
    console.error("Error during database reset:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the reset
resetDatabase().catch((error) => {
  console.error("Failed to reset database:", error);
  process.exit(1);
});
