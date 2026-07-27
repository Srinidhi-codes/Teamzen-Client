"use client";

import { cn } from "@/lib/utils";

export const VoiceWave = ({ isProcessing }: { isProcessing?: boolean }) => {
    return (
        <div className="flex items-center justify-center gap-1 h-8 px-3 bg-primary/10 rounded-md border border-primary/20 animate-in fade-in duration-300">
            <div className="flex items-center gap-1 h-4">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-1 bg-primary rounded-full transition-all duration-300",
                            isProcessing ? "animate-pulse" : "animate-voice-wave"
                        )}
                        style={{
                            height: '100%',
                            animationDelay: `${i * 0.15}s`,
                            animationDuration: isProcessing ? '0.8s' : '1.2s'
                        }}
                    />
                ))}
            </div>
            <span className="text-[10px] font-medium text-primary ml-2 whitespace-nowrap">
                {isProcessing ? "Processing" : "Listening"}
            </span>

            <style jsx>{`
                @keyframes voice-wave {
                    0%, 100% { height: 30%; }
                    50% { height: 100%; }
                }
                .animate-voice-wave {
                    animation: voice-wave infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};
