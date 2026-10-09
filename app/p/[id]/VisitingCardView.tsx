"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Download, 
  Share2, 
  RotateCcw, 
  Check, 
  Copy,
  ExternalLink
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export interface PublicProfileUser {
  id: string;
  employeeId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  isVerified?: boolean;
  role: string;
  employmentType?: string | null;
  designation?: { name: string } | null;
  department?: { name: string } | null;
  organization?: {
    name: string;
    logo?: { url: string } | null;
    accent?: string | null;
  } | null;
  officeLocation?: { name: string } | null;
}

interface VisitingCardViewProps {
  user: PublicProfileUser;
}

const ACCENT_COLORS: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  teal: { bg: "bg-teal-500", text: "text-teal-400", glow: "rgba(20, 184, 166, 0.25)", border: "border-teal-500/40" },
  blue: { bg: "bg-blue-500", text: "text-blue-400", glow: "rgba(59, 130, 246, 0.25)", border: "border-blue-500/40" },
  indigo: { bg: "bg-indigo-500", text: "text-indigo-400", glow: "rgba(99, 102, 241, 0.25)", border: "border-indigo-500/40" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-400", glow: "rgba(16, 185, 129, 0.25)", border: "border-emerald-500/40" },
  violet: { bg: "bg-violet-500", text: "text-violet-400", glow: "rgba(139, 92, 246, 0.25)", border: "border-violet-500/40" },
  rose: { bg: "bg-rose-500", text: "text-rose-400", glow: "rgba(244, 63, 94, 0.25)", border: "border-rose-500/40" },
  amber: { bg: "bg-amber-500", text: "text-amber-400", glow: "rgba(245, 158, 11, 0.25)", border: "border-amber-500/40" },
};

