"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authService } from "@/lib/api";

type Step = 1 | 2 | 3;

// Validation functions
const isValidEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

const isValidPhone = (value: string): boolean => {
    // Remove common phone number characters for validation
    const cleaned = value.replace(/[\s\-\(\)\+]/g, '');
    // Check if it contains only digits and has a reasonable length (7-15 digits)
    const phoneRegex = /^\d{7,15}$/;
    return phoneRegex.test(cleaned);
};

type AuthMode = 'signup' | 'signin';

const EmailStep = ({ 
    onNext, 
    onIdentifierSet,
    mode,
    onModeChange 
}: { 
    onNext: () => void; 
    onIdentifierSet: (identifier: string, verificationId: string) => void;
    mode: AuthMode;
    onModeChange: (mode: AuthMode) => void;
}) => {
    const router = useRouter();
    const [inputValue, setInputValue] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        // Clear error when user starts typing
        if (error) {
            setError("");
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        // Clear error when user starts typing
        if (error) {
            setError("");
        }
    };

    const handleContinue = async () => {
        const trimmedValue = inputValue.trim();
        
        if (!trimmedValue) {
            setError("Please enter your email or phone number");
            return;
        }

        if (!isValidEmail(trimmedValue) && !isValidPhone(trimmedValue)) {
            setError("Please enter a valid email address or phone number");
            return;
        }

        // For sign in, validate password
        if (mode === 'signin') {
            if (!password.trim()) {
                setError("Please enter your password");
                return;
            }
        }

        setLoading(true);
        setError("");

        try {
            if (mode === 'signin') {
                // Login flow
                const response = await authService.login({
                    identifier: trimmedValue,
                    password: password.trim(),
                });

                if (response.success && response.data) {
                    // Login successful, trigger session refresh and navigate to home
                    window.dispatchEvent(new CustomEvent('auth:success'));
                    router.push("/home");
                } else {
                    setError(response.message || "Invalid email/phone or password");
                }
            } else {
                // Sign up flow - start registration
                const response = await authService.registerStart({ identifier: trimmedValue });
                if (response.success && response.data && response.data.verificationId) {
                    // onIdentifierSet will handle setting the verificationId and moving to next step
                    // No need to reset loading here as component will unmount on step transition
                    onIdentifierSet(trimmedValue, response.data.verificationId);
                } else {
                    setError(response.message || "Failed to send verification code");
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : mode === 'signin' ? "Invalid email/phone or password. Please try again." : "Failed to send verification code. Please try again.");
        } finally {
            // Only reset loading if we're still on this step (i.e., if there was an error or signin)
            // If signup successful, the component will unmount when transitioning to next step
            setLoading(false);
        }
    };

    const isInputValid = inputValue.trim() && (isValidEmail(inputValue.trim()) || isValidPhone(inputValue.trim()));
    const isSignInValid = mode === 'signin' ? isInputValid && password.trim().length > 0 : isInputValid;
    const isFormValid = mode === 'signin' ? isSignInValid : isInputValid;

    return (
        <>
            <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Button
                        variant={mode === 'signup' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onModeChange('signup')}
                        className="flex-1"
                    >
                        Sign Up
                    </Button>
                    <Button
                        variant={mode === 'signin' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onModeChange('signin')}
                        className="flex-1"
                    >
                        Sign In
                    </Button>
                </div>
                <CardTitle>{mode === 'signup' ? 'Sign Up to ZenZone' : 'Sign In to ZenZone'}</CardTitle>
                <CardDescription>
                    {mode === 'signup' 
                        ? 'Enter your email/phone below to create an account.' 
                        : 'Enter your email/phone and password to login.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="email">Email/Phone</Label>
                    <Input 
                        type="text" 
                        id="email" 
                        placeholder="Email or phone" 
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isFormValid && !loading) {
                                if (mode === 'signin' && document.activeElement?.id === 'email') {
                                    // If in signin mode and on email field, focus password
                                    document.getElementById('password')?.focus();
                                } else {
                                    handleContinue();
                                }
                            }
                        }}
                        className={error ? "border-destructive" : ""}
                        disabled={loading}
                    />
                    {mode === 'signin' && (
                        <div className="grid w-full items-center gap-1.5 mt-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                type="password" 
                                id="password" 
                                placeholder="Enter your password" 
                                value={password}
                                onChange={handlePasswordChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && isFormValid && !loading) {
                                        handleContinue();
                                    }
                                }}
                                className={error ? "border-destructive" : ""}
                                disabled={loading}
                            />
                        </div>
                    )}
                    {error && (
                        <p className="text-sm text-destructive mt-1">{error}</p>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={handleContinue} 
                    className="w-full"
                    disabled={!isFormValid || loading}
                >
                    {loading 
                        ? (mode === 'signin' ? "Signing in..." : "Sending...") 
                        : (mode === 'signin' ? "Sign In" : "Continue")}
                </Button>
            </CardFooter>
        </>
    );
};

