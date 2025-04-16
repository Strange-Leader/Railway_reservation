import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pnr = searchParams.get('pnr');

    if (!pnr) {
      return NextResponse.json(
        { error: 'PNR number is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Call the get_booking_details function
      const [result] = await connection.query(
        `SELECT COALESCE(get_booking_details(?), '{}') as booking_details`,
        [pnr]
      );

      const bookingDetails = JSON.parse(result[0].booking_details);

      if (!bookingDetails.pnr) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(bookingDetails);

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching booking details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}

function calculateAge(dateOfBirth) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
} 