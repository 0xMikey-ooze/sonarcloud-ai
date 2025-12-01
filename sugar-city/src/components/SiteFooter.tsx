import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, Users } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="bg-[#2a1a16] text-white py-12 border-t border-white/5 font-poppins">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image 
                src="/sugarcity-logo.jpg" 
                width={40} 
                height={40} 
                alt="Logo" 
                className="rounded-full bg-white p-1" 
              />
              <span className="font-fredoka text-xl">SUGAR CITY EXPRESS</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
              St. Kitts’ favorite open-air trolley food tour — taste the island, enjoy the breeze, love the ride.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs font-medium text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-[#F5B041]">✓</span> Locally owned & operated
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#F5B041]">✓</span> Return-to-ship guarantee
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#F5B041]">✓</span> Instant confirmation
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#F5B041]">✓</span> Free cancellation 24hrs before
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-[#F5B041] font-fredoka">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/book" className="hover:text-white transition">Book Tickets</Link></li>
              <li><Link href="/referral" className="hover:text-white transition">Become a Partner</Link></li>
              <li><Link href="/spin" className="hover:text-white transition">Spin to Win</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-[#F5B041] font-fredoka">Contact</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <span>
                  Industrial Site, P O Box 2013<br/>
                  Basseterre, KN<br/>
                  St. Kitts
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0" /> Daily 9AM - 6PM
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 shrink-0" /> info@sugarcityexpress.com
              </li>
              <li className="flex items-center gap-2">
                <a 
                  href={`https://wa.me/18696622327`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <span className="w-4 h-4 flex items-center justify-center font-bold text-[#25D366]">WA</span> +1 (869) 662-2327
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Sugar City Express. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

