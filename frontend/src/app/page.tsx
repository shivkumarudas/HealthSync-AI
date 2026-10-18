"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Apple,
  Dumbbell,
  MessageCircle,
  Stethoscope,
  LayoutDashboard,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    title: "AI Medical Report Analyzer",
    description: "Upload medical reports, lab results, and prescriptions (PDFs or images) to receive structured, plain-language insights powered by Google Gemini.",
    icon: FileText,
    href: "/report-analyzer",
    color: "from-blue-500/20 to-blue-600/5 text-blue-400 border-blue-500/30",
    badge: "Multimodal AI",
  },
  {
    title: "AI Diet Planner",
    description: "Personalized nutrition plans customized to your health goals, medical conditions, allergies, and dietary preferences.",
    icon: Apple,
    href: "/diet-planner",
    color: "from-emerald-500/20 to-emerald-600/5 text-emerald-400 border-emerald-500/30",
    badge: "Custom Nutrition",
  },
  {
    title: "AI Exercise Planner",
    description: "Smart workout routines tailored to your fitness level, equipment availability, schedule, and rehabilitation needs.",
    icon: Dumbbell,
    href: "/exercise-planner",
    color: "from-amber-500/20 to-amber-600/5 text-amber-400 border-amber-500/30",
    badge: "Adaptive Fitness",
  },
  {
    title: "AI Health Assistant",
    description: "Ask health and wellness questions and get AI-generated information to discuss with a qualified clinician.",
    icon: MessageCircle,
    href: "/chatbot",
    color: "from-purple-500/20 to-purple-600/5 text-purple-400 border-purple-500/30",
    badge: "24/7 Chatbot",
  },
  {
    title: "Doctor Recommendation",
    description: "Search for doctors and clinics by specialty and location.",
    icon: Stethoscope,
    href: "/doctors",
    color: "from-rose-500/20 to-rose-600/5 text-rose-400 border-rose-500/30",
    badge: "Specialist Finder",
  },
  {
    title: "Health Metrics Dashboard",
    description: "Monitor your BMI, health profile, past analyses, and personalized fitness journey with synchronized storage.",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "from-teal-500/20 to-teal-600/5 text-teal-400 border-teal-500/30",
    badge: "Analytics",
  },
];

const steps = [
  {
    step: "01",
    title: "Create Your Profile",
    description: "Set up your medical context, goals, allergies, and lifestyle parameters securely.",
  },
  {
    step: "02",
    title: "Consult Gemini AI",
    description: "Upload diagnostics, request meal plans, workout schedules, or ask health questions.",
  },
  {
    step: "03",
    title: "Track & Improve",
    description: "View synchronized insights, download reports, and connect with relevant healthcare specialists.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 hero-bg">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-950/80 border border-primary-800/60 text-primary-400 text-xs sm:text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>Next-Generation Healthcare Intelligence</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            Your Health, <br />
            <span className="text-gradient">Supercharged by AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Review medical reports, explore personalized nutrition and workout ideas, ask health
            questions, and search for doctors by specialty and location.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/login?tab=register"
              className="btn-primary text-base px-8 py-3.5 shadow-lg shadow-primary-600/20 group"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="btn-outline text-base px-8 py-3.5"
            >
              Sign In to Account
            </Link>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-16 pt-8 border-t border-gray-800/80"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">5</span>
              <span className="text-xs sm:text-sm text-gray-400 mt-1">Health tools</span>
            </div>
            <div className="flex flex-col items-center border-x border-gray-800">
              <span className="text-2xl sm:text-3xl font-bold text-primary-400">Gemini</span>
              <span className="text-xs sm:text-sm text-gray-400 mt-1">AI provider</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">SQLite</span>
              <span className="text-xs sm:text-sm text-gray-400 mt-1">Profile &amp; history</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <span className="section-pill mb-3">Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            Engineered for Precision and Care
          </h2>
          <p className="text-gray-400 mt-3 max-w-xl mx-auto text-sm sm:text-base">
            Everything you need to decipher complex labs, maintain optimal fitness, and consult healthcare guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group relative rounded-2xl bg-gray-900 border border-gray-800/90 p-6 hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br border ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
                >
                  Explore Feature
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/40 border-y border-gray-800/80">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-pill mb-3">Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
              How HealthSync Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((st, i) => (
              <div key={st.step} className="card relative bg-gray-950/60 border-gray-800/80 p-6 flex flex-col items-start">
                <span className="text-3xl font-extrabold text-primary-500/30 mb-4">{st.step}</span>
                <h4 className="text-lg font-bold text-white mb-2">{st.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{st.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="card-glow p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Take Charge of Your Health Today
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto mb-8 text-sm sm:text-base">
              Create an account to manage your health profile and explore the available AI tools.
            </p>
            <Link
              href="/login?tab=register"
              className="btn-primary text-base px-8 py-3.5 shadow-xl shadow-primary-500/20"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
