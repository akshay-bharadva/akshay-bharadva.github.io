
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { KeyRound, Loader2 } from "lucide-react";
import { useSignOutMutation } from "@/store/api/adminApi";

export default function SupabaseMFAChallenge() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [remainingTime, setRemainingTime] = useState(30);
  const [factorId, setFactorId] = useState<string | null>(null);
  const router = useRouter();
  const [signOut] = useSignOutMutation();

  useEffect(() => {
    const protectPageAndGetFactor = async () => {
      if (!supabase) return;
      setIsLoadingState(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalError) {
        setError("Could not check MFA status: " + aalError.message);
        setIsLoadingState(false);
        return;
      }

      if (aalData?.currentLevel === "aal2") {
        router.replace("/admin");
        return;
      }
      if (aalData?.currentLevel !== "aal1" || aalData?.nextLevel !== "aal2") {
        router.replace("/admin/login");
        return;
      }

      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError || !factorsData?.totp?.length) {
        setError("Could not retrieve MFA factor. Please try logging in again.");
        setIsLoadingState(false);
        router.replace("/admin/login");
        return;
      }

      const firstVerifiedFactor = factorsData.totp.find(
        (f) => f.status === "verified",
      );
      if (firstVerifiedFactor) {
        setFactorId(firstVerifiedFactor.id);
      } else {
        setError(
          "No verified MFA factor found. Please set up MFA or try logging in again.",
        );
        router.replace("/admin/setup-mfa");
        return;
      }
      setIsLoadingState(false);
    };
    protectPageAndGetFactor();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(30 - (new Date().getSeconds() % 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (e: React.FormEvent | string) => {
    if (typeof e !== "string") e.preventDefault();
    if (!supabase) return;
    if (!factorId) {
      setError("MFA factor ID is missing. Please try logging in again.");
      return;
    }
    setIsLoadingState(true);
    setError("");

    const codeToVerify = typeof e === "string" ? e : otp;

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factorId,
      code: codeToVerify,
    });

    setIsLoadingState(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
      setOtp("");
      return;
    }

    router.replace("/admin");
  };

  const handleSignOut = async () => {
    setIsLoadingState(true);
    await signOut().unwrap();
    router.replace("/admin/login");
  };

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (isLoadingState && !error && !factorId) {
    return (
      <motion.div
        key="mfa-challenge-loading"
        variants={stepVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex min-h-screen items-center justify-center bg-grid-pattern"
      >
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </motion.div>
    );
  }

  return (
    <motion.div
      key="mfa-challenge-page"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="flex min-h-screen items-center justify-center bg-grid-pattern px-4"
    >
      <div className="w-full max-w-sm space-y-8 rounded-lg bg-blueprint-bg p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
            <KeyRound className="size-6 text-primary" />
          </div>
          <h2 className="font-mono text-3xl font-bold text-foreground">
            Security Challenge
          </h2>
          <p className="mt-2 text-muted-foreground">
            Enter the code from your authenticator app.
          </p>
        </div>{" "}
        <form className="space-y-6" onSubmit={handleVerify}>
          <div className="relative">
            <label htmlFor="totpCode" className="sr-only">
              Verification Code
            </label>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              onComplete={handleVerify}
            >
              <InputOTPGroup className="w-full justify-center">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center text-xs text-muted-foreground"
              aria-hidden="true"
            >
              Code resets in{" "}
              <span className="font-mono font-bold text-foreground">
                {remainingTime}s
              </span>
            </div>
          </div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-md border border-destructive/50 bg-destructive/10 p-3"
              >
                <p className="text-sm font-medium text-destructive">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            type="submit"
            disabled={isLoadingState || otp.length !== 6 || !factorId}
            className="w-full"
          >
            {isLoadingState ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Sign In"
            )}
          </Button>{" "}
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              className="text-sm text-muted-foreground"
              onClick={handleSignOut}
            >
              Cancel and sign out
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}