'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, User, Calendar, Phone, Mail, MapPin, FileText } from 'lucide-react';

export default function BookTicket() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    idProofType: '',
    idProofNumber: '',
    isRegistered: false,
    concessionType: '',
    concessionProof: ''
  });
  const [step, setStep] = useState(1);

  const trainNumber = searchParams.get('train');
  const date = searchParams.get('date');
  const classType = searchParams.get('class');
  const passengers = searchParams.get('passengers');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Store user details in localStorage temporarily
    localStorage.setItem('bookingDetails', JSON.stringify({
      ...formData,
      trainNumber,
      date,
      classType,
      passengers
    }));
    router.push('/payment');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const goToNextStep = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header with booking info summary */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white text-center">Book Your Journey</h1>
        <div className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-white">
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg"><span className="opacity-80">Train:</span> {trainNumber}</div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg"><span className="opacity-80">Date:</span> {date}</div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg"><span className="opacity-80">Class:</span> {classType}</div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg"><span className="opacity-80">Passengers:</span> {passengers}</div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between mb-6 px-8">
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-indigo-600' : 'bg-indigo-300/30 text-white/70'}`}>
              <User size={20} />
            </div>
            <span className={`text-sm mt-2 font-medium ${step >= 1 ? 'text-white' : 'text-white/70'}`}>Details</span>
          </div>
          <div className="flex-1 flex items-center">
            <div className={`h-1 w-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-indigo-600' : 'bg-indigo-300/30 text-white/70'}`}>
              <FileText size={20} />
            </div>
            <span className={`text-sm mt-2 font-medium ${step >= 2 ? 'text-white' : 'text-white/70'}`}>Identity</span>
          </div>
          <div className="flex-1 flex items-center">
            <div className={`h-1 w-full ${step >= 3 ? 'bg-white' : 'bg-white/30'}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-indigo-600' : 'bg-indigo-300/30 text-white/70'}`}>
              <CreditCard size={20} />
            </div>
            <span className={`text-sm mt-2 font-medium ${step >= 3 ? 'text-white' : 'text-white/70'}`}>Payment</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h2 className="text-xl font-semibold text-white md:col-span-2">Personal Information</h2>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm placeholder-white/60"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm placeholder-white/60"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white mb-1">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">
                  <Phone size={16} />
                </span>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm placeholder-white/60"
                  placeholder="Your contact number"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-white mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-300">
                  <Calendar size={16} />
                </span>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm placeholder-white/60"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-white mb-1">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm"
                required
              >
                <option value="" className="text-gray-800">Select Gender</option>
                <option value="Male" className="text-gray-800">Male</option>
                <option value="Female" className="text-gray-800">Female</option>
                <option value="Other" className="text-gray-800">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-white mb-1">
                Address
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-indigo-300">
                  <MapPin size={16} />
                </span>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm placeholder-white/60"
                  rows={2}
                  placeholder="Your current address"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="button"
                onClick={goToNextStep}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Continue to Identity Verification
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <h2 className="text-xl font-semibold text-white md:col-span-2">Identity & Concession Details</h2>
            
            <div>
              <label htmlFor="idProofType" className="block text-sm font-medium text-white mb-1">
                ID Proof Type
              </label>
              <select
                id="idProofType"
                name="idProofType"
                value={formData.idProofType}
                onChange={handleChange}
                className="w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm"
                required
              >
                <option value="" className="text-gray-800">Select ID Proof</option>
                <option value="Aadhar" className="text-gray-800">Aadhar</option>
                <option value="PAN" className="text-gray-800">PAN</option>
                <option value="Passport" className="text-gray-800">Passport</option>
                <option value="Voter ID" className="text-gray-800">Voter ID</option>
                <option value="Driving License" className="text-gray-800">Driving License</option>
              </select>
            </div>

            <div>
              <label htmlFor="idProofNumber" className="block text-sm font-medium text-white mb-1">
                ID Proof Number
              </label>
              <input
                type="text"
                id="idProofNumber"
                name="idProofNumber"
                value={formData.idProofNumber}
                onChange={handleChange}
                className="w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm placeholder-white/60"
                placeholder="Enter your ID number"
                required
              />
            </div>

            <div className="md:col-span-2 bg-white/20 backdrop-blur-md rounded-lg p-6">
              <h3 className="text-sm font-medium text-white mb-4">Concession Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="concessionType" className="block text-sm font-medium text-white mb-1">
                    Concession Type
                  </label>
                  <select
                    id="concessionType"
                    name="concessionType"
                    value={formData.concessionType}
                    onChange={handleChange}
                    className="w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm"
                  >
                    <option value="" className="text-gray-800">No Concession</option>
                    <option value="Senior Citizen" className="text-gray-800">Senior Citizen</option>
                    <option value="Student" className="text-gray-800">Student</option>
                    <option value="Military" className="text-gray-800">Military Personnel</option>
                    <option value="Disabled" className="text-gray-800">Disabled Person</option>
                  </select>
                </div>

                {formData.concessionType && (
                  <div>
                    <label htmlFor="concessionProof" className="block text-sm font-medium text-white mb-1">
                      Concession Proof Number
                    </label>
                    <input
                      type="text"
                      id="concessionProof"
                      name="concessionProof"
                      value={formData.concessionProof}
                      onChange={handleChange}
                      className="w-full rounded-lg border-0 bg-white/10 text-white py-3 px-3 shadow-sm focus:ring-2 focus:ring-white backdrop-blur-sm placeholder-white/60"
                      placeholder="Enter proof ID number"
                      required={formData.concessionType !== ''}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 backdrop-blur-md rounded-lg p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isRegistered"
                  name="isRegistered"
                  checked={formData.isRegistered}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-white/30 rounded"
                />
                <label htmlFor="isRegistered" className="ml-3 block text-sm text-white">
                  Register as a member for faster bookings in the future
                </label>
              </div>
              {formData.isRegistered && (
                <p className="text-xs text-white/80 mt-2 ml-8">
                  By registering, your details will be saved securely for future bookings, 
                  allowing for a faster checkout experience.
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-between pt-4 gap-4">
              <button
                type="button"
                onClick={goToPrevStep}
                className="w-full flex justify-center items-center py-3 px-4 border border-white/30 rounded-lg shadow-md text-sm font-medium text-white bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Proceed to Payment
                <CheckCircle size={18} className="ml-2" />
              </button>
            </div>
          </div>
        )}
      </form>
      
      {/* Help section */}
      <div className="max-w-4xl mx-auto mt-12">
        <div className="flex items-center justify-center px-6 py-4 bg-white/10 backdrop-blur-sm rounded-lg">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-white">Need help with your booking?</h3>
            <p className="text-sm text-white/80">
              Call our customer support at <span className="font-medium">1800-123-4567</span> (Toll Free)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}