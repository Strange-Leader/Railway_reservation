'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Train, MapPin, Calendar, User, Clock, Filter, AlertCircle } from 'lucide-react';

export default function SearchResults() {
  const searchParams = useSearchParams();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const source = searchParams.get('source');
  const destination = searchParams.get('destination');
  const date = searchParams.get('date');
  const classType = searchParams.get('class');
  const passengers = searchParams.get('passengers');

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        const response = await fetch(
          `/api/search-trains?source=${source}&destination=${destination}&date=${date}${classType ? `&class=${classType}` : ''}`
        );
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch trains');
        }
        
        setTrains(data.trains);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };  

    if (source && destination && date) {
      fetchTrains();
    }
  }, [source, destination, date, classType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8">
          <div className="text-center">
            <div className="w-12 h-12 border-t-2 border-white border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-white">Searching for trains...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-white" />
            </div>
            <p className="text-white text-xl mb-4">Error: {error}</p>
            <Link href="/home" className="mt-4 inline-block px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-indigo-50 transition-colors font-medium">
              Try another search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with brand */}
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mr-3">
            <Train size={20} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TrainFinder</h1>
        </div>
        
        {/* Search summary card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-6 text-white border-b border-white/20 pb-2">Journey Details</h2>
          
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="flex flex-col items-center mr-3">
                <div className="w-3 h-3 rounded-full bg-green-400 mb-1"></div>
                <div className="w-0.5 h-16 bg-white/30"></div>
                <div className="w-3 h-3 rounded-full bg-red-400 mt-1"></div>
              </div>
              
              <div>
                <div className="mb-4">
                  <p className="text-sm text-white/70">From</p>
                  <p className="text-lg font-semibold text-white">{source}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">To</p>
                  <p className="text-lg font-semibold text-white">{destination}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/70">Date</p>
                  <p className="font-medium text-white">{new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}</p>
                </div>
                {classType && (
                  <div>
                    <p className="text-white/70">Class</p>
                    <p className="font-medium capitalize text-white">{classType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Modify search button */}
          <div className="mt-4 text-center">
            <button onClick={() => window.history.back()} className="text-white hover:text-white/80 font-medium flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Modify search
            </button>
          </div>
        </div>

        {/* No trains message */}
        {trains.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No Trains Found</h2>
            <p className="text-white/80 mb-6">We couldn't find any trains matching your search criteria.</p>
            <Link href="/home" className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 font-medium transition-colors">
              Try Another Search
            </Link>
          </div>
        ) : (
          <>
            {/* Results count and sorting */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Train size={16} className="text-white mr-2" />
                <p className="text-white font-medium">{trains.length} trains found</p>
              </div>
              <div className="flex items-center">
                <Filter size={16} className="text-white mr-2" />
                <select className="text-sm rounded-md bg-white/10 border-white/30 text-white focus:border-white focus:ring-white">
                  <option>Sort by: Departure</option>
                  <option>Sort by: Duration</option>
                  <option>Sort by: Price</option>
                </select>
              </div>
            </div>
            
            {/* Train cards */}
            <div className="space-y-6">
              {trains.map((train) => (
                <div key={train.trainNumber} className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
                  {/* Train header with name/number */}
                  <div className="bg-indigo-900/50 p-4 text-white">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Train size={20} className="text-white mr-3" />
                        <div>
                          <h2 className="text-xl font-bold">{train.trainName}</h2>
                          <p className="text-white/80 text-sm">{train.trainNumber} • {train.trainType}</p>
                        </div>
                      </div>
                      <div className="bg-indigo-700/50 text-white text-sm px-3 py-1 rounded-full">
                        {train.totalStops === 0 ? 'Direct' : `${train.totalStops} stops`}
                      </div>
                    </div>
                  </div>
                  
                  {/* Train details */}
                  <div className="p-6">
                    {/* Journey timing info */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{train.departureTime}</p>
                        <p className="text-sm text-white/70">{source}</p>
                      </div>
                      
                      <div className="flex-1 px-6 flex flex-col items-center">
                        <p className="text-sm text-white/70 mb-1">{train.duration}</p>
                        <div className="w-full flex items-center">
                          <div className="h-0.5 flex-1 bg-white/30"></div>
                          <Clock size={20} className="text-white mx-2" />
                          <div className="h-0.5 flex-1 bg-white/30"></div>
                        </div>
                        <p className="text-sm text-white/70 mt-1">{train.distance} km</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-3xl font-bold text-white">{train.arrivalTime}</p>
                        <p className="text-sm text-white/70">{destination}</p>
                      </div>
                    </div>

                    {/* Available classes section */}
                    <h3 className="text-lg font-semibold mb-4 border-b border-white/20 pb-2 text-white">Available Classes</h3>
                    <div className="grid gap-4">
                      {train.classes.map((trainClass) => (
                        <div key={trainClass.classType} className="border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors">
                          <div className="flex flex-col md:flex-row justify-between md:items-center">
                            <div className="mb-4 md:mb-0">
                              <div className="flex items-center">
                                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{
                                  backgroundColor: trainClass.availableSeats > 20 ? '#10B981' : 
                                                  trainClass.availableSeats > 0 ? '#F59E0B' : '#EF4444'
                                }}></span>
                                <p className="font-medium text-lg capitalize text-white">{trainClass.classType}</p>
                              </div>
                              <p className="text-3xl font-bold text-white mt-1">₹{trainClass.fare}</p>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-6 text-sm p-3 bg-white/10 rounded-lg mb-4 md:mb-0 md:mr-4">
                              <div>
                                <p className="text-white/70">Available</p>
                                <p className="font-medium text-green-400">{trainClass.availableSeats}</p>
                              </div>
                              <div>
                                <p className="text-white/70">RAC</p>
                                <p className="font-medium text-yellow-400">{trainClass.racSeats}</p>
                              </div>
                              <div>
                                <p className="text-white/70">Waitlist</p>
                                <p className="font-medium text-red-400">{trainClass.waitlistCount}</p>
                              </div>
                            </div>
                            
                            <Link
                              href={`/book-ticket?train=${train.trainNumber}&date=${date}&class=${trainClass.classType}&passengers=${passengers}`}
                              className="flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-md text-base font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-colors"
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* More options */}
            <div className="text-center mt-8">
              <p className="text-white/80 mb-4">Can't find what you're looking for?</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={`/search-results?source=${destination}&destination=${source}&date=${date}${classType ? `&class=${classType}` : ''}`} className="px-6 py-3 bg-white/10 border border-white/30 rounded-xl text-white hover:bg-white/20 transition-colors">
                  Try Reverse Journey
                </Link>
                <Link href="/home" className="px-6 py-3 bg-white/10 border border-white/30 rounded-xl text-white hover:bg-white/20 transition-colors">
                  New Search
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}