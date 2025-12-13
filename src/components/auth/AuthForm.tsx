"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/Logo";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Step = 1 | 2 | 3;

const EmailStep = ({ onNext }: { onNext: () => void }) => (
    <>
        <CardHeader>
            <CardTitle>Sign In to ZenZone</CardTitle>
            <CardDescription>Enter your email below to login or create an account.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" placeholder="you@example.com" />
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={onNext} className="w-full">Continue</Button>
        </CardFooter>
    </>
);

const OtpStep = ({ onNext, onBack }: { onNext: () => void, onBack: () => void }) => (
    <>
        <CardHeader>
            <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>We sent a 6-digit code to your email. Please enter it below.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="otp">Verification Code</Label>
                <Input id="otp" placeholder="123456" />
            </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
            <Button onClick={onNext} className="w-full">Verify</Button>
            <Button variant="link" size="sm">Resend code</Button>
        </CardFooter>
    </>
);

const ProfileStep = ({ onBack }: { onBack: () => void }) => (
    <>
        <CardHeader>
            <Button variant="ghost" size="icon" className="absolute left-4 top-4" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Just a few more details to get you started.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Alex Drake" />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="alexdrake" />
            </div>
        </CardContent>
        <CardFooter>
            <Link href="/home" className="w-full">
                <Button className="w-full">Finish Setup</Button>
            </Link>
        </CardFooter>
    </>
);


export default function AuthForm() {
    const [step, setStep] = useState<Step>(1);

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

    const progressValue = (step / 3) * 100;

    return (
        <Card className="relative w-full max-w-md border-none bg-card shadow-diffused rounded-3xl">
            <div className="flex justify-center pt-8">
                <Logo />
            </div>
            {step === 1 && <EmailStep onNext={handleNext} />}
            {step === 2 && <OtpStep onNext={handleNext} onBack={handleBack}/>}
            {step === 3 && <ProfileStep onBack={handleBack} />}
            <Progress value={progressValue} className="absolute bottom-0 h-1 w-full rounded-b-lg" />
        </Card>
    );
}
