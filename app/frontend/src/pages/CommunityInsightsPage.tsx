import React, { useEffect, useState } from "react";
import { Flame, Info } from "lucide-react";
import { AQIDataResponse, CommunityChallenge, HistoricalDataResponse } from "../types";
import { HistoricalChart } from "../components/HistoricalChart";
import { api } from "../services/api";

interface CommunityInsightsPageProps {
  aqiData: AQIDataResponse | null;
  historicalData: HistoricalDataResponse | null;
}

export const CommunityInsightsPage: React.FC<CommunityInsightsPageProps> = ({ aqiData, historicalData }) => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [joinedChallenges, setJoinedChallenges] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getCommunityChallenges()
      .then(setChallenges)
      .catch(() => setError("Community action ideas are temporarily unavailable."));
  }, []);

  const handleJoinChallenge = (id: string) => {
    setJoinedChallenges((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <header className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
          Local Air & Collective Action
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">Community Insights</h1>
        <p className="mt-1 text-sm text-slate-600">
          Explore modelled city-level trends and practical actions. AirVeda does not claim neighborhood sensor coverage or count community participation.
        </p>
      </header>

      <section className="space-y-4" aria-labelledby="community-trends-heading">
        <div>
          <h2 id="community-trends-heading" className="text-xl font-extrabold text-slate-900">
            {aqiData?.city || "City"} air-quality trend
          </h2>
          <p className="text-sm text-slate-600">
            {aqiData
              ? `Current CPCB NAQI ${aqiData.cpcb_aqi} (${aqiData.cpcb_category}); values are calculated from Open-Meteo modelled concentrations.`
              : "Verified current conditions are unavailable."}
          </p>
        </div>
        {historicalData?.points.length ? (
          <HistoricalChart points={historicalData.points} city={historicalData.city} />
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600" role="status">
            No verified trend data is available for this location right now. Neighborhood-level readings are not provided.
          </p>
        )}
      </section>

      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Community clean-air actions</h2>
          <p className="mt-1 text-sm text-slate-600">
            These are self-guided ideas. Pledges are stored only in this page session; AirVeda does not aggregate participants or calculate collective impact.
          </p>
        </div>
        {error && <p className="text-sm text-rose-800" role="alert">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const joined = Boolean(joinedChallenges[challenge.id]);
            return (
              <article key={challenge.id} className="p-5 rounded-2xl border border-slate-200 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">{challenge.category}</span>
                    <span className="text-xs text-slate-500">{challenge.duration_days} days</span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900">{challenge.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{challenge.description}</p>
                  <p className="mt-3 text-xs text-slate-600"><strong>Why it helps:</strong> {challenge.impact_summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleJoinChallenge(challenge.id)}
                  aria-pressed={joined}
                  className="self-start px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  {joined ? "Pledged for myself" : "Make a personal pledge"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-300" aria-hidden="true" />
          <h2 className="text-xl font-bold">Report open waste burning safely</h2>
        </div>
        <p className="text-sm text-slate-300 max-w-3xl">
          Use your municipality's official reporting channel, include the location and time if safe to do so, and keep a safe distance. Do not approach, handle, or attempt to extinguish a fire.
        </p>
        <div className="rounded-xl bg-slate-800 p-4 text-sm text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
          <p>Citywide model trends cannot represent the air at a specific street or neighborhood. Consult local official monitors for location-specific decisions.</p>
        </div>
      </section>
    </div>
  );
};
