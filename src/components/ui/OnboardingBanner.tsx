'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

export interface OnboardingStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface OnboardingBannerProps {
  /** Unique key used to remember dismissal in localStorage. */
  storageKey: string;
  /** Headline shown at the top of the banner. */
  heading: string;
  /** Short intro line under the heading. */
  intro?: string;
  /** Ordered list of "how it works" steps. */
  steps: OnboardingStep[];
  /** Optional className for container. */
  className?: string;
}

/**
 * Dismissible "How it works" onboarding banner for first-time users.
 * Remembers dismissal in localStorage so returning users don't keep seeing it.
 */
export function OnboardingBanner({
  storageKey,
  heading,
  intro,
  steps,
  className = '',
}: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const value = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
      setDismissed(value === 'dismissed');
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  if (dismissed === null || dismissed === true) {
    // Render nothing until hydrated, and nothing when dismissed.
    return null;
  }

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(storageKey, 'dismissed');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  return (
    <div
      data-testid="onboarding-banner"
      className={`relative overflow-hidden rounded-2xl border border-generator-green/30 bg-gradient-to-br from-generator-green/10 via-white to-generator-gold/10 p-6 mb-8 shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full text-gray-500 hover:text-gray-700 hover:bg-white/60 transition-colors"
        aria-label="Dismiss onboarding"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>

      <div className="flex items-start mb-4">
        <div className="p-2 rounded-xl bg-generator-green text-white mr-3 flex-shrink-0">
          <SparklesIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-generator-dark">{heading}</h2>
          {intro && <p className="text-sm text-gray-700 mt-1">{intro}</p>}
        </div>
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
        {steps.map((step, index) => (
          <li
            key={`${step.title}-${index}`}
            className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-xl p-4 flex items-start"
          >
            <div className="w-8 h-8 rounded-full bg-generator-dark text-white flex items-center justify-center font-semibold text-sm flex-shrink-0 mr-3">
              {index + 1}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-generator-dark">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default OnboardingBanner;