const OtpStep = ({ onNext, onBack, verificationId, onRegistrationTokenSet }: { 
    onNext: () => void; 
    onBack: () => void;
    verificationId: string;
    onRegistrationTokenSet: (token: string) => void;
}) => {
    const [otpValue, setOtpValue] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow digits and limit to 6 characters
        const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
        setOtpValue(digitsOnly);
        // Clear error when user starts typing
        if (error) {
            setError("");
        }
    };

    const handleVerify = async () => {
        if (otpValue.length !== 6) {
            setError("Please enter a 6-digit verification code");
            return;
        }
        
        setLoading(true);
        setError("");

        try {
            const response = await authService.registerVerify({
                verificationId,
                otp: otpValue,
            });

            if (response.success && response.data && response.data.registrationToken) {
                // onRegistrationTokenSet will handle setting the registrationToken and moving to next step
                // No need to reset loading here as component will unmount on step transition
                onRegistrationTokenSet(response.data.registrationToken);
            } else {
                setError(response.message || "Invalid verification code");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Invalid verification code. Please try again.");
        } finally {
            // Only reset loading if we're still on this step (i.e., if there was an error)
            // If successful, the component will unmount when transitioning to next step
            setLoading(false);
        }
    };

    const handleResend = async () => {
        // TODO: Implement resend functionality
        setError("Resend functionality coming soon");
    };

    const isOtpValid = otpValue.length === 6;

    return (
        <>
            <CardHeader>
                <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={onBack} disabled={loading}>
                    <ArrowLeft />
                </Button>
                <CardTitle>Verify Your Email/Phone</CardTitle>
                <CardDescription>We sent a 6-digit code to your email/phone. Please enter it below.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input 
                        id="otp" 
                        placeholder="123456"
                        value={otpValue}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isOtpValid && !loading) {
                                handleVerify();
                            }
                        }}
                        maxLength={6}
                        className={error ? "border-destructive" : ""}
                        disabled={loading}
                    />
                    {error && (
                        <p className="text-sm text-destructive mt-1">{error}</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button 
                    onClick={handleVerify} 
                    className="w-full"
                    disabled={!isOtpValid || loading}
                >
                    {loading ? "Verifying..." : "Verify"}
                </Button>
                <Button variant="link" size="sm" onClick={handleResend} disabled={loading}>
                    Resend code
                </Button>
            </CardFooter>
        </>
    );
};

