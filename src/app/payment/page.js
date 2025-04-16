'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Train, MapPin, Calendar, User, Check, Clock } from 'lucide-react';

export default function Payment() {
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    const details = localStorage.getItem('bookingDetails');
    if (!details) {
      router.push('/home');
      return;
    }
    setBookingDetails(JSON.parse(details));
  }, [router]);

  const handlePayment = async (paymentMode) => {
    setPaymentMethod(paymentMode);
    setLoading(true);
    try {
      const response = await fetch('/api/book-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingDetails,
          paymentMode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Clear booking details from localStorage
      localStorage.removeItem('bookingDetails');
      
      // Redirect to booking confirmation page
      router.push(`/booking-confirmation?pnr=${data.pnr}`);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
      setPaymentMethod(null);
    }
  };

  if (!bookingDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Payment</h1>
          <p className="text-white/80 text-lg">
            Secure your journey with a simple payment
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <Train size={20} className="text-white mr-2" />
            <h2 className="text-xl font-semibold text-white">Booking Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70">Train Number</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.trainNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Train Name</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.trainName || 'Express Train'}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Class</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.classType}</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-white/70">Journey Date</p>
                  <p className="text-lg font-medium text-white">{new Date(bookingDetails.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Passenger</p>
                  <p className="text-lg font-medium text-white">{bookingDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-white/70">Total Amount</p>
                  <p className="text-2xl font-bold text-white">₹{bookingDetails.fare || '1,249'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-start space-x-2">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-white mr-1" />
                <p className="text-white/80">{bookingDetails.source || 'Mumbai'}</p>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="flex-1 h-0.5 bg-white/50 mx-2"></div>
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-white mr-1" />
                <p className="text-white/80">{bookingDetails.destination || 'Delhi'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Options Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <CreditCard size={20} className="text-white mr-2" />
            <h2 className="text-xl font-semibold text-white">Payment Options</h2>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => handlePayment('Online')}
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 font-medium transition-colors disabled:opacity-70"
            >
              {loading && paymentMethod === 'Online' ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-indigo-700 border-solid rounded-full animate-spin mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  Pay Online Now
                </>
              )}
            </button>
            
            <button
              onClick={() => handlePayment('Offline')}
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-6 border border-white rounded-xl shadow-md text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 font-medium transition-colors disabled:opacity-70"
            >
              {loading && paymentMethod === 'Offline' ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-3"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 mr-2" />
                  Pay at Station
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="bg-white/20 rounded-full p-2">
                <CreditCard size={16} className="text-white" />
              </div>
            </div>
            <p className="text-sm text-white/80">
              All online payments are secure and encrypted. Your payment details are never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}