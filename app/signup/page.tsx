'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    showPhoneToNonPremium: true,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          showPhoneToNonPremium: formData.showPhoneToNonPremium,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to OTP verification page with user ID
        router.push(`/verification/${data.data.user.id}`);
      
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#18130e] text-stone-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-50 mb-2">Create Account</h1>
          <p className="text-stone-400">Join our marketplace today</p>
        </div>

        {/* Form */}
        <div className="bg-[#211a14] rounded-2xl shadow-2xl border border-amber-900/30 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-950/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                <User className="inline w-4 h-4 mr-1 text-amber-500" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full bg-[#18130e] px-4 py-3 border border-amber-900/30 rounded-lg text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                <Mail className="inline w-4 h-4 mr-1 text-amber-500" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
                className="w-full bg-[#18130e] px-4 py-3 border border-amber-900/30 rounded-lg text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                <Phone className="inline w-4 h-4 mr-1 text-amber-500" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+251 911 234 567"
                className="w-full bg-[#18130e] px-4 py-3 border border-amber-900/30 rounded-lg text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                required
              />
              <p className="mt-1 text-xs text-stone-400">
                Used for account verification and contact
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                <Lock className="inline w-4 h-4 mr-1 text-amber-500" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a password"
                  className="w-full bg-[#18130e] px-4 py-3 pr-12 border border-amber-900/30 rounded-lg text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                <Lock className="inline w-4 h-4 mr-1 text-amber-500" />
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                className="w-full bg-[#18130e] px-4 py-3 border border-amber-900/30 rounded-lg text-stone-100 placeholder-stone-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            {/* Phone Visibility Preference */}
            <div className="bg-[#18130e] border border-amber-900/30 rounded-lg p-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="showPhone"
                  checked={formData.showPhoneToNonPremium}
                  onChange={(e) => setFormData(prev => ({ ...prev, showPhoneToNonPremium: e.target.checked }))}
                  className="mt-1 h-4 w-4 accent-amber-500 border-amber-900/50 rounded focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="showPhone" className="ml-3 block text-sm text-amber-100/90 cursor-pointer">
                  <span className="font-medium text-amber-200">Show my phone number to all users</span>
                  <p className="mt-1 text-stone-400 text-xs">
                    Uncheck this to make your phone number visible only to premium users. 
                    This can be changed later in your profile settings.
                  </p>
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="text-sm text-stone-400">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                Privacy Policy
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold py-3 rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-md shadow-amber-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              {!loading && <ArrowRight className="w-5 h-5 text-stone-950" />}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-900/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#211a14] text-stone-400">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-amber-900/30 bg-[#18130e] hover:bg-[#282018] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-stone-200">Google</span>
            </button>
            <button
              onClick={() => signIn('facebook', { callbackUrl: '/' })}
              className="flex items-center justify-center space-x-2 px-4 py-3 border border-amber-900/30 bg-[#18130e] hover:bg-[#282018] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-medium text-stone-200">Facebook</span>
            </button>
          </div>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-stone-400">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}