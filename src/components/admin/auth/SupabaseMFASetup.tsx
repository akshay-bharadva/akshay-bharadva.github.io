import React, { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, Copy, Eye, EyeOff } from "lucide-react";
import { config } from "@/lib/config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSignOutMutation } from "@/store/api/adminApi";

export default function SupabaseMFASetup() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [manualEntryKey, setManualEntryKey] = useState("");
  const [factorId, setFactorId] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const router = useRouter();
  const [signOut] = useSignOutMutation();

  useEffect(() => {
    const protectPageAndEnroll = async () => {
      if (!supabase) return;
      setIsLoadingState(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: config.mfa.issuer,
        friendlyName: `${session.user.email} (${config.mfa.appName})`,
      });

      if (enrollError) {
        let errorMessage =
          enrollError.message || "Failed to start MFA enrollment.";
        if (enrollError.message.includes("Enrolled factors exceed")) {
          errorMessage =
            "MFA is already set up. Try logging in or manage factors in your security settings.";
        }
        setError(errorMessage);
        setIsLoadingState(false);
        return;
      }

      if (data) {
        setQrCodeUrl(data.totp.qr_code);
        setManualEntryKey(data.totp.secret);
        setFactorId(data.id);
      }
      setIsLoadingState(false);
    };
    protectPageAndEnroll();
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setIsLoadingState(true);
    setError("");

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId });

    if (challengeError) {
      setIsLoadingState(false);
      setError(challengeError.message || "Failed to create MFA challenge.");
      return;
    }

    const challengeId = challengeData.id;
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code: otp,
    });

    setIsLoadingState(false);
    if (verifyError) {
      setError(verifyError.message || "Invalid OTP. Please try again.");
      setOtp("");
      return;
    }

    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    router.replace("/admin");
  };

  const handleSignOut = async () => {
    await signOut().unwrap();
    router.replace("/admin/login");
  };

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(manualEntryKey);
    } catch (err) {
      console.error("Failed to copy secret:", err);
      setError("Failed to copy. Please copy manually.");
    }
  };

  const stepVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (isLoadingState && !qrCodeUrl && !error) {
    return (
      <motion.div
        key="mfa-setup-loading"
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
      key="mfa-setup-page"
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen items-center justify-center bg-grid-pattern px-4 py-12"
    >
      <div className="w-full max-w-lg space-y-8 rounded-lg bg-blueprint-bg p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
            <Smartphone className="size-6 text-primary" />
          </div>
          <h2 className="font-mono text-3xl font-bold text-foreground">
            Set Up 2FA
          </h2>
          <p className="mt-2 text-muted-foreground">
            Secure your admin account with an authenticator app.
          </p>
        </div>

        <AnimatePresence>
          {error && !factorId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Alert variant="destructive">
                <AlertTitle>Enrollment Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button
                className="mt-4 w-full"
                onClick={() => router.push("/admin/login")}
              >
                Return to Login
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        {factorId && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="font-mono text-lg font-bold text-foreground">
                <span className="mr-2 text-primary">1.</span> Scan QR Code
              </h3>
              <p className="text-sm text-muted-foreground">
                Open your authenticator app (e.g., Google Authenticator, Authy)
                and scan this QR code.
              </p>
              {qrCodeUrl ? (
                <div className="flex justify-center rounded-lg bg-white p-2">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code for MFA setup"
                    className="size-48"
                  />
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center rounded-lg bg-secondary">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="font-mono text-lg font-bold text-foreground">
                <span className="mr-2 text-primary">2.</span> Manual Entry
              </h3>
              <p className="text-sm text-muted-foreground">
                If you can't scan, enter this secret key into your app.
              </p>
              <div className="flex items-center gap-2 rounded-md border bg-secondary p-3">
                <code className="flex-1 break-all font-mono text-sm tracking-widest text-foreground">
                  {showSecret
                    ? manualEntryKey.match(/.{1,4}/g)?.join(" ")
                    : "•••• •••• •••• ••••"}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSecret(!showSecret)}
                  aria-label={showSecret ? "Hide key" : "Show key"}
                >
                  {showSecret ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={copySecret}
                  aria-label="Copy key"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <h3 className="font-mono text-lg font-bold text-foreground">
                    <span className="mr-2 text-primary">3.</span> Verify Code
                  </h3>
                  <label
                    htmlFor="totpCode"
                    className="mt-2 block text-sm text-muted-foreground"
                  >
                    Enter the 6-digit code from your app to complete setup.
                  </label>
                  <div className="mt-2">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
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
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex flex-col gap-3 sm:flex-row-reverse">
                  <Button
                    type="submit"
                    disabled={isLoadingState || otp.length !== 6}
                    className="flex-1"
                  >
                    {isLoadingState ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Verify & Complete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleSignOut}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}