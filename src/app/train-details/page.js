// src/app/train-details/page.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Train, Clock, MapPin, Users, Calendar, AlertCircle } from 'lucide-react';

export default function TrainDetailsPage() {
  const [trainNumber, setTrainNumber] = useState('');
  const [trainDetails, setTrainDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trainNumber) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/train-details?trainNumber=${trainNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch train details');
      }

      setTrainDetails(data);
    } catch (err) {
      setError(err.message);
      setTrainDetails(null);
    } finally {
      setLoading(false);
    }
  };

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
        
        {/* Search Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden mb-8">
          <div className="bg-indigo-900/50 py-4 px-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Search size={18} className="mr-2" />
              Train Details Search
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="Enter train number"
                  className="w-full rounded-lg border-white/30 bg-white/10 text-white placeholder-white/70 shadow-sm focus:border-white focus:ring-white py-3 px-4"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-white text-indigo-700 px-6 py-3 rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 font-medium transition-colors disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-indigo-700 border-solid rounded-full animate-spin mr-3 inline-block"></div>
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-8 border border-red-400/50">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-white">{error}</span>
            </div>
          </div>
        )}

        {/* Train Details */}
        {trainDetails && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden">
            <div className="bg-indigo-900/50 py-4 px-6">
              <div className="flex items-center">
                <Train size={20} className="text-white mr-3" />
                <div>
                  <h2 className="text-xl font-bold text-white">{trainDetails.trainName}</h2>
                  <p className="text-white/80">Train Number: {trainDetails.trainNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-2 text-white">
                  <Train className="h-5 w-5 text-white/80" />
                  <span>Type: {trainDetails.trainType}</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Users className="h-5 w-5 text-white/80" />
                  <span>Total Coaches: {trainDetails.totalCoaches}</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <MapPin className="h-5 w-5 text-white/80" />
                  <span>Route: {trainDetails.route.source} to {trainDetails.route.destination}</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Clock className="h-5 w-5 text-white/80" />
                  <span>Distance: {trainDetails.route.totalDistance} km</span>
                </div>
              </div>

              {/* Running Days */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-white border-b border-white/20 pb-2">Running Days</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Object.entries(trainDetails.runningDays).map(([day, runs]) => (
                    <div
                      key={day}
                      className={`p-2 rounded-lg text-center font-medium ${
                        runs ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-white border-b border-white/20 pb-2">Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/20">
                    <thead className="bg-indigo-900/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Station</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Arrival</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Departure</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Platform</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/20">
                      {trainDetails.schedule.map((stop, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{stop.stationName}</div>
                            <div className="text-sm text-white/70">{stop.city}, {stop.state}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {stop.arrivalTime || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {stop.departureTime || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {stop.distanceFromSource} km
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                            {stop.platformNumber || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Available Classes */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white border-b border-white/20 pb-2">Available Classes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trainDetails.classes.map((cls, index) => (
                    <div key={index} className="bg-white/10 p-4 rounded-lg border border-white/20 hover:bg-white/15 transition-colors">
                      <div className="font-medium text-white">{cls.classType}</div>
                      <div className="text-sm text-white/70">Seats: {cls.totalSeats}</div>
                      <div className="text-lg font-bold text-white mt-1">₹{cls.basicFare}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}