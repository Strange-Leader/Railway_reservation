'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, X, Clock, AlertCircle, CreditCard, User, Calendar, Train, MapPin } from 'lucide-react';

export default function BookingConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pnr = searchParams.get('pnr');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancellationDetails, setShowCancellationDetails] = useState(false);
  const [cancellationDetails, setCancellationDetails] = useState(null);

  useEffect(() => {
    if (!pnr) {
      router.push('/home');
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const response = await fetch(`/api/booking-details?pnr=${pnr}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking details');
        }

        setBookingDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [pnr, router]);

  const handleCancelTicket = async () => {
    if (!cancellationReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch('/api/cancel-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pnr: bookingDetails.pnr,
          reason: cancellationReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel ticket');
      }

      // Store cancellation details and show the modal
      setCancellationDetails(data);
      setShowCancelModal(false);
      setShowCancellationDetails(true);
      
      // Refresh the booking details
      const bookingResponse = await fetch(`/api/booking-details?pnr=${bookingDetails.pnr}`);
      const bookingData = await bookingResponse.json();
      setBookingDetails(bookingData);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
          <p className="mt-6 text-white font-medium text-lg">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center backdrop-blur-sm bg-white/10 p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-white mb-6">{error}</p>
          <Link href="/home" className="inline-block px-6 py-3 bg-white text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!bookingDetails) {
    return null;
  }

  const getStatusIcon = () => {
    if (bookingDetails.bookingStatus === 'CANCELLED') {
      return <X size={28} className="text-white" />;
    } else if (bookingDetails.passengers.some(passenger => passenger.status === 'CONFIRMED')) {
      return <CheckCircle size={28} className="text-white" />;
    } else if (bookingDetails.bookingStatus === 'WAITING') {
      return <Clock size={28} className="text-white" />;
    } else {
      return <AlertCircle size={28} className="text-white" />;
    }
  };

  const getStatusColor = () => {
    if (bookingDetails.bookingStatus === 'CANCELLED') {
      return 'bg-red-500';
    } else if (bookingDetails.passengers.some(passenger => passenger.status === 'CONFIRMED')) {
      return 'bg-green-500';
    } else if (bookingDetails.bookingStatus === 'WAITING') {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with status message */}
        <div className="mb-8 text-center">
          <div className={`w-20 h-20 ${getStatusColor()} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {getStatusIcon()}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {bookingDetails.passengers.some(passenger => passenger.status === 'CANCELLED') ? 'Ticket Cancelled' : 'Booking Confirmed!'}
          </h1>
          <p className="text-white/80 text-lg">
            {bookingDetails.passengers.some(passenger => passenger.status === 'CANCELLED')   
              ? 'Your ticket has been cancelled.' 
              : 'Your ticket has been successfully booked.'}
          </p>
        </div>

        {/* PNR Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 text-center">
          <p className="text-white/70 mb-1">PNR Number</p>
          <p className="text-4xl font-bold text-white">{bookingDetails.pnr}</p>
        </div>

        {/* Journey Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center mb-4">
              <Train size={20} className="text-white mr-2" />
              <h2 className="text-xl font-semibold text-white">Train Details</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/70">Train Name & Number</p>
                <p className="text-lg font-medium text-white">{bookingDetails.trainName} ({bookingDetails.trainNumber})</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Class</p>
                <p className="text-lg font-medium text-white">{bookingDetails.classType}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Journey Date</p>
                <p className="text-lg font-medium text-white">{new Date(bookingDetails.journeyDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Status</p>
                <p className={`text-lg font-medium ${
                  bookingDetails.bookingStatus === 'CANCELLED' 
                    ? 'text-red-300' 
                    : 'text-green-300'
                }`}>
                  {bookingDetails.bookingStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center mb-4">
              <MapPin size={20} className="text-white mr-2" />
              <h2 className="text-xl font-semibold text-white">Route Details</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <div className="text-center">
                  <p className="text-sm text-white/70">From</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.sourceStation}</p>
                  <p className="text-sm font-medium text-white/90 mt-1">{bookingDetails.departureTime}</p>
                </div>
                
                <div className="flex items-center px-4">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                  <div className="flex-1 h-0.5 bg-white/50 mx-2"></div>
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-white/70">To</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.destinationStation}</p>
                  <p className="text-sm font-medium text-white/90 mt-1">{bookingDetails.arrivalTime}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Passenger Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <User size={20} className="text-white mr-2" />
            <h2 className="text-xl font-semibold text-white">Passenger Details</h2>
          </div>
          <div className="space-y-4">
            {bookingDetails.passengers.map((passenger, index) => (
              <div key={index} className="border-b border-white/20 pb-4 last:border-b-0 last:pb-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/70">Name</p>
                    <p className="text-lg font-medium text-white">{passenger.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Age/Gender</p>
                    <p className="text-lg font-medium text-white">{passenger.age} / {passenger.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Seat/Coach</p>
                    <p className="text-lg font-medium text-white">
                      {passenger.seatNumber ? `${passenger.seatNumber} / ${passenger.coachNumber}` : 'Not Allocated'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/70">Status</p>
                    <p className={`text-lg font-medium ${
                      passenger.status === 'CANCELLED' 
                        ? 'text-red-300' 
                        : 'text-green-300'
                    }`}>
                      {passenger.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <CreditCard size={20} className="text-white mr-2" />
            <h2 className="text-xl font-semibold text-white">Payment Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70">Total Fare</p>
                  <p className="text-2xl font-bold text-white">₹{bookingDetails.totalFare}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Payment Mode</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.payment.paymentMode}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70">Transaction ID</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.payment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Payment Status</p>
                  <p className={`text-lg font-medium ${
                    bookingDetails.payment.paymentStatus === 'Refunded' 
                      ? 'text-green-300' 
                      : 'text-white'
                  }`}>
                    {bookingDetails.payment.paymentStatus}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/home"
            className="px-8 py-4 bg-white text-indigo-700 rounded-xl font-medium hover:bg-indigo-50 transition-colors text-center shadow-lg"
          >
            Book Another Ticket
          </Link>
          {bookingDetails.bookingStatus !== 'CANCELLED' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-8 py-4 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg"
            >
              Cancel Ticket
            </button>
          )}
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h2 className="text-xl font-bold mb-4 text-indigo-800">Cancel Ticket</h2>
              <p className="text-gray-600 mb-4">
                Are you sure you want to cancel this ticket? Please provide a reason for cancellation.
              </p>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelTicket}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancellation Details Modal */}
        {showCancellationDetails && cancellationDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-indigo-800">Cancellation Details</h2>
                <button
                  onClick={() => setShowCancellationDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">PNR Number:</span>
                  <span className="font-medium text-indigo-700">{cancellationDetails.pnr}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Cancellation Charge:</span>
                  <span className="font-medium text-red-600">₹{cancellationDetails.cancellationCharge.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Refund Amount:</span>
                  <span className="font-medium text-green-600">₹{cancellationDetails.refundAmount.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 mt-2 bg-green-50 p-4 rounded-lg">
                  <p className="text-green-600 font-medium">{cancellationDetails.message}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCancellationDetails(false)}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}