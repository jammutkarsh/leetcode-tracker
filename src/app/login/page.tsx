"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [instanceKey, setInstanceKey] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/verify-instance", {
        method: "POST",
        headers: {
          "x-instance-key": instanceKey,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid secret key");
        return;
      }

      setStep(2);
    } catch {
      setError("An error occurred verifying the key");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-instance-key": instanceKey,
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Success
      router.push("/");
      router.refresh();
    } catch {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Private Access</CardTitle>
          <CardDescription>
            Enter the instance key to access this private instance.
          </CardDescription>
        </CardHeader>
        <form onSubmit={step === 1 ? handleNextStep : handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            {step === 1 ? (
              <div className="space-y-2">
                <Label htmlFor="instanceKey">Instance Secret Key</Label>
                <Input
                  id="instanceKey"
                  type="password"
                  placeholder="Enter secret knock..."
                  value={instanceKey}
                  onChange={(e) => setInstanceKey(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Authenticating..." : step === 1 ? "Next" : "Enter"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