const ProfileStep = ({ onBack, registrationToken }: { onBack: () => void; registrationToken: string }) => {
    const router = useRouter();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [nameError, setNameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        if (nameError) {
            setNameError("");
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (passwordError) {
            setPasswordError("");
        }
    };

    const validateName = (): boolean => {
        const trimmed = name.trim();
        if (!trimmed) {
            setNameError("Full name is required");
            return false;
        }
        if (trimmed.length < 2) {
            setNameError("Full name must be at least 2 characters");
            return false;
        }
        setNameError("");
        return true;
    };

    const validatePassword = (): boolean => {
        const trimmed = password.trim();
        if (!trimmed) {
            setPasswordError("Password is required");
            return false;
        }
        if (trimmed.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            return false;
        }
        // Basic password strength check
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(trimmed)) {
            setPasswordError("Password must contain uppercase, lowercase, and a number");
            return false;
        }
        setPasswordError("");
        return true;
    };

    const handleFinish = async () => {
        if (!registrationToken) {
            setError("Registration token is missing. Please start over.");
            return;
        }

        const isNameValid = validateName();
        const isPasswordValid = validatePassword();

        if (!isNameValid || !isPasswordValid) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authService.registerComplete({
                registrationToken,
                password: password.trim(),
                name: name.trim(),
            });

            if (response.success && response.data) {
                // Registration complete, trigger session refresh and navigate to home
                window.dispatchEvent(new CustomEvent('auth:success'));
                router.push("/home");
            } else {
                setError(response.message || "Failed to complete registration");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to complete registration. Please try again.");
        } finally {
            // Only reset loading if navigation didn't happen (i.e., if there was an error)
            setLoading(false);
        }
    };

    const isFormValid = name.trim().length >= 2 && password.trim().length >= 8;

    return (
        <>
            <CardHeader>
                <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={onBack} disabled={loading}>
                    <ArrowLeft />
                </Button>
                <CardTitle>Complete Your Profile</CardTitle>
                <CardDescription>Just a few more details to get you started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                        id="name" 
                        placeholder="Alex Drake"
                        value={name}
                        onChange={handleNameChange}
                        onBlur={validateName}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isFormValid && !loading) {
                                handleFinish();
                            }
                        }}
                        className={nameError ? "border-destructive" : ""}
                        disabled={loading}
                    />
                    {nameError && (
                        <p className="text-sm text-destructive mt-1">{nameError}</p>
                    )}
                </div>
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                        id="password" 
                        type="password"
                        placeholder="SecurePass123!"
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={validatePassword}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isFormValid && !loading) {
                                handleFinish();
                            }
                        }}
                        className={passwordError ? "border-destructive" : ""}
                        disabled={loading}
                    />
                    {passwordError && (
                        <p className="text-sm text-destructive mt-1">{passwordError}</p>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-destructive mt-1">{error}</p>
                )}
            </CardContent>
            <CardFooter>
                <Button 
                    className="w-full"
                    onClick={handleFinish}
                    disabled={!isFormValid || loading}
                >
                    {loading ? "Completing..." : "Finish Setup"}
                </Button>
            </CardFooter>
        </>
    );
};


export default function AuthForm() {
    const [step, setStep] = useState<Step>(1);
    const [mode, setMode] = useState<AuthMode>('signup');
    const [verificationId, setVerificationId] = useState("");
    const [registrationToken, setRegistrationToken] = useState("");

    const handleNext = () => {
        if (step < 3) {
            setStep((s) => (s + 1) as Step);
        }
    };
    
    const handleBack = () => {
        if (step > 1) {
            setStep((s) => (s - 1) as Step);
        }
    };

    const handleModeChange = (newMode: AuthMode) => {
        setMode(newMode);
        // Reset step when switching modes
        setStep(1);
        setVerificationId("");
        setRegistrationToken("");
    };

    const handleIdentifierSet = (identifier: string, verificationId: string) => {
        if (verificationId) {
            setVerificationId(verificationId);
            handleNext();
        }
    };

    const handleRegistrationTokenSet = (token: string) => {
        if (token) {
            setRegistrationToken(token);
            handleNext();
        }
    };

    const progressValue = mode === 'signup' ? (step / 3) * 100 : 0;

    return (
        <Card className="relative w-full max-w-md border-none bg-card shadow-diffused rounded-3xl">
            <div className="flex justify-center pt-8">
                <Logo />
            </div>
            {step === 1 && (
                <EmailStep 
                    onNext={handleNext} 
                    onIdentifierSet={handleIdentifierSet}
                    mode={mode}
                    onModeChange={handleModeChange}
                />
            )}
            {step === 2 && mode === 'signup' && (
                <OtpStep 
                    onNext={handleNext} 
                    onBack={handleBack}
                    verificationId={verificationId}
                    onRegistrationTokenSet={handleRegistrationTokenSet}
                />
            )}
            {step === 3 && mode === 'signup' && (
                <ProfileStep onBack={handleBack} registrationToken={registrationToken} />
            )}
            {mode === 'signup' && (
                <Progress value={progressValue} className="absolute bottom-0 h-1 w-full rounded-b-lg" />
            )}
        </Card>
    );
}
