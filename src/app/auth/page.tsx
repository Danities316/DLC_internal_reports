"use client";

import { useState, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signup, login } from "../actions/auth";
import { ShieldCheck, Phone, User, Key, AlertCircle, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function SubmitButton({ label, icon: Icon }: { label: string, icon: any }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-16 flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-white rounded-2xl text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
    >
      {pending ? (
        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction] = useActionState(login, null);
  const [signupState, signupAction] = useActionState(signup, null);

  const error = mode === "login" ? loginState?.error : signupState?.error;

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/10 border border-border">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight mb-2">Data Logs Center(DLC) Portal</h1>
          <p className="text-text-muted font-medium">
            {mode === "login" ? "Welcome back! Please log in to continue." : "Create your staff account to access the system."}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white p-8 lg:p-10 rounded-3xl border border-border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                action={loginAction}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted ml-1">Phone Number or PIN</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-5 w-5 h-5 text-primary/40" />
                    <input
                      name="identifier"
                      placeholder="e.g. C-1234 or 080..."
                      className="w-full h-14 pl-14 pr-5 bg-bg border border-border rounded-xl font-bold text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted ml-1">Password</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-5 w-5 h-5 text-primary/40" />
                    <input
                      name="pin"
                      type="password"
                      placeholder="••••"
                      className="w-full h-14 pl-14 pr-5 bg-bg border border-border rounded-xl font-bold text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <SubmitButton label="Log In" icon={LogIn} />
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                action={signupAction}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-5 top-5 w-5 h-5 text-primary/40" />
                    <input
                      name="name"
                      placeholder="Officer Name"
                      className="w-full h-14 pl-14 pr-5 bg-bg border border-border rounded-xl font-bold text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-5 w-5 h-5 text-primary/40" />
                    <input
                      name="phone"
                      placeholder="080..."
                      className="w-full h-14 pl-14 pr-5 bg-bg border border-border rounded-xl font-bold text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-muted ml-1">Assigned PIN</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-5 w-5 h-5 text-primary/40" />
                    <input
                      name="pin"
                      placeholder="C-0000"
                      className="w-full h-14 pl-14 pr-5 bg-bg border border-border rounded-xl font-bold text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <SubmitButton label="Create Account" icon={UserPlus} />
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 overflow-hidden">
              <div className="p-4 bg-accent/10 border border-accent/20 text-accent rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="mt-8 text-center">
          <p className="text-text-muted text-sm font-medium">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="ml-2 font-black text-primary hover:underline hover:text-accent transition-colors"
            >
              {mode === "login" ? "Register here" : "Log in"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
