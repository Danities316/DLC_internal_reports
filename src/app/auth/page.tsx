"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signup, login } from "../actions/auth";
import { ShieldCheck, LogIn, UserPlus, Phone, User, Key, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-3 bg-accent hover:opacity-90 text-white px-6 py-3.25 rounded-md text-sm font-bold shadow-sm transition active:scale-95 disabled:opacity-50"
    >
      {pending ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        label
      )}
    </button>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction] = useFormState(login, null);
  const [signupState, signupAction] = useFormState(signup, null);

  const error = mode === "login" ? loginState?.error : signupState?.error;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
      <div className="w-full max-w-sm">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-sidebar rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-sidebar mb-1">DLC Reporting</h1>
            <p className="text-text-muted text-xs uppercase tracking-widest font-bold">
              {mode === "login" ? "Operational Login" : "Staff Registration"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                action={loginAction}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Phone / PIN</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <input
                      name="identifier"
                      placeholder="Input ID..."
                      className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-md text-sm focus:border-accent outline-none transition font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Verification PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <input
                      name="pin"
                      type="password"
                      placeholder="C-xxxx"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-md text-sm focus:border-accent outline-none transition font-mono"
                    />
                  </div>
                </div>
                <SubmitButton label="Authorize Access" />
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                action={signupAction}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <input
                      name="name"
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-md text-sm focus:border-accent outline-none transition"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <input
                      name="phone"
                      placeholder="Operational Phone"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-md text-sm focus:border-accent outline-none transition font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Login PIN (C-xxxx)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                    <input
                      name="pin"
                      placeholder="C-1234"
                      className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-md text-sm focus:border-accent outline-none transition font-mono"
                    />
                  </div>
                </div>
                <SubmitButton label="Create Account" />
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-md text-[11px] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-border flex justify-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[11px] font-bold text-accent uppercase tracking-widest hover:underline"
            >
              {mode === "login" ? "Need an account? Sign up" : "Already registered? Log in"}
            </button>
          </div>
        </div>
        <p className="mt-8 text-center text-[10px] uppercase font-bold text-text-muted tracking-widest">
          Federal Road Safety Corps Nigeria
        </p>
      </div>
    </div>
  );
}
