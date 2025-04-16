import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { pnr, reason } = await request.json();

    const connection = await pool.getConnection();

    try {
      // Call the cancellation procedure
      await connection.query(
        `CALL cancel_ticket(?, ?, @result)`,
        [pnr, reason]
      );

      // Get the result
      const [result] = await connection.query('SELECT @result as cancellation_result');
      const cancellationResult = JSON.parse(result[0].cancellation_result);

      if (!cancellationResult.success) {
        return NextResponse.json(
          { error: 'Failed to cancel ticket' },
          { status: 500 }
        );
      }

      return NextResponse.json(cancellationResult);

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel ticket. Please try again.' },
      { status: 500 }
    );
  }
}