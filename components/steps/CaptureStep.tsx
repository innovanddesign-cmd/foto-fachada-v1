import { GlassCard } from "@/components/ui/GlassCard";
import { useStorefrontStore } from "@/store/useStorefront";
import { Upload, ImageIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { AIService } from "@/services/ai";

export function CaptureStep() {
    const { startAnalysis, setUploadedImage, completeAnalysis } = useStorefrontStore();
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = useCallback(async (file: File) => {
        if (!file.type.startsWith("image/")) return;

        // Create preview URL
        const url = URL.createObjectURL(file);
        setUploadedImage(url);

        // Start Analysis Transition
        startAnalysis();

        // Simulate AI Call (In real app, we'd wait for API)
        try {
            const dna = await AIService.analyzeImage(url);
            const storefront = await AIService.generateStorefront(dna);
            completeAnalysis(dna, storefront);
        } catch (e) {
            console.error("AI Error", e);
        }

    }, [setUploadedImage, startAnalysis, completeAnalysis]);

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <GlassCard
            className={`relative w-full max-w-2xl aspect-[4/3] flex flex-col items-center justify-center border-dashed 
      ${isDragging ? "border-pink-500 bg-white/10" : "border-white/20"}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />

            <div className="text-center p-8 space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-glass-sm animate-bounce">
                    <Upload className="w-10 h-10 text-white/80" />
                </div>

                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                    Sube tu Fachada
                </h2>

                <p className="text-lg text-white/50 max-w-md mx-auto">
                    Arrastra tu foto aquí o haz clic para explorar.
                    <br />
                    <span className="text-sm text-white/30">Admitimos JPG, PNG, WEBP (Max 10MB)</span>
                </p>

                <label className="inline-flex cursor-pointer relative group">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    <span className="px-8 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                        Elegir Archivo
                    </span>
                </label>
            </div>
        </GlassCard>
    );
}
