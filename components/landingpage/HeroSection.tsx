import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Page Background Image */}
      <div className="absolute inset-0 -z-20 h-full w-full">
        <Image
          src="/images/hero_bg.jpg"
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <Navbar />

      {/* Hero Section Content */}
      <section className="relative flex-grow flex items-center max-w-7xl mx-auto px-2 md:px-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center w-full">
          {/* Left Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col space-y-6 md:space-y-8 text-left">

            {/* AI Badge */}
            <div className="inline-flex items-center space-x-2 bg-[#B9D9EB]/20 border border-primary text-blue-900 px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit tracking-wide uppercase">
              <Sparkles className="h-4 w-4 text-primary animate-pulse " />
              <span className="text-primary">AI-Powered Medical Assistant</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              Empowering Healthcare with <br />
              <span className="text-primary">
                AI-Driven Precision
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg md:text-xl font-bold text-slate-600 leading-relaxed max-w-2xl">
              Experience the next generation of clinical workflow. Summarize complex patient records, assess diagnostic reports, and generate secure clinical insights instantly with our advanced artificial intelligence.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-[#90D5FF] text-white font-semibold text-md px-8 py-6 transition-all duration-300 transform hover:-translate-y-0.5 w-full sm:w-auto"
                >
                  Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-primary border-2 hover:text-primary font-semibold text-primary text-md px-8 py-6 transition-all duration-300">
                Book a Demo
              </Button>
            </div>

          </div>

          {/* Right Column: Hero Image with Glassmorphism */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            {/* Background glowing circle for the image */}
            <div className="absolute -inset-4 rounded-full bg-[#B9D9EB]/35 blur-2xl -z-10" />

            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden p-3">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="/images/hero_right.png"
                  alt="AI Medical Robot Assistant"
                  fill
                  priority
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
