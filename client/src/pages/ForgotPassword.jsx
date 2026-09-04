import { useState } from 'react';
import {
  Link,
  useNavigate
} from 'react-router-dom';
import api from '../api/axios.js';

function getPasswordStrength(password) {
  if (!password) {
    return {
      label: '',
      score: 0
    };
  }

  let score = 0;

  if (
    password.length >= 8 &&
    password.length <= 16
  ) {
    score++;
  }

  if (/[A-Za-z]/.test(password)) {
    score++;
  }

  if (/[0-9]/.test(password)) {
    score++;
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score++;
  }

  if (password.length >= 12) {
    score++;
  }

  if (score <= 2) {
    return {
      label: 'Weak',
      score
    };
  }

  if (score <= 4) {
    return {
      label: 'Medium',
      score
    };
  }

  return {
    label: 'Strong',
    score
  };
}

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] =
    useState('email');

  const [email, setEmail] =
    useState('');

  const [otp, setOtp] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [resending, setResending] =
    useState(false);

  const [resendCooldown, setResendCooldown] =
    useState(0);

  const passwordStrength =
    getPasswordStrength(password);

  const startResendCooldown = () => {
    setResendCooldown(60);

    const interval =
      setInterval(() => {
        setResendCooldown(
          (prev) => {
            if (prev <= 1) {
              clearInterval(
                interval
              );

              return 0;
            }

            return prev - 1;
          }
        );
      }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    if (!cleanEmail) {
      alert(
        'Please enter your email'
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          '/auth/forgot-password',
          {
            email: cleanEmail
          }
        );

      setEmail(cleanEmail);

      setStep('otp');

      startResendCooldown();

      alert(
        response.data?.message ||
        'If an account exists, an OTP has been sent to your email.'
      );
    } catch (error) {
      console.error(
        'Forgot Password Error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Unable to process request.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const cleanOtp =
      otp.trim();

    if (
      !/^\d{6}$/.test(cleanOtp)
    ) {
      alert(
        'Please enter a valid 6-digit OTP'
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          '/auth/forgot-password/verify-otp',
          {
            email,
            otp: cleanOtp
          }
        );

      if (
        response.data?.success
      ) {
        setStep('password');

        alert(
          'OTP verified successfully.'
        );
      }
    } catch (error) {
      console.error(
        'Verify Reset OTP Error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'OTP verification failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (
      resendCooldown > 0 ||
      resending
    ) {
      return;
    }

    try {
      setResending(true);

      const response =
        await api.post(
          '/auth/forgot-password/resend-otp',
          {
            email
          }
        );

      if (
        response.data?.success
      ) {
        setOtp('');

        startResendCooldown();

        alert(
          'A new OTP has been sent to your email.'
        );
      }
    } catch (error) {
      console.error(
        'Resend Reset OTP Error:',
        error
      );

      alert(
        error.response?.data?.message ||
        'Unable to resend OTP.'
      );
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword =
    async (e) => {
      e.preventDefault();

      if (
        password.length < 8 ||
        password.length > 16
      ) {
        alert(
          'Password must be between 8 and 16 characters'
        );

        return;
      }

      if (!/[A-Za-z]/.test(password)) {
        alert(
          'Password must contain at least one letter'
        );

        return;
      }

      if (!/[0-9]/.test(password)) {
        alert(
          'Password must contain at least one number'
        );

        return;
      }

      if (
        !/[^A-Za-z0-9]/.test(password)
      ) {
        alert(
          'Password must contain at least one special character'
        );

        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        alert(
          'Passwords do not match'
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            '/auth/forgot-password/reset',
            {
              email,
              password
            }
          );

        if (
          response.data?.success
        ) {
          alert(
            'Password reset successfully! Please login with your new password.'
          );

          navigate('/login');
        }
      } catch (error) {
        console.error(
          'Reset Password Error:',
          error
        );

        alert(
          error.response?.data?.message ||
          'Unable to reset password.'
        );
      } finally {
        setLoading(false);
      }
    };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp('');
      return;
    }

    if (step === 'password') {
      setStep('otp');
      setPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8 sm:py-10">

      <div className="w-full max-w-md">

        <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm p-6 sm:p-8">

          {step === 'email' && (
            <>
              <div className="text-center mb-8">

                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-indigo-100 border border-indigo-100 flex items-center justify-center text-2xl mb-4">
                  🔐
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800">
                  Forgot Password?
                </h2>

                <p className="text-slate-500 text-sm sm:text-base mt-2">
                  Enter your registered email and we'll send you an OTP.
                </p>

              </div>

              <form
                onSubmit={handleSendOtp}
                className="space-y-5"
              >

                <div>

                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="Enter your registered email"
                    maxLength={100}
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400 transition-colors"
                    required
                  />

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Sending OTP...'
                    : 'Send OTP'}
                </button>

              </form>

              <div className="text-center mt-6">

                <Link
                  to="/login"
                  className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors"
                >
                  ← Back to Login
                </Link>

              </div>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-indigo-100 border border-indigo-100 flex items-center justify-center text-3xl mb-4">
                  📧
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800">
                  Verify OTP
                </h2>

                <p className="text-slate-500 mt-2">
                  We've sent a 6-digit OTP to
                </p>

                <p className="font-semibold text-slate-800 mt-1 break-all">
                  {email}
                </p>

              </div>

              <form
                onSubmit={handleVerifyOtp}
                className="space-y-5 mt-7"
              >

                <div>

                  <label
                    htmlFor="otp"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Enter OTP
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) =>
                      setOtp(
                        e.target.value
                          .replace(
                            /\D/g,
                            ''
                          )
                          .slice(
                            0,
                            6
                          )
                      )
                    }
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-4 py-3 border border-indigo-100 rounded-xl bg-indigo-50/40 text-center text-xl tracking-[0.5em] focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400"
                    required
                  />

                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.length !== 6
                  }
                  className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Verifying...'
                    : 'Verify OTP'}
                </button>

              </form>

              <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">

                <p className="text-sm text-slate-500">
                  Didn't receive the OTP?
                </p>

                <button
                  type="button"
                  onClick={
                    handleResendOtp
                  }
                  disabled={
                    resendCooldown > 0 ||
                    resending
                  }
                  className="mt-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700 disabled:text-slate-400 transition-colors"
                >
                  {resending
                    ? 'Sending...'
                    : resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : 'Resend OTP'}
                </button>

              </div>

              <button
                type="button"
                onClick={handleBack}
                className="w-full mt-5 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                ← Change Email
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-indigo-100 border border-indigo-100 flex items-center justify-center text-3xl mb-4">
                  🔑
                </div>

                <h2 className="text-3xl font-extrabold text-slate-800">
                  Create New Password
                </h2>

                <p className="text-slate-500 mt-2 mb-6">
                  Enter a new password for your account.
                </p>

              </div>

              <form
                onSubmit={
                  handleResetPassword
                }
                className="space-y-5"
              >

                <div>

                  <label
                    htmlFor="new-password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    New Password
                  </label>

                  <div className="relative">

                    <input
                      id="new-password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Create a strong password"
                      maxLength={16}
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400 transition-colors"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword
                        ? '🙈'
                        : '👁️'}
                    </button>

                  </div>

                  {password && (
                    <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl p-3">

                      <div className="flex items-center justify-between mb-2">

                        <span className="text-xs text-slate-500 font-medium">
                          Password strength
                        </span>

                        <span
                          className={`text-xs font-bold ${
                            passwordStrength.label ===
                            'Strong'
                              ? 'text-emerald-600'
                              : passwordStrength.label ===
                                'Medium'
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {
                            passwordStrength.label
                          }
                        </span>

                      </div>

                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">

                        <div
                          className={`h-full transition-all ${
                            passwordStrength.label ===
                            'Strong'
                              ? 'w-full bg-emerald-500'
                              : passwordStrength.label ===
                                'Medium'
                              ? 'w-2/3 bg-amber-500'
                              : 'w-1/3 bg-rose-400'
                          }`}
                        />

                      </div>

                      <div className="mt-3 text-xs space-y-1.5">

                        <p
                          className={
                            password.length >= 8 &&
                            password.length <= 16
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }
                        >
                          {password.length >= 8 &&
                          password.length <= 16
                            ? '✓'
                            : '○'}{' '}
                          8-16 characters
                        </p>

                        <p
                          className={
                            /[A-Za-z]/.test(
                              password
                            )
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }
                        >
                          {/[A-Za-z]/.test(
                            password
                          )
                            ? '✓'
                            : '○'}{' '}
                          At least one letter
                        </p>

                        <p
                          className={
                            /[0-9]/.test(
                              password
                            )
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }
                        >
                          {/[0-9]/.test(
                            password
                          )
                            ? '✓'
                            : '○'}{' '}
                          At least one number
                        </p>

                        <p
                          className={
                            /[^A-Za-z0-9]/.test(
                              password
                            )
                              ? 'text-emerald-600'
                              : 'text-slate-400'
                          }
                        >
                          {/[^A-Za-z0-9]/.test(
                            password
                          )
                            ? '✓'
                            : '○'}{' '}
                          At least one special character
                        </p>

                      </div>

                    </div>
                  )}

                </div>

                <div>

                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <input
                      id="confirm-password"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm your new password"
                      maxLength={16}
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 text-slate-700 placeholder:text-slate-400 transition-colors"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) =>
                            !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-colors"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showConfirmPassword
                        ? '🙈'
                        : '👁️'}
                    </button>

                  </div>

                  {confirmPassword && (
                    <p
                      className={`text-xs mt-2 font-semibold ${
                        password ===
                        confirmPassword
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {password ===
                      confirmPassword
                        ? '✓ Passwords match'
                        : '✕ Passwords do not match'}
                    </p>
                  )}

                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 text-white font-semibold py-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? 'Resetting Password...'
                    : 'Reset Password'}
                </button>

              </form>

              <button
                type="button"
                onClick={handleBack}
                className="w-full mt-5 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                ← Back to OTP
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;