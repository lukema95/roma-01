"use client";

import { useLanguage } from "@/store/useLanguage";
import { getTranslation } from "@/lib/i18n";

export default function AboutPage() {
  const language = useLanguage((s) => s.language);
  const t = getTranslation(language).about;
  
  return (
    <div className="w-full h-full" style={{ background: "#ffffff" }}>
      {/* Main Content Container */}
      <div className="max-w-3xl mx-auto px-8 py-16 pb-24">
        
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-16">
          <div 
            className="text-4xl font-serif text-center"
            style={{ 
              fontFamily: "Georgia, serif",
              color: "#000000",
              letterSpacing: "0.02em"
            }}
          >
            <span className="text-5xl">R</span>
            <span>OMA-01</span>
          </div>
        </div>

        {/* Main Content - Paragraphs */}
        <div className="space-y-6 text-base leading-relaxed" style={{ 
          fontFamily: "Georgia, serif",
          color: "#000000"
        }}>
          
          <p>{t.intro}</p>
          <p>{t.multiModel}</p>
          <p>{t.nof1Interface}</p>
          <p>{t.romaFramework}</p>
          <p>{t.romaProcess}</p>
          <p>{t.tradingContext}</p>
          <p>{t.platformFeatures}</p>

        </div>

        {/* Quote Section */}
        <div className="mt-16 mb-12 text-center">
          <p className="text-lg italic" style={{ 
            fontFamily: "Georgia, serif",
            color: "#000000"
          }}>
            "{t.quote}"
          </p>
        </div>

        {/* ROMA vs Traditional Comparison */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-sm uppercase tracking-wider mb-4" style={{ 
            fontFamily: "Georgia, serif",
            color: "#000000",
            fontWeight: "600"
          }}>
            {t.romaVsTraditional}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm" style={{ 
            fontFamily: "Georgia, serif",
            color: "#374151"
          }}>
            <div>
              <div className="font-semibold mb-2" style={{ color: "#000000" }}>{t.traditionalAgent}</div>
              <ul className="space-y-1 text-sm">
                <li>• {t.traditional.monolithic}</li>
                <li>• {t.traditional.directPrompt}</li>
                <li>• {t.traditional.limitedByPrompt}</li>
                <li>• {t.traditional.sequential}</li>
                <li>• {t.traditional.blackBox}</li>
                <li>• {t.traditional.fixedComplexity}</li>
                <li>• {t.traditional.singlePoint}</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-2" style={{ color: "#000000" }}>{t.romaFrameworkTitle}</div>
              <ul className="space-y-1 text-sm">
                <li>• {t.roma.hierarchical}</li>
                <li>• {t.roma.planExecute}</li>
                <li>• {t.roma.breaksDown}</li>
                <li>• {t.roma.parallelizes}</li>
                <li>• {t.roma.clearReasoning}</li>
                <li>• {t.roma.arbitraryComplexity}</li>
                <li>• {t.roma.rePlan}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#e5e7eb" }}>
          <h3 className="text-sm uppercase tracking-wider mb-4" style={{ 
            fontFamily: "Georgia, serif",
            color: "#000000",
            fontWeight: "600"
          }}>
            {t.platformFeaturesTitle}
          </h3>
          <ul className="space-y-2 text-sm" style={{ 
            fontFamily: "Georgia, serif",
            color: "#374151",
            listStyleType: "disc",
            paddingLeft: "1.5rem"
          }}>
            <li>{t.features.aiTrading}</li>
            <li>{t.features.multiAgent}</li>
            <li>{t.features.riskManagement}</li>
            <li>{t.features.web3Integration}</li>
            <li>{t.features.leaderboard}</li>
            <li>{t.features.performance}</li>
            <li>{t.features.technicalAnalysis}</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center text-sm" style={{ 
          borderColor: "#e5e7eb",
          fontFamily: "Georgia, serif",
          color: "#9ca3af"
        }}>
          <p>{t.footer}</p>
        </div>

      </div>
    </div>
  );
}

