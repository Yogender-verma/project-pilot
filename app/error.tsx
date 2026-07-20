"use client";

import { motion } from "framer-motion";
import {
    AlertTriangle,
    Home,
    RefreshCw,
    Sparkles,
    Terminal,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ProjectPilot] Unhandled error:", error);
  }, [error]);

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 grid-bg grid-animated opacity-30" />

      <div className="absolute top-[-10%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-red-600/15 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[450px] w-[450px] rounded-full bg-orange-500/10 blur-[140px]" />
      <div className="absolute top-[30%] left-[-10%] h-[350px] w-[350px] rounded-full bg-yellow-500/10 blur-[130px]" />

      <motion.main
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-2xl text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Badge
            variant="primary"
            className="mb-8 inline-flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Runtime Error
          </Badge>
        </motion.div>

        {/* Error Code */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
         className="text-gradient text-[64px] leading-none font-black tracking-tighter sm:text-[96px] md:text-[120px]"
        >
          500
        </motion.h1>

        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 flex justify-center"
        >
          <div className="rounded-full bg-red-500/10 p-5">
            <AlertTriangle
              className="h-10 w-10 text-red-500"
              aria-hidden="true"
            />
          </div>
        </motion.div>

        {/* Heading */}
        <h2
          className="mt-6 text-3xl font-extrabold sm:text-4xl md:text-5xl"
          style={{ color: "var(--text-primary)" }}
        >
          Unexpected Application Error
        </h2>

        {/* Description */}
        <p
          className="mx-auto mt-6 max-w-lg text-sm leading-relaxed sm:text-base"
          style={{ color: "var(--text-secondary)" }}
        >
          Something unexpected happened while loading this page. Don't worry—
          your data is safe. You can try rendering the page again or return to
          your dashboard.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="premium"
            size="lg"
            className="btn-glowing px-8"
            leftIcon={<RefreshCw className="h-5 w-5" />}
            onClick={reset}
          >
            Try Again
          </Button>

          <Link href="/dashboard">
            <Button
              variant="outline"
              size="lg"
              className="px-8"
              leftIcon={<Home className="h-5 w-5" />}
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p
            className="mt-8 font-mono text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Error ID: {error.digest}
          </p>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            ProjectPilot Recovery
          </span>

          <span className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-orange-400" />
            Status: Recoverable Error
          </span>
        </motion.div>
      </motion.main>
    </div>
  );
}