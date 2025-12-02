"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Info, Coffee, Camera, Wind, CheckCircle, ArrowRight, Download, Loader2, ArrowLeft, CreditCard, Wifi } from 'lucide-react';
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { db } from "@/lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Tour } from "@/types";
import { useSearchParams } from "next/navigation";

// --- Constants ---
const LOGO_PUBLIC_URL = "/sugarcity-logo.jpg";
const HERO_PUBLIC_URL = "/booking-hero.png";

const STATIONS = [
  { id: 'bp', name: 'Basseterre Pickup' },
  { id: 'hs', name: 'Historic Sites' },
  { id: 'cd', name: 'Coastal Drive' },
  { id: 'fb', name: 'Frigate Bay Strip' }
];

// Tailwind Colors (used by QR code SVG)
const COLORS = {
  cream: '#FDF5E6',
  brown: '#4A3728',
  red: '#FF5A4D',
  teal: '#008B8B',
  yellow: '#FFBD3D',
};

// Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// --- Utility Components ---

// Generates a simple SVG for a QR Code
const QrCodeSVG = ({ value, size = 150 }: { value: string; size?: number }) => (
    <svg viewBox="0 0 100 100" width={size} height={size} className="bg-white p-2 rounded">
        <rect width="100" height="100" fill={COLORS.cream} />
        <rect x="5" y="5" width="20" height="20" fill={COLORS.teal} />
        <rect x="75" y="5" width="20" height="20" fill={COLORS.teal} />
        <rect x="5" y="75" width="20" height="20" fill={COLORS.teal} />
        <text x="50" y="50" fontSize="10" textAnchor="middle" fill={COLORS.brown}>{value}</text>
    </svg>
);

