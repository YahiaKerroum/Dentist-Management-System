import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, LogIn, ChevronDown } from 'lucide-react';
import { login } from '../services/auth.service';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { BrandMark } from './ui/BrandMark';
import { easeOutExpo } from '../lib/motion';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

const DEMO_ACCOUNTS = [
  { role: 'Manager', user: 'manager', pass: 'password123' },
  { role: 'Doctor', user: 'doctor', pass: 'password123' },
  { role: 'Assistant', user: 'assistant', pass: 'password123' },
];

/** Slow-drawing ECG trace across the brand panel. */
function PulseTrace() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-[28%] h-24 w-full -translate-y-1/2"
      viewBox="0 0 600 100"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
    >
      <motion.path
        d="M0,55 H120 L138,20 L158,88 L176,40 L188,55 H320 L338,10 L358,92 L376,55 H600"
        stroke="rgba(125, 218, 184, 0.35)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 2.4, ease: 'easeInOut', repeat: Infinity, repeatDelay: 4 },
          opacity: { duration: 0.4 },
        }}
      />
    </svg>
  );
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await login(username, password);
      if (response.success && response.data.accessToken) {
        onLoginSuccess(response.data.accessToken);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-surface-950 px-12 py-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 15% 20%, rgba(38,163,126,0.35), transparent 40%), radial-gradient(circle at 85% 80%, rgba(38,163,126,0.25), transparent 45%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <PulseTrace />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex items-center gap-3"
        >
          <BrandMark className="h-10 w-10" />
          <div>
            <span className="font-display text-lg font-semibold tracking-tight text-white">
              Clinic<span className="text-primary-400">Pulse</span>
            </span>
            <p className="text-[11px] leading-tight text-surface-500">Dental Practice OS</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easeOutExpo }}
          className="relative z-10 max-w-md"
        >
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white">
            Run your practice by its pulse.
          </h1>
          <p className="mt-4 text-surface-400">
            Every chair, every patient, every payment — one live view for the whole dental team.
          </p>
        </motion.div>

        <p className="relative z-10 text-xs text-surface-500">
          © {new Date().getFullYear()} Clinic Pulse — Dental Practice Management
        </p>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2">
              <BrandMark className="h-9 w-9" />
              <span className="font-display text-base font-semibold tracking-tight text-surface-900">
                Clinic<span className="text-primary-600">Pulse</span>
              </span>
            </div>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight text-surface-900">Welcome back</h2>
          <p className="mt-1.5 text-sm text-surface-500">Sign in to see today's pulse</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 rounded-md border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-700"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              leadingIcon={<User size={16} />}
              autoComplete="username"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              leadingIcon={<Lock size={16} />}
              autoComplete="current-password"
              required
            />

            <Button type="submit" isLoading={loading} className="w-full" size="lg">
              {!loading && <LogIn className="h-4 w-4" />}
              Sign in
            </Button>
          </form>

          <div className="mt-8 border-t border-surface-100 pt-4">
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-surface-400 transition-colors hover:text-surface-600"
            >
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDemo ? 'rotate-180' : ''}`} />
              Demo accounts
            </button>
            {showDemo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-1.5 overflow-hidden"
              >
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => {
                      setUsername(account.user);
                      setPassword(account.pass);
                    }}
                    className="flex w-full items-center justify-between rounded-md border border-surface-200 px-3 py-2 text-left text-xs transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    <span className="font-medium text-surface-700">{account.role}</span>
                    <span className="font-mono text-surface-400">{account.user} / {account.pass}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
