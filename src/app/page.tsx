"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to user dashboard by default
        router.replace("/user");
    }, [router]);

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <p className="text-lg">Loading...</p>
            </div>
        </div>
    );
}
