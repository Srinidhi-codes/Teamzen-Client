"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import {
  Bot,
  Check,
  ChevronRight,
  CircleUserRound,
  Code2,
  MapPin,
  MessageCircle,
  Workflow,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChannelImages } from "@/lib/brand-images";
import { useWorkflowDemo } from "@/components/landing/useWorkflowDemo";

const CHANNELS = [
  {
    id: "slack",
    name: "Slack",
    short: "DM + slash commands",
    logo: ChannelImages.slack,
    accent: "#E01E5A",
    comingSoon: false,
    command: "/balance",
    reply: "Annual leave: 12 days available",
    detail: "Linked securely · Only you can see this",
  },
  {
    id: "telegram",
    name: "Telegram",
    short: "Menus + location punch",
    logo: ChannelImages.telegram,
    accent: "#2AABEE",
    comingSoon: false,
    command: "Check in",
    reply: "Checked in at 09:12 AM",
    detail: "Bengaluru HQ · Location verified",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    short: "Coming soon",
    logo: ChannelImages.whatsapp,
    accent: "#25D366",
    comingSoon: true,
    command: "Show my payslip",
    reply: "WhatsApp HR bot is almost ready.",
    detail: "Coming soon · Same OTP-linked assistant",
  },
  {
    id: "mcp",
    name: "MCP clients",
    short: "Cursor · Claude · tools",
    logo: ChannelImages.mcp,
    accent: "#F59E0B",
    comingSoon: false,
    command: "check_team_availability",
    reply: "Coverage is available for 18–20 Aug",
    detail: "teamzen-hr · leaves:read",
  },
] as const;

export function EverywhereShowcase() {
  const { containerRef, step, setStep, replay } = useWorkflowDemo({
    stepCount: CHANNELS.length,
    interval: 3600,
  });
  const channel = CHANNELS[step];
  const isMcp = channel.id === "mcp";
  const isTelegram = channel.id === "telegram";

  return (
    <div ref={containerRef} className="everywhere-shell">
      <div className="everywhere-grid" aria-hidden />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-cyan-200">
          <Workflow className="h-4 w-4" />
          Omnichannel by design
        </p>
        <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          You’re covered everywhere.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base">
          Do the same HR work from the tools already open. Teamzen’s bot gateway
          brings the assistant to Slack and Telegram today, with WhatsApp coming
          soon, while MCP lets compatible AI clients use the same audited HR tools.
        </p>
      </div>

      <div className="everywhere-stage">
        <div className="everywhere-network" aria-hidden>
          <span className="everywhere-ring everywhere-ring--one" />
          <span className="everywhere-ring everywhere-ring--two" />
          <span className="everywhere-line everywhere-line--a" />
          <span className="everywhere-line everywhere-line--b" />
          <span className="everywhere-line everywhere-line--c" />
          <span className="everywhere-line everywhere-line--d" />
        </div>

        <div className="everywhere-hub" aria-hidden>
          <span className="everywhere-hub-pulse" />
          <Bot className="h-6 w-6 text-cyan-100" />
          <span>Teamzen AI</span>
          <small>One agent · every channel</small>
        </div>

        <div className="everywhere-channel-list" role="tablist" aria-label="Teamzen channels">
          {CHANNELS.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={index === step}
              onClick={() => setStep(index)}
              className={cn(
                "everywhere-channel",
                index === step && "everywhere-channel--active",
                item.comingSoon && "everywhere-channel--soon"
              )}
              style={{ "--channel-accent": item.accent } as CSSProperties}
            >
              <span className="everywhere-channel-icon">
                <Image
                  src={item.logo}
                  alt=""
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="min-w-0">
                <strong className="flex items-center gap-1.5">
                  {item.name}
                  {item.comingSoon ? (
                    <em className="everywhere-soon-pill not-italic">Soon</em>
                  ) : null}
                </strong>
                <small>{item.short}</small>
              </span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-40" />
            </button>
          ))}
        </div>

        <div key={channel.id} className="channel-demo">
          <div className="channel-demo-header">
            <div
              className="channel-demo-logo"
              style={{ "--channel-accent": channel.accent } as CSSProperties}
            >
              <Image
                src={channel.logo}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="flex items-center gap-2">
                {channel.name}
                {channel.comingSoon ? (
                  <em className="everywhere-soon-pill not-italic">Coming soon</em>
                ) : null}
              </p>
              <span>
                {channel.comingSoon
                  ? "Teamzen Assistant · Preview"
                  : "Teamzen Assistant · Connected"}
              </span>
            </div>
            <span
              className={cn(
                "ml-auto h-2 w-2 rounded-full",
                channel.comingSoon ? "bg-amber-400" : "bg-emerald-400"
              )}
            />
          </div>

          <div className="channel-demo-body">
            {channel.comingSoon ? (
              <div className="flex h-full min-h-[9rem] flex-col items-center justify-center text-center">
                <div
                  className="channel-soon-logo mb-3"
                  style={{ "--channel-accent": channel.accent } as CSSProperties}
                >
                  <Image
                    src={channel.logo}
                    alt=""
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-white">WhatsApp is coming soon</p>
                <p className="mt-2 max-w-[14rem] text-[11px] leading-relaxed text-white/50">
                  Same OTP-linked assistant for leave, attendance, and payslips —
                  launching next on WhatsApp.
                </p>
              </div>
            ) : (
              <>
                <div className="channel-user-row">
                  <span className="channel-avatar">
                    <CircleUserRound className="h-4 w-4" />
                  </span>
                  <div>
                    <small>You · now</small>
                    <p>{channel.command}</p>
                  </div>
                </div>

                <div className="channel-agent-row">
                  <span className="channel-avatar channel-avatar--bot">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <small>Teamzen · now</small>
                    <p>{channel.reply}</p>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-white/45">
                      {isTelegram ? (
                        <MapPin className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3" />
                      )}
                      {channel.detail}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="channel-demo-footer">
            {channel.comingSoon ? (
              <>
                <MessageCircle className="h-3.5 w-3.5 text-emerald-300" />
                <span>Join the waitlist after signup</span>
              </>
            ) : isMcp ? (
              <>
                <Code2 className="h-3.5 w-3.5 text-amber-300" />
                <code>Tool returned in 312ms</code>
              </>
            ) : (
              <>
                <MessageCircle className="h-3.5 w-3.5 text-cyan-200" />
                <span>Reply or choose a quick action…</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] text-white/45">
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-400" />
          OTP-linked accounts
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-400" />
          Role-aware permissions
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Check className="h-3 w-3 text-emerald-400" />
          Audited MCP tools
        </span>
        <button
          type="button"
          onClick={replay}
          className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold text-cyan-200 hover:bg-white/5 hover:text-white"
        >
          Replay channels
        </button>
      </div>
    </div>
  );
}
