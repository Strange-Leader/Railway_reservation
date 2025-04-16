'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calendar, MapPin, Train, ArrowRight, CheckCircle, User } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    date: '',
    passengers: 1,
    class: 'economy',
  });

  const [isSearching, setIsSearching] = useState(false);
  
  // Popular stations for quick selection
  const popularStations = [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams({
      source: formData.source,
      destination: formData.destination,
      date: formData.date,
      passengers: formData.passengers,
      class: formData.class
    });
    router.push(`/search-results?${queryParams.toString()}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const swapStations = () => {
    setFormData(prev => ({
      ...prev,
      source: prev.destination,
      destination: prev.source
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="p-8">
            <div className="flex items-center">
              <Train className="text-white h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold text-white">TrainFinder</h1>
            </div>
            <p className="text-white/80 mt-2">Find and book the best train tickets for your journey</p>
          </div>
          
          {/* Main Form */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source & Destination with swap button */}
                <div className="relative">
                  <label htmlFor="source" className="block text-sm font-medium text-white/80 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-white" />
                    From
                  </label>
                  <input
                    type="text"
                    id="source"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-white/20 bg-white/10 text-white shadow-sm focus:border-white/40 focus:ring-white/40 pl-3 pr-10 py-3"
                    placeholder="Enter source station"
                    list="sourceStations"
                    required
                  />
                  <datalist id="sourceStations">
                    {popularStations.map(station => (
                      <option key={station} value={station} />
                    ))}
                  </datalist>
                </div>
                
                <div className="relative">
                  <label htmlFor="destination" className="block text-sm font-medium text-white/80 mb-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-white" />
                    To
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-white/20 bg-white/10 text-white shadow-sm focus:border-white/40 focus:ring-white/40 pl-3 pr-10 py-3"
                    placeholder="Enter destination station"
                    list="destStations"
                    required
                  />
                  <datalist id="destStations">
                    {popularStations.map(station => (
                      <option key={station} value={station} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Swap button positioned between source and destination */}
              <div className="flex justify-center -mt-3 mb-3">
                <button
                  type="button"
                  onClick={swapStations}
                  className="bg-white/20 rounded-full p-2 shadow-md hover:bg-white/30 transition-colors"
                >
                  <ArrowRight className="h-5 w-5 text-white transform rotate-90" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date picker */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-white/80 mb-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-white" />
                    Journey Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-white/20 bg-white/10 text-white shadow-sm focus:border-white/40 focus:ring-white/40 py-3"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                {/* Passengers */}
                <div>
                  <label htmlFor="passengers" className="block text-sm font-medium text-white/80 mb-1">
                    Passengers
                  </label>
                  <select
                    id="passengers"
                    name="passengers"
                    value={formData.passengers}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-white/20 bg-white/10 text-white shadow-sm focus:border-white/40 focus:ring-white/40 py-3"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
                
                {/* Class */}
                <div>
                  <label htmlFor="class" className="block text-sm font-medium text-white/80 mb-1">
                    Class
                  </label>
                  <select
                    id="class"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-white/20 bg-white/10 text-white shadow-sm focus:border-white/40 focus:ring-white/40 py-3"
                  >
                    <option value="First Class AC">First Class AC</option>
                    <option value="Second Class AC">Second Class AC</option>
                    <option value="Third Class AC">Third Class AC</option>
                    <option value="Sleeper Class">Sleeper Class</option>
                    <option value="Chair Car">Chair Car</option>
                    <option value="Second Sitting">Second Sitting</option>
                    <option value="Executive Chair Car">Executive Chair Car</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white text-lg font-medium transition-colors"
              >
                {isSearching ? (
                  <>
                    <span className="animate-pulse mr-2">Searching</span>
                    <div className="w-5 h-5 border-t-2 border-indigo-700 border-solid rounded-full animate-spin"></div>
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search Trains
                  </>
                )}
              </button>
            </form>
            
            {/* Quick tips section */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="text-sm font-medium text-white/80 mb-3">Quick Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                  <p className="text-white/80">Book in advance for the best fares</p>
                </div>
                <div className="flex items-start space-x-2">
                  <Train className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                  <p className="text-white/80">Off-peak tickets are usually cheaper</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PNR Status Check Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-white mr-2" />
              <h2 className="text-xl font-bold text-white">Check PNR Status</h2>
            </div>
            <p className="text-white/80 text-sm">Enter your PNR number to check booking status</p>
          </div>
          
          <div className="p-6 md:p-8">
            <form onSubmit={(e) => {
              e.preventDefault();
              const pnr = e.target.pnr.value;
              if (pnr) {
                router.push(`/booking-confirmation?pnr=${pnr}`);
              }
            }} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="pnr" className="block text-sm font-medium text-white/80 mb-1">
                  PNR Number
                </label>
                <input
                  type="text"
                  id="pnr"
                  name="pnr"
                  maxLength="10"
                  placeholder="Enter 10-digit PNR number"
                  className="block w-full rounded-lg border-white/20 bg-white/10 text-white shadow-sm focus:border-white/40 focus:ring-white/40 py-3 px-4"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors shadow-lg font-medium"
                >
                  Check Status
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Recent Bookings - New Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex items-center mb-2">
              <User className="h-5 w-5 text-white mr-2" />
              <h2 className="text-xl font-bold text-white">Your Recent Bookings</h2>
            </div>
            <p className="text-white/80 text-sm">View and manage your recent train bookings</p>
          </div>
          
          <div className="p-6">
            <div className="text-center py-6">
              <p className="text-white/70 mb-4">Sign in to view your recent bookings</p>
              <button className="px-6 py-3 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors shadow-lg font-medium">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}