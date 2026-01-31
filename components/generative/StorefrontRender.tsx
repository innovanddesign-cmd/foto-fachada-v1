import { BrandDNA, StorefrontData } from "@/store/useStorefront";
import { ArrowRight, ShoppingBag, Menu, Search } from "lucide-react";

interface Props {
    data: StorefrontData;
    dna: BrandDNA;
}

export function StorefrontRender({ data, dna }: Props) {
    // Style Mappers
    const fontMap: Record<string, string> = {
        Modern: "font-sans",
        Classic: "font-serif",
        Playful: "font-mono", // just for distinction
        Minimal: "font-sans tracking-widest",
    };

    const fontFamily = fontMap[dna.typography] || "font-sans";
    const primaryColor = dna.palette[0];
    const secondaryColor = dna.palette[1];
    const bgColor = dna.palette[2] === "#ffffff" ? "bg-white" : "bg-neutral-900 text-white";
    const textColor = dna.palette[2] === "#ffffff" ? "text-black" : "text-white";

    return (
        <div className={`w-full h-full overflow-y-auto ${bgColor} ${textColor} ${fontFamily}`}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 sticky top-0 z-10 backdrop-blur-md bg-opacity-80 border-b border-black/5">
                <Menu className="w-6 h-6" />
                <span className="font-bold text-lg">STORE</span>
                <div className="flex gap-2">
                    <Search className="w-6 h-6" />
                    <ShoppingBag className="w-6 h-6" />
                </div>
            </div>

            {/* Hero Section */}
            <div
                className="relative p-6 pt-10 pb-16 flex flex-col items-center text-center space-y-4"
                style={{ backgroundColor: primaryColor + "20" }} // 20 hex = 12% opacity
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${primaryColor}, transparent)` }}
                />

                <span
                    className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm"
                    style={{ color: primaryColor }}
                >
                    {dna.vibe}
                </span>

                <h1 className="text-4xl font-black leading-tight">
                    {data.heroHeadline}
                </h1>

                <p className="opacity-80 max-w-[80%]">
                    {data.heroSubline}
                </p>

                <button
                    className="mt-4 px-8 py-3 rounded-full font-bold text-white shadow-lg transform active:scale-95 transition-all"
                    style={{ backgroundColor: primaryColor }}
                >
                    Explorar
                </button>
            </div>

            {/* Offers / Categories */}
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">Destacados</h3>
                    <span className="text-xs opacity-50">Ver todo</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {data.offers.map((offer, idx) => (
                        <div key={idx} className="bg-black/5 rounded-2xl p-4 flex flex-col gap-2">
                            <div className="aspect-square rounded-xl bg-gray-200 w-full animate-pulse" style={{ backgroundColor: secondaryColor + '40' }} />
                            <span className="font-bold text-sm line-clamp-2">{offer.title}</span>
                            <span className="text-xs font-bold" style={{ color: primaryColor }}>{offer.price}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Gallery / Mood Section */}
            <div className="p-4">
                <div
                    className="w-full aspect-video rounded-2xl flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: secondaryColor }}
                >
                    Galería
                </div>
            </div>
        </div>
    );
}
