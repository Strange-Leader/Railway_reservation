import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(request) {
  try {
    const bookingData = await request.json();
    const {
      name,
      email,
      phone,
      address,
      dateOfBirth,
      gender,
      idProofType,
      idProofNumber,
      isRegistered,
      trainNumber,
      date,
      classType,
      paymentMode,
      passengers,
      concessionType,
      concessionProof,
    } = bookingData;

    const connection = await pool.getConnection();

    try {
      // First, call the procedure
      await connection.query(
        `CALL book_ticket(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @result)`,
        [
          name,
          email,
          phone,
          address,
          dateOfBirth,
          gender,
          idProofType,
          idProofNumber,
          isRegistered,
          trainNumber,
          date,
          classType,
          paymentMode,
          passengers,
          concessionType || null,
          concessionProof || null,
        ]
      );

      // Then, get the result
      const [result] = await connection.query(
        "SELECT @result as booking_result"
      );
      const bookingResult = JSON.parse(result[0].booking_result);

      if (!bookingResult.success) {
        return NextResponse.json(
          { error: "Failed to book ticket" },
          { status: 500 }
        );
      }

      return NextResponse.json(bookingResult);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to book ticket. Please try again." },
      { status: 500 }
    );
  }
}

function generatePNR() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return timestamp.slice(-6) + random;
}
