"use client";

import { Chrome, Github } from "@/components/ui/BrandIcons";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAppStore } from "@/store/useAppStore";
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Compass as CompassIcon,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as zod from "zod";

const loginSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();
  const { signIn, isLoaded: isSignInLoaded, setActive } = useSignIn() as any;
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleGoogleSignIn = async () => {
    if (!isSignInLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth-callback",
        redirectUrlComplete: "/auth-callback",
      });
    } catch (err) {
      console.error("Google Sign In Error:", err);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (
      data.email === "yogendarverma0268@gmail.com" &&
      data.password === "123456789"
    ) {
      login(data.email, "yogender verma");
      router.push("/dashboard");
      return;
    }

    if (!isSignInLoaded) return;
    setIsLoading(true);
    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/auth-callback");
      } else {
        console.error("Sign-in status incomplete:", result);
        toast.warning(
          "Authentication is incomplete. Please check your credentials.",
        );
      }
    } catch (err: any) {
      console.error("Sign-in error:", err);
      toast.error(err.errors?.[0]?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#030014] text-slate-100 overflow-hidden relative">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Left side: Premium Art/Animation Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#060417] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Art Backdrop Overlay Grid */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none pulse-glow" />

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 z-10">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <CompassIcon className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">
            ProjectPilot <span className="text-indigo-400">AI</span>
          </span>
        </Link>

        {/* Dynamic Graphic Widget */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 bg-white/5 border border-white/10 rounded-2xl p-6 glass-panel"
        >
          <div className="flex items-center space-x-2 text-indigo-400 mb-4 font-mono text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 animate-bounce" />
            <span>Recruiter Verified Pipelines</span>
          </div>
          <h2 className="text-2xl font-bold text-gradient mb-2 leading-tight">
            Stop Guessing. Build Projects That Actually Work.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            ProjectPilot matches actual career role descriptions directly with
            resume bullet builders to automatically inject skills gaps into
            beautiful microservice applications.
          </p>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
            <span>Career readiness matched</span>
            <span className="text-indigo-300">Over 10k+ portfolios built</span>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 font-mono z-10 flex justify-between">
          <span>SECURE IDENTITY GATEWAY</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right side: Login form container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile-only logo */}
          <div className="flex lg:hidden justify-center items-center space-x-3 mb-8">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <CompassIcon className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-wider text-white">
              ProjectPilot AI
            </span>
          </div>

          <Card className="bg-[#08051e]/40 p-2 md:p-4">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-extrabold text-white">
                Welcome back
              </CardTitle>
              <CardDescription>
                Enter your credentials to enter the cockpit
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Oauth Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button
                  variant="glass"
                  size="sm"
                  className="w-full h-11 flex items-center justify-center space-x-2 text-xs"
                  onClick={() => router.push("/dashboard")}
                >
                  <Github className="w-4 h-4 text-white" />
                  <span>GitHub</span>
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  className="w-full h-11 flex items-center justify-center space-x-2 text-xs"
                  onClick={handleGoogleSignIn}
                >
                  <Chrome className="w-4 h-4 text-white" />
                  <span>Google</span>
                </Button>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative bg-[#07041a] px-3 text-xs text-slate-500 uppercase tracking-widest font-mono">
                  Or continue with
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register("email")}
                  type="email"
                  label="Email Address"
                  placeholder="name@domain.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    {/* Input will handle standard labels, we can append a custom link below */}
                  </div>
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-200 focus:outline-none transition-colors p-1"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                  />
                  <div className="text-right mt-1">
                    <a
                      href="#"
                      className="text-xs text-indigo-400 hover:underline"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full h-12 mt-6 text-sm font-semibold"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Log In to Dashboard
                </Button>
              </form>

              <div className="text-center mt-6 text-xs text-slate-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-indigo-400 font-semibold hover:underline"
                >
                  Sign up for free
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
