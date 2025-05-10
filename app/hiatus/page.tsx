import Link from "next/link";
import { ArrowRight } from "lucide-react";

const HiatusPage = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0e2247] to-[#1a3a6c] px-4 sm:px-6 py-10 text-white">
      <div className="relative max-w-4xl w-full text-center space-y-4 mb-6">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -top-6 right-1/4 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl" />
        
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight relative">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            The MyMCAT.ai experiment is on&nbsp;hiatus
          </span>
        </h1>

        <p className="text-base sm:text-lg leading-relaxed text-blue-100 max-w-3xl mx-auto">
          As we build Studyverses for tutoring firms, we&rsquo;re pausing open
          enrollment. During its runtime, MyMCAT.ai students who dedicated
          30&#43; hours averaged an&nbsp;
          <span className="font-bold text-white">11.3-point MCAT increase</span>.
        </p>

        <div className="flex items-center justify-center">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-300/50" />
          <p className="text-sm sm:text-base px-3">
            Watch a few of their stories below
          </p>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-300/50" />
        </div>
      </div>

      <div className="w-full max-w-3xl mb-6 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-30"></div>
        <video
          className="relative w-full rounded-lg shadow-2xl border border-white/10"
          controls
          src="https://my-mcat.s3.us-east-2.amazonaws.com/tutorial/testimonials.mp4"
        />
      </div>

      <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 max-w-2xl w-full text-center space-y-3 border border-white/10 shadow-xl">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10"></div>
        <div className="relative">
          <p className="text-lg sm:text-xl mb-3">
            While on hiatus, access costs{" "}
            <span className="font-bold text-xl sm:text-2xl text-blue-200">$150</span>
          </p>
          
          <Link
            href="https://buy.stripe.com/dR603D8WF3YvbgQ4gw"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25"
          >
            Pay $150
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <p className="mt-3 text-xs sm:text-sm text-blue-100">
            After payment, email{" "}
            <a
              href="mailto:prynce@studyverse.ai"
              className="text-blue-300 hover:text-blue-200 underline underline-offset-2 transition-colors"
            >
              prynce@studyverse.ai
            </a>{" "}
            for access credentials.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HiatusPage; 