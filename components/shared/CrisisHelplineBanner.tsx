"use client";

import React from "react";
import { Phone, AlertTriangle } from "lucide-react";
import { CRISIS_HELPLINES } from "@/lib/safety";

interface CrisisHelplineBannerProps {
  onDismiss?: () => void;
}

export default function CrisisHelplineBanner({ onDismiss }: CrisisHelplineBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-error/15 border border-error/30 text-error rounded-2xl p-5 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1">
          <h3 className="font-extrabold text-sm text-foreground">You matter — please reach out now</h3>
          <p className="text-xs mt-1 text-text-muted leading-relaxed">
            If you are in crisis or having thoughts of self-harm, trained counselors are
            available 24/7. You are not alone.
          </p>
          <ul className="mt-3 space-y-2" aria-label="Crisis helpline numbers">
            {CRISIS_HELPLINES.map((line) => (
              <li key={line.name} className="flex items-center gap-2 text-xs text-foreground">
                <Phone className="w-3.5 h-3.5 text-error" aria-hidden="true" />
                <span className="font-semibold">{line.name}:</span>
                <a
                  href={`tel:${line.number.replace(/[^+\d]/g, "")}`}
                  className="underline font-bold hover:text-error/80 focus:outline-none focus:ring-2 focus:ring-error rounded"
                >
                  {line.number}
                </a>
                <span className="text-text-muted opacity-75">({line.hours})</span>
              </li>
            ))}
          </ul>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="mt-3 text-[11px] underline text-text-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded px-1 cursor-pointer"
            >
              I have saved these numbers — dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
