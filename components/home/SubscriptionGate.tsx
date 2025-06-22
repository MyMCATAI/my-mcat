//components/home/SubscriptionGate.tsx
"use client";

import { useUserInfo } from "@/hooks/useUserInfo";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubscriptionGate() {
  const { userInfo } = useUserInfo();
  const { subscriptionStatus, isLoading } = useSubscriptionStatus();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleSubscribe = async () => {
    try {
      setIsRedirecting(true);
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceType: 'md_gold', // This maps to ProductType.MD_GOLD and uses STRIPE_PRICE_GOLD_ID
          mode: 'subscription',
          isTrial: false,
          successUrl: `${window.location.origin}/ankiclinic`,
          cancelUrl: `${window.location.origin}/subscription-gate`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsRedirecting(false);
      // Fallback to your direct Stripe link if needed
      window.location.href = "https://buy.stripe.com/dR603D8WF3YvbgQ4gw";
    }
  };

  const handleStartTrial = async () => {
    try {
      setIsRedirecting(true);
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceType: 'md_gold', // This maps to ProductType.MD_GOLD and uses STRIPE_PRICE_GOLD_ID
          mode: 'subscription',
          isTrial: true, // This adds the 14-day trial period
          successUrl: `${window.location.origin}/ankiclinic`,
          cancelUrl: `${window.location.origin}/subscription-gate`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create trial session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error starting trial:', error);
      setIsRedirecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[--theme-background-color]">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
            Welcome to AnkiClinic, {userInfo?.firstName || 'Future Doctor'}!
          </h1>
          <p className="text-xl text-[--theme-text-color] opacity-80">
            Your comprehensive MCAT preparation journey starts here
          </p>
        </div>

        {/* Main Subscription Card */}
        <div className="bg-[--theme-leaguecard-color] rounded-xl p-10 relative overflow-hidden shadow-2xl">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.05] to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-8">
              <Image
                src="/MD_Premium_Pro.png"
                alt="MD Premium"
                width={120}
                height={120}
                className="rounded-lg shadow-lg"
              />
            </div>
            
            <h2 className="text-3xl font-bold text-center mb-6">
              Unlock Your Medical School Journey
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-400 mb-4">What You Get:</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Complete MCAT Question Bank</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>AI-Powered Personal Tutor</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Personalized Study Calendar</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Advanced Analytics & Progress Tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>Full Doctor's Office Game Experience</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-amber-400 mb-4">Success Stats:</h3>
                <div className="space-y-3">
                  <div className="bg-[--theme-mainbox-color] p-4 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">95%</div>
                    <div className="text-sm opacity-80">Student satisfaction rate</div>
                  </div>
                  <div className="bg-[--theme-mainbox-color] p-4 rounded-lg">
                    <div className="text-2xl font-bold text-amber-400">+15</div>
                    <div className="text-sm opacity-80">Average MCAT score improvement</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="text-center mb-8">
              <div className="inline-block bg-[--theme-mainbox-color] rounded-lg p-6 mb-6">
                <div className="text-3xl font-bold text-amber-400 mb-2">$149.99/month</div>
                <div className="text-sm opacity-80">Full access to all features</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleSubscribe}
                disabled={isRedirecting}
                className="w-full max-w-md px-8 py-4 text-xl rounded-lg font-bold
                  bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-900
                  shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)]
                  transform hover:scale-[1.02] transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isRedirecting ? 'Redirecting...' : 'Start Your Journey - Subscribe Now'}
              </button>
              
              {/* 7-Day Trial Option */}
              <button
                onClick={handleStartTrial}
                disabled={isRedirecting}
                className="w-full max-w-md px-6 py-3 text-lg rounded-lg font-semibold
                  border-2 border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-amber-900
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRedirecting ? 'Starting Trial...' : 'Start 7-Day Free Trial'}
              </button>
              
              <div className="text-center mt-6">
                <p className="text-sm opacity-60 mb-2">
                  Questions? Need help? Contact support
                </p>
                <div className="flex items-center justify-center gap-4 text-xs opacity-40">
                  <span>🔒 Secure payment via Stripe</span>
                  <span>⚡ Instant access</span>
                  <span>🎯 Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center space-y-4">
          <p className="text-sm opacity-60">
            Join thousands of successful pre-med students who chose AnkiClinic
          </p>
          <div className="flex items-center justify-center gap-8 text-xs opacity-40">
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Student support team</span>
          </div>
        </div>
      </div>
    </div>
  );
}