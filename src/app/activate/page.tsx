"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/stores/onboarding";
import ActivateContent from "@/components/activate/ActivationContent";


export default function ActivatePage() {
    const r = useRouter();
    const { activated } = useOnboarding();


    useEffect(() => {
        if (activated) r.replace("/complete-profile");
    }, [activated, r]);


    return <ActivateContent />;
}