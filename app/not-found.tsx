"use client";

import { motion } from "framer-motion";
import { Compass, Home, Sparkles, Terminal } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030014] flex items-center justify-center px-6">
      <div className="absolute inset-0 grid-bg grid-animated opacity-30" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-600/10 blur-[140px]" />
      <div className="absolute top-[30%] left-[-10%] w-[350px] h-[350px] rounded-full bg-pink-600/10 blur-[130px]" />

      {/* Floating Content */}
      <motion.main
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-2xl text-center"
      >

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Badge
            variant="primary"
            className="inline-flex items-center gap-2 mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Navigation Error Detected
          </Badge>
        </motion.div>


        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-[120px] sm:text-[160px] md:text-[190px] leading-none font-black tracking-tighter text-gradient"
        >
          404
        </motion.h1>


        <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
          Lost in the Project Universe
        </h2>

        <p className="mt-6 max-w-lg mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          The page you're trying to reach doesn't exist, has been moved,
          or the coordinates provided are incorrect.
          Let's navigate you back to a safe destination.
        </p>


        <div className="mt-10 flex justify-center">
          <Link href="/">
            <Button
              variant="premium"
              size="lg"
              className="btn-glowing px-8"
              leftIcon={<Home className="w-5 h-5" />}
            >
              Return Home
            </Button>
          </Link>
        </div>


        {/* Bottom Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center justify-center gap-6 text-xs text-slate-500 font-mono"
        >
          <span className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            ProjectPilot Core
          </span>
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            Route: undefined
          </span>
        </motion.div>

      </motion.main>
    </div>
  );
}