import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HeartHandshake, 
  MessageSquareHeart, 
  Pill, 
  UserCheck, 
  History, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Activity, 
  Lock, 
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  FileHeart,
  CalendarCheck
} from 'lucide-react';
import { MedicalDisclaimerModal } from '../components/common/MedicalDisclaimerModal';

import heroImg from '../assets/images/hero_medical_companion_1790851006932.jpg';
import symptomImg from '../assets/images/feature_symptom_guidance_1790851027776.jpg';
import medImg from '../assets/images/feature_medication_care_1790851043625.jpg';
import profileImg from '../assets/images/feature_health_profile_1790851061257.jpg';

export const LandingPage: React.FC = () => {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <MedicalDisclaimerModal isOpen={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-800 bg-cyan-100/70 border border-cyan-200/80 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                <span>Next-Generation Personal Health Companion</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
                Calm, intelligent health clarity when you need it most.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                MediMateAI helps you understand your symptoms, organize medications, maintain a confidential health profile, and prepare insightful questions for your physician — without clinical confusion or panic.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all group"
                >
                  <span>Start Free Health Companion</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm transition-all"
                >
                  <span>Sign In to Dashboard</span>
                </Link>
              </div>

              {/* Trust proof bar */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Non-diagnostic ethical guardrails</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Private encrypted records</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Physician checkup preparation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                <img
                  src={heroImg}
                  alt="MediMateAI peaceful clinical workspace"
                  className="w-full h-80 sm:h-96 object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating interactive simulated card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200/80 shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <MessageSquareHeart className="w-4 h-4 text-cyan-600" />
                      Consultation In Progress
                    </span>
                    <span className="text-[11px] text-slate-400">Just now</span>
                  </div>
                  <p className="text-xs text-slate-700 italic">
                    "My morning cough flares up when running in 45°F dry air..."
                  </p>
                  <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                    <Stethoscope className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Analyzed asthma context & suggested questions for Dr. Jenkins checkup.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. What MediMateAI Does (Core Pillars) */}
      <section id="how-it-works" className="py-16 md:py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">
              Comprehensive Health Organization
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
              Designed around clarity, privacy, and proactive daily care.
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Unlike generic search engines that incite anxiety, MediMateAI translates complex medical terms into serene, structured understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-cyan-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/10 text-cyan-700 flex items-center justify-center">
                <MessageSquareHeart className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Empathetic Health Discussions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Describe physical sensations, changes, or lab numbers in natural language. MediMateAI asks thoughtful clarifying questions and explores potential explanations clearly without jumping to worst-case scenarios.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-cyan-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-700 flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Medication & Routine Tracking</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never lose track of your prescriptions, instructions, or adherence. Maintain schedule routines, log daily doses with streaks, and ask specific safety questions regarding food and drug interactions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4 hover:border-cyan-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-700 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Confidential Health Dossier</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolidate your allergies, chronic conditions, family history, and biometric records. When symptoms occur, MediMateAI factors in your personal profile to provide truly tailored conversational context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI Health Assistant Overview with Imagery */}
      <section id="assistant" className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Feature Highlight 1: Symptom Guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 order-2 lg:order-1">
              <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wider">
                Clinical Communication
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Understand symptoms with structured uncertainty.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Healthcare is nuanced. MediMateAI is engineered to state clearly what symptoms could suggest, what questions you should answer for yourself, and what to report to your doctor. It never fabricates citations or pretends to have conducted an in-person physical examination.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Immediate detection of acute red-flag emergencies (e.g. cardiac, stroke)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Auto-generates relevant questions to bring to your next clinical checkup</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Continuous conversation history with 1-click continuation</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <img
                  src={symptomImg}
                  alt="Doctor reviewing health telemetry empathetically"
                  className="w-full h-72 sm:h-80 object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

          {/* Feature Highlight 2: Medication Organization */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <img
                  src={medImg}
                  alt="Minimalist medication organizer and water on stone surface"
                  className="w-full h-72 sm:h-80 object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                Adherence & Safety
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Active medication tracking and safety checks.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Stay consistent with your prescribed medications. Keep records of your daily morning, afternoon, and evening routines, track doses taken with a single tap, and consult MediMateAI on food instructions and common adverse interactions.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Daily adherence logging with instant visual streak tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Instant "Ask AI about this medication" shortcut button</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Archive inactive or past antibiotic courses without deleting records</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature Highlight 3: Health Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 order-2 lg:order-1">
              <span className="text-xs font-semibold text-sky-700 uppercase tracking-wider">
                Personalized Context
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Your health profile, structured and always in your control.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Allergies, chronic conditions, and surgical history are safely stored in your encrypted personal profile. You choose what to record, update it at any time, or export your full dossier as a portable JSON archive.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Automated BMI calculation with metric and imperial options</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Severity classifications for drug, environmental, and food allergies</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Emergency contact records readily accessible in an urgent situation</span>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-6 order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                <img
                  src={profileImg}
                  alt="Modern health telemetry and records notebook on desk"
                  className="w-full h-72 sm:h-80 object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. How It Works (Steps) */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <h2 className="text-xs font-semibold tracking-wider text-cyan-700 uppercase">
              Intuitive Workflow
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Three simple steps to proactive health management.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-600">01</span>
              <h4 className="text-base font-bold text-slate-900">Set Up Your Profile</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your baseline details, known allergies, chronic conditions, and current medications in just a few minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-600">02</span>
              <h4 className="text-base font-bold text-slate-900">Consult MediMateAI</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions when feeling under the weather, review medication times, or get assistance deciphering clinical lab results.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-mono font-bold text-cyan-600">03</span>
              <h4 className="text-base font-bold text-slate-900">Partner With Your Doctor</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bring organized symptom logs and physician checkup questions directly to your appointments for more productive care.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Privacy & Security Section */}
      <section id="privacy" className="py-16 md:py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-cyan-300 text-xs font-semibold border border-slate-700">
                <Lock className="w-3.5 h-3.5" />
                <span>Zero Compromise on Privacy</span>
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-white">
                Your medical data belongs exclusively to you.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Health information is sacred. We never sell your personal records, profile entries, or conversation transcripts. All interactions are protected under scoped authentication and can be exported or purged on demand.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scoped User Isolation</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every database query is strictly scoped to the authenticated session ID. Cross-tenant leakage is mathematically prohibited.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <Lock className="w-5 h-5 text-teal-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Complete Data Portability</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Export all your conversations, medication histories, and biometric records in 1-click JSON format anytime.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Permanent Purge Control</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Deleting your conversations or account permanently wipes all records from the storage system.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <Activity className="w-5 h-5 text-sky-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Zero Ad Tracking</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No third-party trackers, telemetry cookies, or behavioral advertising pixels anywhere on the application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Medical Safety Disclaimer Banner */}
      <section id="safety" className="py-12 bg-amber-50/70 border-b border-amber-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 rounded-2xl bg-white border border-amber-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  Ethical Medical AI Disclaimer
                </h4>
                <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                  MediMateAI provides educational health information and health organization tools. It does not replace a licensed medical professional, cannot offer a confirmed diagnosis, and should never be used during an acute medical emergency.
                </p>
              </div>
            </div>
            <button
              onClick={() => setDisclaimerOpen(true)}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
            >
              Read Full Medical Protocol
            </button>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-16 md:py-24 bg-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
            Start taking control of your daily wellness today.
          </h3>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Join MediMateAI to keep your prescriptions on track, discuss your symptoms safely, and prepare for confident clinical checkups.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-all"
            >
              <span>Explore Demo Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="mt-auto py-10 bg-slate-100 border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 text-slate-900">
            <HeartHandshake className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-sm">MediMateAI</span>
            <span className="text-slate-400">· Personal Health Companion</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <button onClick={() => setDisclaimerOpen(true)} className="hover:text-slate-900 transition-colors">
              Medical Disclaimer
            </button>
            <Link to="/login" className="hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-slate-900 transition-colors">
              Register
            </Link>
            <a href="#privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </a>
          </div>

          <div>
            <p>© {new Date().getFullYear()} MediMateAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
