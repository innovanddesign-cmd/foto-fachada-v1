import { BrandDNA, StorefrontData } from "@/store/useStorefront";
import { QrCode } from "lucide-react";

interface Props {
    data: StorefrontData;
    dna: BrandDNA;
    showBleed?: boolean;
}

export function PosterRender({ data, dna, showBleed = false }: Props) {
    const primaryColor = dna.palette[0];
    const secondaryColor = dna.palette[1];
    const contrastColor = dna.palette[2] === "#ffffff" ? "black" : "white";

    return (
        <div
            className="w-full h-full relative overflow-hidden flex flex-col"
            style={{
                backgroundColor: dna.palette[2],
                fontFamily: dna.typography === 'Modern' ? 'Inter, sans-serif' : 'serif'
            }}
        >
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-[80%] h-[60%] rounded-bl-full opacity-20"
                style={{ backgroundColor: primaryColor }} />
            <div className="absolute bottom-0 left-0 w-[60%] h-[40%] rounded-tr-full opacity-20"
                style={{ backgroundColor: secondaryColor }} />

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col p-8 sm:p-12 justify-between">
                {/* Header */}
                <div className="space-y-4">
                    <span className="inline-block border text-xs font-bold px-2 py-1 tracking-[0.2em] uppercase"
                        style={{ borderColor: contrastColor, color: contrastColor }}
                    >
                        Nueva Colección
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black leading-[0.9] tracking-tighter"
                        style={{ color: contrastColor }}
                    >
                        {data.heroHeadline.toUpperCase()}
                    </h1>
                </div>

                {/* Middle Product / Offer */}
                <div className="self-center transform rotate-12 bg-white p-4 shadow-2xl skew-x-[-10deg] border-4"
                    style={{ borderColor: primaryColor }}
                >
                    <div className="text-4xl font-black" style={{ color: primaryColor }}>
                        {data.offers[0]?.price || "OFERTA"}
                    </div>
                </div>

                {/* Footer / CTA */}
                <div className="flex items-end justify-between">
                    <div style={{ color: contrastColor }}>
                        <p className="text-sm opacity-60 max-w-[200px] mb-2">{data.heroSubline}</p>
                        <p className="font-bold border-b-2 inline-block pb-1" style={{ borderColor: primaryColor }}>
                            VISÍTANOS HOY
                        </p>
                    </div>

                    <div className="bg-white p-2 rounded-lg shadow-lg">
                        <QrCode className="w-16 h-16 text-black" />
                    </div>
                </div>
            </div>

            {/* Print Bleed Markers (Visual only) */}
            {showBleed && (
                <div className="absolute inset-0 border-[20px] border-black/10 pointer-events-none" />
            )}
        </div>
    );
}
