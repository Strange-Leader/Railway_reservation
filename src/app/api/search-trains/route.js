// app/api/search-trains/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';


// Helper function to filter trains based on search criteria
function filterTrains(source, destination, date, travelClass) {
  // Filter by source and destination (case-insensitive)
  let filteredTrains = trainSchedules.filter(train => 
    train.source.toLowerCase() === source.toLowerCase() && 
    train.destination.toLowerCase() === destination.toLowerCase()
  );

  // If travel class is specified, filter by available class
  if (travelClass && travelClass !== 'any') {
    filteredTrains = filteredTrains.filter(train => 
      train.class.includes(travelClass.toLowerCase())
    );
  }

  // Add the date to each train (not filtering by date in this mock implementation)
  return filteredTrains.map(train => ({
    ...train,
    date
  }));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');
    const classType = searchParams.get('class');

    if (!source || !destination || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();

    try {
      // Call the search_trains function
      // In src/app/api/search-trains/route.js
const [result] = await connection.query(
    `SELECT COALESCE(search_trains(?, ?, ?, ?), '[]') as trains`,
    [source, destination, date, classType]
  );
  
  // Parse the JSON result
  const trains = JSON.parse(result[0].trains);

      // Format the response
      const formattedTrains = trains.map(train => {
        const classes = train.class_info.split(',').map(classInfo => {
          const [classType, fare, availableSeats, racSeats, waitlistCount] = classInfo.split('|');
          return {
            classType,
            fare: parseFloat(fare),
            availableSeats: parseInt(availableSeats),
            racSeats: parseInt(racSeats),
            waitlistCount: parseInt(waitlistCount)
          };
        });
      // Format the response
      const formattedTrains = trains.map(train => {
        const classes = train.class_info.split(',').map(classInfo => {
          const [classType, fare, availableSeats, racSeats, waitlistCount] = classInfo.split('|');
          return {
            classType,
            fare: parseFloat(fare),
            availableSeats: parseInt(availableSeats),
            racSeats: parseInt(racSeats),
            waitlistCount: parseInt(waitlistCount)
          };
        });

        return {
          trainNumber: train.train_number,
          trainName: train.train_name,
          trainType: train.train_type,
          departureTime: train.source_departure,
          arrivalTime: train.dest_arrival,
          duration: calculateDuration(train.source_departure, train.dest_arrival),
          distance: train.total_distance,
          totalStops: train.total_stops,
          classes: classes
        };
      });
        return {
          trainNumber: train.train_number,
          trainName: train.train_name,
          trainType: train.train_type,
          departureTime: train.source_departure,
          arrivalTime: train.dest_arrival,
          duration: calculateDuration(train.source_departure, train.dest_arrival),
          distance: train.total_distance,
          totalStops: train.total_stops,
          classes: classes
        };
      });

      return NextResponse.json({ trains: formattedTrains });

    } finally {
      connection.release();
    }

      

  } catch (error) {
    console.error('Error searching trains:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateDuration(departure, arrival) {
  const depTime = new Date(`2000-01-01T${departure}`);
  const arrTime = new Date(`2000-01-01T${arrival}`);
  
  // Handle overnight journeys
  if (arrTime < depTime) {
    arrTime.setDate(arrTime.getDate() + 1);
  }
  
  const diffMs = arrTime - depTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

// Handle POST requests (for more complex search criteria)
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Extract search parameters from request body
    const { source, destination, date, class: travelClass, passengers } = body;
    
    // Validate required parameters
    if (!source || !destination || !date) {
      return NextResponse.json(
        { error: 'Missing required parameters. Please provide source, destination, and date.' },
        { status: 400 }
      );
    }
    
    // Simulate a slight delay as if we're fetching from a real API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Get filtered trains based on search criteria
    const trains = filterTrains(source, destination, date, travelClass);
    
    // Calculate total price based on passenger count
    const trainsWithTotalPrice = trains.map(train => ({
      ...train,
      totalPrice: (train.price * parseInt(passengers || 1)).toFixed(2)
    }));
    
    // Return the results
    return NextResponse.json({
      success: true,
      data: {
        trains: trainsWithTotalPrice,
        searchCriteria: {
          source,
          destination,
          date,
          class: travelClass,
          passengers: parseInt(passengers || 1)
        },
        count: trainsWithTotalPrice.length
      }
    });
  } catch (error) {
    console.error('Error processing search request:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}