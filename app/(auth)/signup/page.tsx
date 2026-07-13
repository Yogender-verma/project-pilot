'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User as UserIcon, ArrowRight, Compass as CompassIcon, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Github, Chrome } from '@/components/ui/BrandIcons';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { useSignUp } from '@clerk/nextjs';

const signupSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
  careerGoal: zod.string().min(3, 'Please select or enter your dream career role')
});

type SignupFormValues = zod.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAppStore();
  const { signUp, isLoaded: isSignUpLoaded, setActive } = useSignUp() as any;
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Verification state machine
  const [verifying, setVerifying] = React.useState(false);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleGoogleSignUp = async () => {
    if (!isSignUpLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/auth-callback',
        redirectUrlComplete: '/auth-callback',
      });
    } catch (err) {
      console.error('Google Sign Up Error:', err);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      careerGoal: 'AI Engineer'
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    // Graceful development fallback if Clerk publishable key is missing or not yet loaded
    if (!isSignUpLoaded) {
      console.warn('Clerk is not initialized. Using developer environment sandbox fallback.');
      setTimeout(() => {
        signup(data.email, data.name, data.careerGoal);
        setIsLoading(false);
        router.push('/onboarding');
      }, 1000);
      return;
    }

    try {
      // Step 1: Programmatically spin up Clerk sign-up flow
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.name.split(' ')[0] || '',
        lastName: data.name.split(' ').slice(1).join(' ') || '',
      });

      // Step 2: Trigger email verification code dispatch
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerifying(true);
    } catch (err: any) {
      console.error('Sign-up error:', err);
      alert(err.errors?.[0]?.message || 'Registration failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignUpLoaded) return;
    setIsVerifying(true);
    try {
      // Step 3: Complete verification and activate Clerk session
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push('/auth-callback');
      } else {
        console.error('Verification status incomplete:', completeSignUp);
        alert('Verification status was not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      alert(err.errors?.[0]?.message || 'Invalid verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Render OTP Verification code form
  if (verifying) {
    return (
      <div className="min-h-screen flex bg-[#030014] text-slate-100 overflow-hidden relative items-center justify-center p-6">
        {/* Neon blur glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md z-10"
        >
          <Card className="bg-[#08051e]/40 p-6 md:p-8 glass-panel border-white/5">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                <CompassIcon className="w-6 h-6 animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-extrabold text-white">Verify Your Email</CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                We sent a 6-digit confirmation code to your inbox. Enter it below to unlock the cockpit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="space-y-6">
                <Input
                  label="Verification Code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="text-center font-mono text-xl tracking-widest h-12"
                />

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full h-12 text-sm font-semibold"
                  isLoading={isVerifying}
                >
                  Complete Registration
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#030014] text-slate-100 overflow-hidden relative">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Left side: Premium Art/Animation Panel (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#060417] border-r border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Art Backdrop Overlay Grid */}
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="absolute top-[20%] right-1/2 translate-x-1/2 w-80 h-80 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none pulse-glow" />

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
          <div className="flex items-center space-x-2 text-purple-400 mb-4 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>AI Powered Recommendations</span>
          </div>
          <h2 className="text-2xl font-bold text-gradient-purple mb-2 leading-tight">
            Design Your Ideal Career Blueprint Today.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Sign up now to build deep tech stacks. Our system generates detailed checklists, vector memory pipelines, and API integrations that recruiters seek in hiring pools.
          </p>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
            <span>Docker & Graph specs loaded</span>
            <span className="text-indigo-300">100% Free to start</span>
          </div>
        </motion.div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 font-mono z-10 flex justify-between">
          <span>SECURE IDENTITY GATEWAY</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* Right side: Signup form container */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center items-center space-x-3 mb-8">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
              <CompassIcon className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-wider text-white">ProjectPilot AI</span>
          </div>

          <Card className="bg-[#08051e]/40 p-2 md:p-4">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-extrabold text-white">Create your account</CardTitle>
              <CardDescription>Kickstart your technical journey with our AI guides</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Oauth Buttons */}
              <div className="grid grid-cols-1 gap-4 mb-6">
                <Button 
                  variant="glass" 
                  size="sm" 
                  className="w-full h-11 flex items-center justify-center space-x-2 text-xs"
                  onClick={handleGoogleSignUp}
                >
                  <Chrome className="w-4 h-4 text-white animate-pulse" />
                  <span>Continue with Google</span>
                </Button>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative bg-[#07041a] px-3 text-xs text-slate-500 uppercase tracking-widest font-mono">
                  Or register with
                </span>
              </div>

              <form 
                onSubmit={handleSubmit(
                  onSubmit, 
                  (err) => {
                    console.error('Validation errors:', err);
                    alert('Validation error: ' + JSON.stringify(err));
                  }
                )} 
                className="space-y-4"
              >
                <Input
                  {...register('name')}
                  type="text"
                  label="Full Name"
                  placeholder="yogender verma"
                  error={errors.name?.message}
                  leftIcon={<UserIcon className="w-4.5 h-4.5" />}
                />

                <Input
                  {...register('email')}
                  type="email"
                  label="Email Address"
                  placeholder="name@domain.com"
                  error={errors.email?.message}
                  leftIcon={<Mail className="w-4.5 h-4.5" />}
                />

                <Input
                  {...register('careerGoal')}
                  type="text"
                  label="Dream Career Role"
                  placeholder="AI Engineer"
                  error={errors.careerGoal?.message}
                  leftIcon={<CompassIcon className="w-4.5 h-4.5" />}
                />
                
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  leftIcon={<Lock className="w-4.5 h-4.5" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-200 focus:outline-none transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full h-12 mt-6 text-sm font-semibold animate-pulse"
                  style={{ animationDuration: '3s' }}
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Account & Onboard
                </Button>
              </form>

              <div className="text-center mt-6 text-xs text-slate-400">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
                  Log in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
