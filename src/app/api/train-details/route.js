// src/app/api/train-details/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainNumber = searchParams.get('trainNumber');

    if (!trainNumber) {
      return NextResponse.json(
        { error: 'Train number is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Call the get_train_details function
      const [result] = await connection.query(
        `SELECT COALESCE(get_train_details(?), '{}') as train_details`,
        [trainNumber]
      );

      const trainDetails = JSON.parse(result[0].train_details);

      if (!trainDetails.trainNumber) {
        return NextResponse.json(
          { error: 'Train not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(trainDetails);

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error fetching train details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch train details' },
      { status: 500 }
    );
  }
}