export default function VisitingCardView({ user }: VisitingCardViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const accentKey = (user.organization?.accent || "teal").toLowerCase();
  const theme = ACCENT_COLORS[accentKey] || ACCENT_COLORS.teal;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `http://localhost:3000/p/${user.id}`;
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const displayId = user.employeeId || user.id;

  const handleDownloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
N:${user.lastName || ""};${user.firstName || ""};;;
FN:${fullName}
ORG:${user.organization?.name || ""}
TITLE:${user.designation?.name || ""}
ROLE:${user.department?.name || ""}
TEL;TYPE=CELL,VOICE:${user.phoneNumber || ""}
EMAIL;TYPE=WORK,INTERNET:${user.email || ""}
ADR;TYPE=WORK:;;${user.officeLocation?.name || ""};;;;
URL:${currentUrl}
NOTE:Employee ID: ${displayId} | Verified Profile
END:VCARD`;

    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${user.firstName}_${user.lastName}_VisitingCard.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${fullName} - Visiting Card`,
          text: `Digital visiting card for ${fullName} (${user.designation?.name || "Employee"} at ${user.organization?.name || "Company"})`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative selection:bg-teal-500/30 overflow-x-hidden">
      {/* Ambient background glows */}
      <div 
        className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-40 transition-all duration-700"
        style={{ background: theme.glow }}
      />
      <div className="fixed bottom-10 right-10 w-[350px] h-[350px] rounded-full blur-[130px] pointer-events-none opacity-20 bg-blue-600/30" />

      {/* Header bar / Title indicator */}
      <div className="w-full max-w-xl flex items-center justify-between mb-5 z-10 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
            Official Digital Visiting Card
          </span>
        </div>
        
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 backdrop-blur hover:border-zinc-700 transition-all shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 transition-transform duration-500 hover:rotate-180" />
          <span>{isFlipped ? "Show Front" : "Flip to Back"}</span>
        </button>
      </div>

      {/* 3D Visiting Card Container */}
      <div 
        className="w-full max-w-[620px] z-10" 
        style={{ perspective: "1200px" }}
      >
        <div 
          className="relative transition-transform duration-700 ease-out preserve-3d cursor-pointer"
          style={{ 
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* ======================================================== */}
          {/* FRONT OF VISITING CARD                                    */}
          {/* ======================================================== */}
          <div 
            className="w-full rounded-2xl md:rounded-3xl p-6 sm:p-7 md:p-8 bg-gradient-to-br from-[#12161f] via-[#0d1017] to-[#0a0d13] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/5 relative overflow-hidden flex flex-col justify-between min-h-[350px] sm:min-h-[360px]"
            style={{ 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Subtle Metallic/Foil Accent Top Line */}
            <div 
              className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-80"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${theme.text.includes('teal') ? '#14b8a6' : '#3b82f6'} 50%, transparent 100%)`
              }}
            />

            {/* Subtle Holographic Watermark Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

            {/* TOP ROW: Company Logo + Smart Chip & Contactless Symbol */}
            <div className="flex items-center justify-between relative z-10 mb-5">
              {/* Company Branding */}
              <div className="flex items-center gap-3">
                {user.organization?.logo?.url ? (
                  <div className="bg-white/95 rounded-xl p-1.5 shadow-md border border-white/20 flex items-center justify-center">
                    <Image
                      src={user.organization.logo.url}
                      alt={user.organization.name}
                      width={80}
                      height={24}
                      className="object-contain h-6 w-auto"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600 flex items-center justify-center shadow-inner">
                    <Building2 className="w-5 h-5 text-white/90" />
                  </div>
                )}
                <div>
                  <h2 className="text-xs md:text-sm font-bold tracking-widest uppercase text-zinc-200">
                    {user.organization?.name || "Company"}
                  </h2>
                  <p className="text-[10px] tracking-wider uppercase text-zinc-500 font-medium">
                    Corporate Identity
                  </p>
                </div>
              </div>

              {/* EMV Smart Chip & Contactless Waves */}
              <div className="flex items-center gap-2.5">
                {/* Contactless waves symbol */}
                <svg className="w-5 h-5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8.5 16.5a5 5 0 0 1 0-7" strokeLinecap="round" />
                  <path d="M12 19a8.5 8.5 0 0 1 0-12" strokeLinecap="round" />
                  <path d="M15.5 21.5a12 12 0 0 1 0-17" strokeLinecap="round" />
                </svg>

                {/* Golden Smart Card Chip */}
                <div 
                  className="w-10 h-7 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-400 to-amber-500 p-0.5 shadow border border-amber-600/40 relative flex items-center justify-center shrink-0"
                  title="Contactless Smart Chip"
                >
                  <div className="w-full h-full border border-amber-700/30 rounded-[3px] relative flex items-center justify-center">
                    <div className="absolute inset-x-0 h-px bg-amber-800/40 top-1/2 -translate-y-1/2" />
                    <div className="absolute inset-y-0 w-px bg-amber-800/40 left-1/2 -translate-x-1/2" />
                    <div className="w-3.5 h-2.5 rounded-full border border-amber-800/40" />
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE ROW: Executive Profile & Information */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10 mb-6">
              {/* Profile Photo */}
              <div className="relative shrink-0">
                <div className="relative h-22 w-22 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-2 border-white/15 bg-zinc-800 shadow-lg ring-2 ring-black/40">
                  {user.profilePictureUrl ? (
                    <Image
                      src={user.profilePictureUrl}
                      alt={fullName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-zinc-700 to-zinc-900">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Verified Shield Icon Badge */}
                {user.isVerified && (
                  <div 
                    className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-[#0d1017]"
                    title="Verified Identity"
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Name & Titles */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {fullName}
                  </h1>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-teal-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-teal-400/80 shrink-0" />
                  <span>{user.designation?.name || "Team Member"}</span>
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {user.department?.name && (
                    <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-zinc-300">
                      {user.department.name}
                    </span>
                  )}

                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-zinc-300 capitalize">
                    {user.employmentType?.replace("_", " ") || "Full Time"}
                  </span>

                  {displayId && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-700/80 font-mono text-[11px] font-bold text-zinc-400">
                      ID: #{displayId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: Clean Visiting Card Contact Grid */}
            <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300">
              <a 
                href={`tel:${user.phoneNumber}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">{user.phoneNumber || "No phone listed"}</span>
              </a>

              <a 
                href={`mailto:${user.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-all group"
              >
                <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">{user.email}</span>
              </a>

              {user.officeLocation?.name && (
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="p-1.5 rounded-lg bg-zinc-700/40 text-zinc-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate font-medium">{user.officeLocation.name}</span>
                </div>
              )}

              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="p-1.5 rounded-lg bg-zinc-700/40 text-zinc-400">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span className="truncate font-medium">{user.organization?.name || "Company"}</span>
              </div>
            </div>

            {/* Bottom micro-footer indicator */}
            <div className="relative z-10 flex items-center justify-between pt-3 mt-1 text-[9px] uppercase tracking-widest text-zinc-500 font-semibold border-t border-white/[0.04]">
              <span>Tap card to view back / QR code</span>
              <span>TeamZen Verified Pass</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* BACK OF VISITING CARD                                     */}
          {/* ======================================================== */}
          <div 
            className="w-full rounded-2xl md:rounded-3xl p-6 sm:p-7 md:p-8 bg-gradient-to-br from-[#12161f] via-[#0d1017] to-[#0a0d13] border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/5 absolute inset-0 overflow-hidden flex flex-col justify-between items-center text-center"
            style={{ 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Top Foil Line */}
            <div 
              className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-80"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${theme.text.includes('teal') ? '#14b8a6' : '#3b82f6'} 50%, transparent 100%)`
              }}
            />

            {/* Subtle Watermark Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-60" />

            {/* Header: Company Name & Logo */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 pt-1">
              {user.organization?.logo?.url && (
                <div className="bg-white/95 rounded-xl p-1.5 shadow-md border border-white/20 mb-1 inline-block">
                  <Image
                    src={user.organization.logo.url}
                    alt={user.organization.name}
                    width={80}
                    height={22}
                    className="object-contain h-5 w-auto"
                    unoptimized
                  />
                </div>
              )}
              <h3 className="text-sm font-bold tracking-widest uppercase text-white">
                {user.organization?.name || "Corporate Directory"}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Official Digital Identity & Contact Gateway
              </p>
            </div>

            {/* Center: High-Definition Scannable QR Code */}
            <div className="relative z-10 flex flex-col items-center my-3">
              <div className="p-3.5 bg-white rounded-2xl shadow-xl border-4 border-white/90">
                <QRCodeSVG 
                  value={currentUrl} 
                  size={150} 
                  level="H" 
                  includeMargin={false}
                />
              </div>
              <p className="text-[11px] font-semibold text-teal-400 mt-2.5 flex items-center gap-1">
                <span>Scan camera to open or save contact</span>
              </p>
            </div>

            {/* Bottom details */}
            <div className="relative z-10 w-full pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-medium">
              <span className="font-mono">ID: #{displayId}</span>
              <span>{user.officeLocation?.name || "Corporate Headquarters"}</span>
              <span className="text-teal-400">Tap to flip</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar Dock below the Visiting Card */}
      <div className="w-full max-w-[620px] mt-6 z-10 flex flex-col sm:flex-row items-center gap-3">
        {/* Primary Action: Save to Contacts (.vcf download) */}
        <button
          onClick={handleDownloadVCard}
          className="w-full sm:flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-black font-bold text-sm shadow-[0_10px_25px_-5px_rgba(20,184,166,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Save to Contacts</span>
        </button>

        {/* Call Button */}
        {user.phoneNumber && (
          <a
            href={`tel:${user.phoneNumber}`}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-sm transition-all shadow-sm hover:border-zinc-700 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-teal-400" />
            <span>Call</span>
          </a>
        )}

        {/* Email Button */}
        <a
          href={`mailto:${user.email}`}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-sm transition-all shadow-sm hover:border-zinc-700 cursor-pointer"
        >
          <Mail className="w-4 h-4 text-teal-400" />
          <span>Email</span>
        </a>

        {/* Share / Copy Link Button */}
        <button
          onClick={handleShare}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-sm transition-all shadow-sm hover:border-zinc-700 cursor-pointer"
          title="Share profile link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-zinc-400" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center text-xs text-zinc-500 z-10 flex items-center justify-center gap-2">
        <span>Powered by TeamZen Corporate Identity</span>
      </div>
    </div>
  );
}
