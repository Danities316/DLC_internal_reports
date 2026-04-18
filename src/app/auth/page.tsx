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
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-12 rounded-lg border border-border shadow-sm">
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-sidebar rounded-md flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sidebar/20 rotate-[-4deg]">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-black text-sidebar tracking-tighter mb-1 uppercase">Operational Entry</h1>
            <p className="label-upper !mb-0">
              {mode === "login" ? "Standard Session" : "Credential Provisioning"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {mode === "login" ? (
              <motion.form
                key="login"
                action={loginAction}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="label-upper !mb-0 opacity-60">Identity Vector</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
                    <input
                      name="identifier"
                      placeholder="Phone or PIN"
                      className="input-field-mono pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-upper !mb-0 opacity-60">Authorized PIN</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
                    <input
                      name="pin"
                      type="password"
                      placeholder="••••"
                      className="input-field-mono pl-10 h-11"
                    />
                  </div>
                </div>
                <SubmitButton label="Initialize Access" />
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                action={signupAction}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="label-upper !mb-0 opacity-60">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
                    <input
                      name="name"
                      placeholder="Officer Name"
                      className="input-field pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-upper !mb-0 opacity-60">Operations Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
                    <input
                      name="phone"
                      placeholder="+234..."
                      className="input-field-mono pl-10 h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-upper !mb-0 opacity-60">Assigned PIN (C-xxxx)</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
                    <input
                      name="pin"
                      placeholder="C-0000"
                      className="input-field-mono pl-10 h-11"
                    />
                  </div>
                </div>
                <SubmitButton label="Register Station" />
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="mt-10 pt-8 border-t border-border flex justify-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-[10px] font-black text-accent uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
            >
              {mode === "login" ? "Create New Profile" : "Existing Credentials"}
            </button>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-3 opacity-20">
          <div className="h-[1px] w-8 bg-sidebar" />
          <p className="text-[9px] uppercase font-black tracking-[0.3em] text-sidebar">
            Federal Road Safety Corps
          </p>
          <div className="h-[1px] w-8 bg-sidebar" />
        </div>
      </div>
    </div>
  );
}
