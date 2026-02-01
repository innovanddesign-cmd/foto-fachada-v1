"use client";

import { SmartphoneMockup } from "@/components/ui/SmartphoneMockup";
import { useState } from "react";

export default function TestMockupPage() {
    const [isGenerating, setIsGenerating] = useState(false);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-10">
            <div className="mb-4 flex gap-4">
                <button
                    onClick={() => setIsGenerating(!isGenerating)}
                    className="px-4 py-2 bg-emerald-500 rounded text-black font-bold"
                >
                    Toggle Regenerate ({isGenerating ? 'ON' : 'OFF'})
                </button>
            </div>

            <SmartphoneMockup isGenerating={isGenerating}>
                <div className="p-8 space-y-8 bg-white dark:bg-black min-h-[120vh]">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                        Brand Storefront
                    </h1>
                    <section className="h-64 bg-slate-100 rounded-2xl p-4 shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Hero Section</h2>
                        <p className="text-slate-500">Scroll down to test rubber banding...</p>
                    </section>

                    <section className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-40 bg-slate-50 border border-slate-200 rounded-xl p-4">
                                Item {i}
                            </div>
                        ))}
                    </section>

                    <footer className="p-8 bg-slate-900 text-white rounded-xl text-center">
                        Final Footer
                        <p className="text-xs mt-2 text-slate-400">Keep scrolling for haptic squash!</p>
                    </footer>
                </div>
            </SmartphoneMockup>
        </div>
    );
}