const TicketDisplay = ({ bookingDetails, ticketId, qrCode }: { bookingDetails: any, ticketId: string, qrCode?: string }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const printTicket = () => {
        const msgBox = document.getElementById('download-message');
        if (msgBox) {
            msgBox.innerText = "Ticket sent to email!";
            msgBox.classList.remove('hidden', 'bg-red-500');
            msgBox.classList.add('bg-green-500');
            setTimeout(() => msgBox.classList.add('hidden'), 5000);
        }
    };

    return (
        <div id="ticket-area">
            <div id="download-message" className="hidden fixed top-4 right-4 text-white p-3 rounded-lg shadow-xl z-50 font-semibold transition-opacity duration-500"></div>
            <div id="ticket-print-area" className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-[#008B8B] relative max-w-lg mx-auto transform -rotate-1 transition-transform hover:rotate-0">
                <div className="text-center pb-4 border-b-2 border-dashed border-[#FFBD3D]">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <Image src={LOGO_PUBLIC_URL} alt="Logo" width={40} height={40} className="h-10 w-10 object-cover rounded-full border-2 border-[#FF5A4D]" />
                        <h3 className="text-3xl text-[#FF5A4D] font-titan-one">Sugar City Express</h3>
                    </div>
                    <p className="text-sm font-semibold text-[#008B8B]">Your Open-Air Island Experience</p>
                </div>
                <div className="grid grid-cols-2 gap-4 py-6">
                    <div className="space-y-3 border-r border-gray-200 pr-4">
                        <div><p className="text-xs font-bold uppercase text-gray-500">Booking ID</p><p className="text-lg font-mono text-[#4A3728]">{ticketId}</p></div>
                        <div><p className="text-xs font-bold uppercase text-gray-500">Pickup</p><p className="font-bold text-base leading-tight">Basseterre Pickup Location</p></div>
                        <div><p className="text-xs font-bold uppercase text-gray-500">Tour Date</p><p className="text-base font-semibold">{bookingDetails.date}</p></div>
                    </div>
                    <div className="space-y-3 pl-4">
                        <div><p className="text-xs font-bold uppercase text-gray-500">Experience</p><p className="text-xl font-bold text-[#008B8B] leading-tight">{bookingDetails.tourName}</p></div>
                        <div>
                            <p className="text-xs font-bold uppercase text-gray-500">Guests</p>
                            <p className="text-xl font-bold text-[#FF5A4D]">
                                {bookingDetails.pax}
                                <span className="text-sm font-normal text-gray-500 ml-1">
                                    ({bookingDetails.adultPax} Ad, {bookingDetails.childPax} Ch)
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="col-span-2 text-center pt-4 border-t-2 border-dashed border-[#FFBD3D]">
                        {qrCode ? (
                           <Image src={qrCode} alt="QR Code" width={120} height={120} className="mx-auto" unoptimized />
                        ) : (
                           <QrCodeSVG value={ticketId} size={120} />
                        )}
                        <p className="text-xs font-medium text-gray-600 mt-2">Scan this code at check-in.</p>
                    </div>
                </div>
                <div className="pt-4 text-center text-xs text-gray-500 border-t-2 border-dashed border-[#FFBD3D]">
                    <p>Please meet 15 minutes prior to departure at the Basseterre pickup location.</p>
                </div>
                <button onClick={printTicket} className="w-full mt-4 bg-[#4A3728] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#3a2b20] transition-colors">
                    <Download size={18} /> Download Ticket
                </button>
            </div>
        </div>
    );
};

const Hero = ({ bookingRef }: { bookingRef: React.RefObject<HTMLDivElement> }) => (
  <div className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-[#FDF5E6]">
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#FDF5E6]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[800px] h-[800px] bg-[#FFBD3D] rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-0 w-full h-64 bg-[#008B8B] opacity-10 transform -skew-y-3"></div>
    </div>
    <div className="relative z-10 max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
      <div className="text-center lg:text-left space-y-6">
        <div className="inline-block bg-[#FFBD3D] px-4 py-1 rounded-full text-[#4A3728] font-bold text-sm uppercase tracking-wider transform -rotate-2 border-2 border-[#4A3728] shadow-sm">Daily Trolley Food Tours — Free Wi-Fi Onboard</div>
        <h1 className="text-5xl md:text-7xl text-[#FF5A4D] font-titan-one leading-tight drop-shadow-md">Eat Like a Local. <br/><span className="text-[#008B8B]">Ride in Style.</span></h1>
        <p className="text-xl text-[#4A3728] font-semibold max-w-lg mx-auto lg:mx-0">The only open-air island trolley food tour in St. Kitts. 2 hours. 4 authentic tastings. One lucky guest wins up to $250.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
          <button onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#008B8B] text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-[4px_4px_0px_0px_rgba(74,55,40,1)] hover:shadow-[2px_2px_0px_0px_rgba(74,55,40,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-[#4A3728]">Book Your Seat — $96</button>
          <button className="bg-[#FDF5E6] text-[#4A3728] px-8 py-4 rounded-2xl font-bold text-lg shadow-[4px_4px_0px_0px_rgba(255,90,77,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,90,77,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all border-2 border-[#FF5A4D] flex items-center justify-center gap-2"><Camera size={20} /> Gallery</button>
        </div>
      </div>
      <div className="relative hidden lg:block">
        <div className="absolute inset-0 bg-[#FF5A4D] rounded-[3rem] rotate-3 translate-x-4 translate-y-4"></div>
        <div className="relative bg-white p-4 rounded-[3rem] shadow-2xl border-4 border-[#4A3728] -rotate-2 hover:rotate-0 duration-500">
           <div className="rounded-[2.5rem] overflow-hidden h-[500px] bg-[#FFE4B5] relative">
              <Image src={HERO_PUBLIC_URL} alt="Sugar City Express Open-Air Trolley" fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#4A3728]/90 to-transparent p-8 text-white"><p className="font-bold text-lg">Departing daily from Basseterre</p></div>
           </div>
        </div>
      </div>
    </div>
  </div>
);

// Payment Form Component
function PaymentForm({
  onSuccess,
  onError,
}: {
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#E85A4F] hover:bg-[#d64a3f] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center mt-6"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin mr-2 w-5 h-5" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </button>
    </form>
  );
}

const BookingWidget = ({ forwardedRef }: { forwardedRef: React.RefObject<HTMLDivElement> }) => {
  const searchParams = useSearchParams();
  const couponFromUrl = searchParams.get("coupon");
  const tourFromUrl = searchParams.get("tour");

  const [tours, setTours] = useState<Tour[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  
  const [step, setStep] = useState<"select" | "guest" | "payment" | "success">("select");
  
  // Booking State
  const [details, setDetails] = useState({ 
    pax: 1, 
    adultPax: 1,
    childPax: 0,
    tourId: '', 
    origin: 'bp', 
    destination: 'fb', 
    date: '', 
    time: '10:00' 
  });
  const [guest, setGuest] = useState({ name: '', email: '', phone: '' });
  const [couponCode, setCouponCode] = useState(couponFromUrl || "");
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid" | "loading">("idle");
  
  // Pricing & Payment State
  const [pricing, setPricing] = useState<{
    pricePerPerson: number;
    subtotal: number;
    discount: number;
    finalTotal: number;
    coupon: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isFreeRide, setIsFreeRide] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Fetch Tours
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tours"), (snapshot) => {
        const toursData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
        setTours(toursData);
        if (toursData.length > 0 && !details.tourId) {
            // Select first tour by default or from URL
            const initialTour = tourFromUrl ? toursData.find(t => t.id === tourFromUrl) : toursData[0];
            if (initialTour) setDetails(prev => ({ ...prev, tourId: initialTour.id }));
        }
        setLoadingTours(false);
    });
    return () => unsubscribe();
  }, [tourFromUrl, details.tourId]);

  // Calculate local price estimate for display
  const selectedTour = tours.find(t => t.id === details.tourId);
  const estimatedPrice = selectedTour 
    ? (selectedTour.price * details.adultPax) + ((selectedTour.childPrice || selectedTour.price) * details.childPax)
    : 0;

  const handleDetailsChange = (field: string, value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const calculatePricing = useCallback(async () => {
    if (!selectedTour || !details.pax) return;

    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId: selectedTour.id,
          adultPax: details.adultPax,
          childPax: details.childPax,
          couponCode: couponCode || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create payment intent`);
      }

      const result = await response.json();
      if (result.success) {
        setPricing(result.data.pricing);
        setClientSecret(result.data.clientSecret);
        setIsFreeRide(result.data.isFreeRide);
        if (result.data.pricing.coupon) {
            setCouponStatus("valid");
        } else if (couponCode && !result.data.pricing.coupon) {
             setCouponStatus("invalid");
        }
      } else {
        setError(result.error || "Failed to calculate pricing");
      }
    } catch (error) {
      console.error("Error calculating pricing:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to calculate pricing";
      setError(errorMessage);
    }
  }, [selectedTour, details.pax, details.adultPax, details.childPax, couponCode]);

  // Flow Handlers
  const handleToGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.date || !details.tourId) {
        setError("Please select a date and tour.");
        return;
    }
    setError("");
    setStep("guest");
  };

  const handleToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest.name || !guest.email) {
        setError("Name and Email are required.");
        return;
    }
    setError("");
    await calculatePricing();
    setStep("payment");
  };

  const handleFinalizeBooking = async (paymentIntentId?: string) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: guest.name,
          email: guest.email,
          phone: guest.phone,
          tourId: details.tourId,
          tourName: selectedTour?.name,
          date: details.date,
          time: details.time,
          adultPax: details.adultPax,
          childPax: details.childPax,
          pax: details.pax,
          originalTotal: pricing?.subtotal || 0,
          discount: pricing?.discount || 0,
          finalTotal: pricing?.finalTotal || 0,
          couponCode: couponStatus === "valid" ? couponCode : null,
          paymentIntentId: paymentIntentId,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setBookingResult(result.data);
        setStep("success");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Failed to create booking");
    }
  };

  if (step === "success" && bookingResult) {
    return (
        <div id="booking" ref={forwardedRef} className="py-12 px-4 max-w-4xl mx-auto -mt-20 relative z-20">
            <TicketDisplay 
                bookingDetails={{...details, tourName: selectedTour?.name}} 
                ticketId={bookingResult.ticketId} 
                qrCode={bookingResult.qrCode}
            />
             <div className="text-center mt-6">
                <button 
                    onClick={() => { setStep("select"); setBookingResult(null); }}
                    className="text-[#008B8B] font-bold hover:underline"
                >
                    Book Another Trip
                </button>
            </div>
        </div>
    );
  }

  return (
    <div id="booking" ref={forwardedRef} className="py-12 px-4 max-w-4xl mx-auto -mt-20 relative z-20">
      <div className="bg-white rounded-3xl shadow-2xl border-4 border-[#FFBD3D] p-6 md:p-8 relative">
        {step !== "select" && (
            <button onClick={() => setStep(step === "payment" ? "guest" : "select")} className="absolute top-6 left-6 text-gray-400 hover:text-[#E85A4F]">
                <ArrowLeft size={24} />
            </button>
        )}

        <div className="flex items-center justify-center gap-3 mb-6 border-b-2 border-[#FDF5E6] pb-4">
          <div className="bg-[#FF5A4D] text-white p-2 rounded-lg"><MapPin size={24} /></div>
          <h2 className="text-2xl md:text-3xl text-[#4A3728] font-titan-one">
            {step === "select" && "Start Your Journey"}
            {step === "guest" && "Guest Details"}
            {step === "payment" && "Secure Payment"}
          </h2>
        </div>

        {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-center font-bold">
                {error}
            </div>
        )}

        {/* STEP 1: SELECTION */}
        {step === "select" && (
            <form onSubmit={handleToGuest} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Promo Header */}
            <div className="col-span-full text-center pb-2">
                <span className="inline-block bg-[#E0F7FA] text-[#008B8B] px-3 py-1 rounded-full text-sm font-bold border border-[#008B8B]/30 mb-2">
                    ✨ 2-Hour Trolley Food Tour — Tasting Menu Included
                </span>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-500 uppercase">Tour Date</label>
                <input type="date" required onChange={(e) => handleDetailsChange('date', e.target.value)} value={details.date} className="w-full p-3 bg-[#FDF5E6] rounded-xl border-2 border-transparent focus:border-[#008B8B] outline-none font-bold text-[#4A3728]" />
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-500 uppercase">Tour Time</label>
                <div className="relative">
                    <select value={details.time} onChange={(e) => handleDetailsChange('time', e.target.value)} className="w-full p-3 bg-[#FDF5E6] rounded-xl border-2 border-transparent focus:border-[#008B8B] outline-none font-bold text-[#4A3728] appearance-none">
                        <option value="10:00">10:00 AM</option>
                        <option value="13:00">1:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none text-[#008B8B] font-bold">▼</div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-500 uppercase">Guests</label>
                
                {/* Adults */}
                <div className="flex items-center justify-between bg-[#FDF5E6] rounded-xl p-2">
                    <span className="font-bold text-[#4A3728] ml-2">Adults</span>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => {
                            const newAdults = Math.max(1, details.adultPax - 1);
                            setDetails(prev => ({ ...prev, adultPax: newAdults, pax: newAdults + prev.childPax }));
                        }} className="p-2 w-8 h-8 flex items-center justify-center bg-white text-[#4A3728] rounded-lg shadow-sm hover:bg-gray-50">-</button>
                        <span className="font-bold text-[#4A3728] w-4 text-center">{details.adultPax}</span>
                        <button type="button" onClick={() => {
                            const newAdults = Math.min(10, details.adultPax + 1);
                            setDetails(prev => ({ ...prev, adultPax: newAdults, pax: newAdults + prev.childPax }));
                        }} className="p-2 w-8 h-8 flex items-center justify-center bg-white text-[#4A3728] rounded-lg shadow-sm hover:bg-gray-50">+</button>
                    </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between bg-[#FDF5E6] rounded-xl p-2">
                    <div className="ml-2">
                        <span className="font-bold text-[#4A3728] block">Children</span>
                        <span className="text-xs text-gray-500">Under 12 years</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => {
                            const newChildren = Math.max(0, details.childPax - 1);
                            setDetails(prev => ({ ...prev, childPax: newChildren, pax: prev.adultPax + newChildren }));
                        }} className="p-2 w-8 h-8 flex items-center justify-center bg-white text-[#4A3728] rounded-lg shadow-sm hover:bg-gray-50">-</button>
                        <span className="font-bold text-[#4A3728] w-4 text-center">{details.childPax}</span>
                        <button type="button" onClick={() => {
                            const newChildren = Math.min(10, details.childPax + 1);
                            setDetails(prev => ({ ...prev, childPax: newChildren, pax: prev.adultPax + newChildren }));
                        }} className="p-2 w-8 h-8 flex items-center justify-center bg-white text-[#4A3728] rounded-lg shadow-sm hover:bg-gray-50">+</button>
                    </div>
                </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                <label className="block text-sm font-bold text-gray-500 uppercase">Experience Type</label>
                {loadingTours ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#E85A4F]" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tours.map((t) => (
                        <div key={t.id} onClick={() => handleDetailsChange('tourId', t.id)} className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative overflow-hidden ${details.tourId === t.id ? 'border-[#FF5A4D] bg-[#FFF5F5] shadow-md' : 'border-gray-200 hover:border-[#FFBD3D] bg-white'}`}>
                            {details.tourId === t.id && (
                                <div className="absolute top-0 right-0 bg-[#FF5A4D] text-white p-1 rounded-bl-lg">
                                    <CheckCircle size={16} />
                                </div>
                            )}
                            <div className="font-bold text-[#4A3728] text-lg mb-1">{t.name}</div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-[#FF5A4D] font-bold text-xl">${t.price}</span>
                                {t.childPrice && <span className="text-sm text-gray-400">Child: ${t.childPrice}</span>}
                            </div>
                            <p className="text-xs text-gray-500 leading-tight line-clamp-3">{t.description}</p>
                            <div className="mt-3 text-xs font-bold text-[#008B8B] bg-[#E0F7FA] inline-block px-2 py-1 rounded">
                                {50 - (Math.floor(Math.random() * 20))} seats left
                            </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t-2 border-[#FDF5E6] gap-4">
                <div className="text-center md:text-left">
                    <p className="text-sm text-gray-500 font-bold uppercase">Estimated Total</p>
                    <p className="text-4xl font-titan-one text-[#008B8B]">${estimatedPrice.toFixed(2)}</p>
                </div>
                <button type="submit" className="w-full md:w-auto bg-[#4A3728] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95">
                    👉 Check Availability <ArrowRight size={20} />
                </button>
            </div>
            </form>
        )}

        {/* STEP 2: GUEST DETAILS */}
        {step === "guest" && (
            <form onSubmit={handleToPayment} className="max-w-xl mx-auto space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1">Full Name</label>
                    <input type="text" required value={guest.name} onChange={e => setGuest({...guest, name: e.target.value})} className="w-full p-3 bg-[#FDF5E6] rounded-xl border-2 border-transparent focus:border-[#008B8B] outline-none font-bold text-[#4A3728]" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1">Email Address</label>
                    <input type="email" required value={guest.email} onChange={e => setGuest({...guest, email: e.target.value})} className="w-full p-3 bg-[#FDF5E6] rounded-xl border-2 border-transparent focus:border-[#008B8B] outline-none font-bold text-[#4A3728]" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 uppercase mb-1">Phone (WhatsApp)</label>
                    <input type="tel" value={guest.phone} onChange={e => setGuest({...guest, phone: e.target.value})} className="w-full p-3 bg-[#FDF5E6] rounded-xl border-2 border-transparent focus:border-[#008B8B] outline-none font-bold text-[#4A3728]" placeholder="+1 869 ..." />
                  </div>
                  
                  {/* Coupon Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-500 uppercase">Promo Code</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={couponCode} 
                            onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponStatus("idle"); }} 
                            className="flex-1 p-3 bg-[#FDF5E6] rounded-xl border-2 border-transparent focus:border-[#008B8B] outline-none font-bold text-[#4A3728] uppercase" 
                            placeholder="CODE123" 
                        />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#FDF5E6] flex justify-end">
                    <button type="submit" className="bg-[#4A3728] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                        Proceed to Payment <CreditCard size={20} />
                    </button>
                </div>
            </form>
        )}

        {/* STEP 3: PAYMENT */}
        {step === "payment" && pricing && (
            <div className="max-w-xl mx-auto">
                <div className="bg-[#FFF8E1] p-6 rounded-2xl mb-6 border-2 border-[#FFBD3D]">
                    <h3 className="font-titan-one text-xl text-[#4A3728] mb-4">Trip Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Tour</span><span className="font-bold">{selectedTour?.name}</span></div>
                        <div className="flex justify-between"><span>Date</span><span className="font-bold">{details.date}</span></div>
                        <div className="flex justify-between">
                            <span>Passengers</span>
                            <span className="font-bold text-right">
                                {details.adultPax} Adult{details.adultPax !== 1 ? 's' : ''}, {details.childPax} Child{details.childPax !== 1 ? 'ren' : ''}
                            </span>
                        </div>
                        <div className="h-px bg-[#4A3728]/20 my-2"></div>
                        <div className="flex justify-between"><span>Subtotal</span><span>${pricing.subtotal.toFixed(2)}</span></div>
                        {pricing.discount > 0 && (
                            <div className="flex justify-between text-[#E85A4F] font-bold"><span>Discount</span><span>-${pricing.discount.toFixed(2)}</span></div>
                        )}
                        <div className="flex justify-between text-xl font-bold text-[#008B8B] pt-2"><span>Total</span><span>${pricing.finalTotal.toFixed(2)}</span></div>
                    </div>
                </div>

                {isFreeRide ? (
                     <button
                        onClick={() => handleFinalizeBooking()}
                        className="w-full bg-[#20B2AA] text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center mt-6"
                    >
                        Confirm Free Booking
                    </button>
                ) : (
                    clientSecret && (
                        <Elements stripe={stripePromise} options={{ 
                            clientSecret, 
                            appearance: { 
                                theme: 'stripe', 
                                variables: { colorPrimary: '#E85A4F', borderRadius: '12px' } 
                            } 
                        }}>
                            <PaymentForm 
                                onSuccess={handleFinalizeBooking} 
                                onError={(msg) => setError(msg)} 
                            />
                        </Elements>
                    )
                )}
            </div>
        )}

      </div>
    </div>
  );
};

const FeatureSection = () => (
  <section id="experience" className="py-20 px-4 bg-[#FDF5E6]">
    <div className="max-w-7xl mx-auto text-center">
      <div className="mb-16">
        <span className="text-[#FF5A4D] font-bold tracking-widest uppercase mb-2 block">Why Ride With Us</span>
        <h2 className="text-4xl md:text-5xl text-[#4A3728] mb-6 font-titan-one">Why Ride the Sugar City Express</h2>
        <div className="w-24 h-2 bg-[#FFBD3D] mx-auto rounded-full"></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { icon: <Wind size={32} />, title: "Open-Air Island Trolley", text: "Feel the Caribbean breeze as we explore Basseterre or Frigate Bay." },
          { icon: <Coffee size={32} />, title: "Authentic Island Tastings Included", text: "Enjoy a curated tasting menu inspired by local flavors." },
          { icon: <Info size={32} />, title: "Local Culture & Stories", text: "Hear the history behind St. Kitts’ food, islands, and traditions." },
          { icon: <Wifi size={32} />, title: "Free Onboard Wi-Fi", text: "Stay connected, share your experience instantly, and access our digital tasting guide during the tour." }
        ].map((f, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-[#008B8B] transition-all text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E0F7FA] text-[#008B8B] mb-6 group-hover:scale-110 transition-transform">{f.icon}</div>
            <h3 className="text-xl font-bold text-[#4A3728] mb-3">{f.title}</h3>
            <p className="text-gray-600 font-medium">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const RouteMarquee = () => (
  <div id="route" className="bg-[#008B8B] py-12 overflow-hidden relative">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    <div className="max-w-7xl mx-auto px-4 mb-8 text-center text-white">
       <h2 className="text-3xl md:text-4xl font-titan-one mb-2">Your Island Route</h2>
       <p className="text-[#E0F7FA] font-bold">2 Hours of Pure Scenic Bliss</p>
    </div>
    <div className="flex justify-between max-w-5xl mx-auto relative px-4 pb-12 pt-8">
      <div className="absolute top-1/2 left-4 right-4 h-2 bg-[#006666] -translate-y-6 z-0 rounded-full"></div>
      {STATIONS.map((s, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center group cursor-pointer">
          <div className="w-6 h-6 rounded-full bg-[#FFBD3D] border-4 border-white shadow-lg group-hover:scale-125 transition-transform mb-4"></div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-md group-hover:-translate-y-2 transition-transform">
            <span className="text-[#008B8B] font-bold text-sm whitespace-nowrap">{s.name}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AboutSection = () => (
  <section id="about" className="py-20 bg-[#FFF8E1] relative overflow-hidden">
     <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="order-2 md:order-1 relative">
           <div className="absolute inset-0 border-4 border-[#4A3728] rounded-3xl transform translate-x-4 translate-y-4"></div>
           <div className="relative rounded-3xl shadow-xl w-full h-96 overflow-hidden border-4 border-white">
             <Image 
              src="/booking-about.png" 
              alt="Sugar City Express Open-Air Trolley" 
              fill
              className="object-cover filter sepia-[.3]" 
             />
           </div>
        </div>
        <div className="order-1 md:order-2">
           <h2 className="text-4xl md:text-5xl text-[#4A3728] mb-6 font-titan-one">About the Sugar City Express</h2>
           <p className="text-lg text-gray-700 mb-6 font-medium leading-relaxed">
             A vintage-style, open-air trolley designed to bring the flavors and stories of St. Kitts to life. Our team of local hosts guides you through a delicious island experience featuring cultural tastings, stunning roadside views, and warm Caribbean hospitality.
           </p>
           <div className="bg-[#FDF5E6] p-4 rounded-xl border-2 border-[#FFBD3D]">
             <p className="text-[#4A3728] font-bold text-center">One guest goes home with up to $250. Everyone goes home full.</p>
           </div>
        </div>
     </div>
  </section>
);

const FAQSection = () => (
  <section className="py-20 px-4 bg-[#FDF5E6]">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl text-[#4A3728] mb-6 font-titan-one">Questions? We&apos;ve Got Answers.</h2>
        <div className="w-24 h-2 bg-[#FFBD3D] mx-auto rounded-full"></div>
      </div>
      
      <div className="space-y-8">
        {[
          {
            q: "Will I make it back to my ship?",
            a: "Always. We time every tour to return you to Port Zante well before final tender. We've never had a guest miss their ship."
          },
          {
            q: "What kind of food will I try?",
            a: "Real Kittitian cooking—think tender stewed oxtail, crispy saltfish fritters, fresh coconut water, and sweet tamarind balls. Vegetarian options available at every stop."
          },
          {
            q: "How does the jackpot work?",
            a: "Every tour ends with a fun island-style drawing where one lucky rider wins our cash jackpot, valued up to $250 depending on the size of the group."
          },
          {
            q: "Is this good for kids?",
            a: "Absolutely. Families love it. The open-air trolley is half the fun for little ones. Kids 4 and under ride free."
          },
          {
            q: "What if it rains?",
            a: "We roll rain or shine. The trolley has a covered canopy, and a little Caribbean drizzle is part of the experience."
          }
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border-2 border-transparent hover:border-[#008B8B] transition-all">
            <h3 className="text-xl font-bold text-[#4A3728] mb-3">{item.q}</h3>
            <p className="text-gray-600 font-medium leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ClosingSection = ({ bookingRef }: { bookingRef: React.RefObject<HTMLDivElement> }) => (
  <section className="py-24 px-4 bg-[#008B8B] relative overflow-hidden">
    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFBD3D] rounded-full opacity-10 blur-3xl translate-x-1/2 translate-y-1/2"></div>
    
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <div className="inline-block bg-[#FF5A4D] px-6 py-2 rounded-full text-white font-bold text-sm uppercase tracking-wider mb-8 shadow-lg transform -rotate-2">
        Seats Fill Fast on Port Days
      </div>
      
      <h2 className="text-4xl md:text-6xl text-white mb-8 font-titan-one leading-tight">
        Don&apos;t Just Visit St. Kitts.<br/>
        <span className="text-[#FFBD3D]">Taste It.</span>
      </h2>
      
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 mb-10 max-w-2xl mx-auto">
        <p className="text-xl text-[#E0F7FA] font-medium leading-relaxed mb-6">
          We host intimate morning and mid-day tours with limited seating to ensure a relaxed, immersive experience. On cruise days, tours typically fill in advance.
        </p>
        <p className="text-lg text-white font-bold">
          For $96, you’ll taste the island, meet our local hosts, and enjoy a fun chance to win up to $250.
        </p>
      </div>
      
      <button 
        onClick={() => bookingRef.current?.scrollIntoView({ behavior: 'smooth' })} 
        className="bg-[#FFBD3D] text-[#4A3728] px-10 py-5 rounded-2xl font-bold text-xl shadow-[6px_6px_0px_0px_rgba(74,55,40,0.4)] hover:shadow-[3px_3px_0px_0px_rgba(74,55,40,0.4)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all border-4 border-white inline-flex items-center gap-3"
      >
        <MapPin size={28} />
        Secure Your Seat Now
      </button>
    </div>
  </section>
);

export default function BookingPageClient() {
  const bookingSectionRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="antialiased selection:bg-[#FF5A4D] selection:text-white font-nunito bg-[#FDF5E6]">
      <SiteHeader rightContent={undefined} />
      <Hero bookingRef={bookingSectionRef} />
      <BookingWidget forwardedRef={bookingSectionRef} />
      <FeatureSection />
      <RouteMarquee />
      <AboutSection />
      <FAQSection />
      <ClosingSection bookingRef={bookingSectionRef} />
      <SiteFooter />
    </div>
  );
}
