import { useMemo, useState } from "react";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import EmergencyButton from "./components/EmergencyButton";
import Topbar from "./components/Topbar";
import RightPanel from "./components/RightPanel";
import { useEmergencyFlow } from "./hooks/useEmergencyFlow";
import { useHospitalFeed } from "./hooks/useHospitalFeed";
import { getHospitalOperationalState } from "./utils/hospitalStatus";

export default function App() {
  const { hospitals, connectionState, lastUpdated, latestUpdateHealth } = useHospitalFeed();
  const [surgeMode, setSurgeMode] = useState(false);
  const {
    activeHospital,
    ambulanceSnapshot,
    currentState,
    fallbackHospitals,
    holdTimeRemaining,
    noBedsAvailable,
    panelOpen,
    rankedHospitals,
    reservation,
    searchMessage,
    searchState,
    selectHospital,
    reserveHospital,
    confirmReservation,
    selectedHospitalId,
    startEmergencySearch,
    workflowSteps,
  } = useEmergencyFlow(hospitals, { surgeMode });

  const totals = useMemo(() => {
    return rankedHospitals.reduce(
      (accumulator, hospital) => {
        const status = getHospitalOperationalState(hospital, reservation);
        accumulator.totalBeds += hospital.beds;
        accumulator[status.key] = (accumulator[status.key] ?? 0) + 1;
        return accumulator;
      },
      { totalBeds: 0, available: 0, limited: 0, full: 0, held: 0, reserved: 0 }
    );
  }, [rankedHospitals, reservation]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(39,191,255,0.16),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(255,76,76,0.15),_transparent_28%),linear-gradient(140deg,_#040b16_0%,_#091728_42%,_#040812_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(79,124,172,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(79,124,172,0.12)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Topbar
          connectionState={connectionState}
          dataHealth={latestUpdateHealth}
          surgeMode={surgeMode}
          onToggleSurgeMode={() => setSurgeMode((current) => !current)}
          totals={totals}
        />

        <main className="flex flex-1 flex-col gap-4 px-4 pb-28 pt-3 lg:px-5 lg:pb-8">
          <section className="grid flex-1 gap-4 lg:grid-cols-[390px_minmax(0,1fr)_390px]">
            <Sidebar
              hospitals={rankedHospitals}
              reservation={reservation}
              searchState={searchState}
              searchMessage={searchMessage}
              selectedHospitalId={selectedHospitalId}
              onReserveHospital={reserveHospital}
              onSelectHospital={selectHospital}
              lastUpdated={lastUpdated}
            />

            <div className="relative min-h-[540px] overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/40 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
              <div className="absolute inset-x-0 top-0 z-[500] flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/55 px-5 py-4 backdrop-blur-xl">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.38em] text-cyan-200/70">
                    Predictive Response Grid
                  </p>
                  <h1 className="mt-2 max-w-2xl font-['Space_Grotesk'] text-2xl font-semibold leading-tight text-white lg:text-[2rem]">
                    Real-world emergency routing with live ICU confidence.
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 shadow-[0_0_25px_rgba(34,211,238,0.18)]">
                    Search / Select / Reserve / Track
                  </div>
                  <div className="rounded-full border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 shadow-[0_0_25px_rgba(244,63,94,0.18)]">
                    {noBedsAvailable ? "Fallback radius active" : "Ambulance dispatch ready"}
                  </div>
                </div>
              </div>

              <MapView
                hospitals={rankedHospitals}
                selectedHospitalId={selectedHospitalId}
                reservation={reservation}
                ambulanceSnapshot={ambulanceSnapshot}
                onSelectHospital={selectHospital}
              />
            </div>

            <RightPanel
              activeHospital={activeHospital}
              ambulanceSnapshot={ambulanceSnapshot}
              currentState={currentState}
              fallbackHospitals={fallbackHospitals}
              holdTimeRemaining={holdTimeRemaining}
              noBedsAvailable={noBedsAvailable}
              onConfirmReservation={confirmReservation}
              panelOpen={panelOpen}
              reservation={reservation}
              searchMessage={searchMessage}
              searchState={searchState}
              workflowSteps={workflowSteps}
            />
          </section>

          <EmergencyButton onRequest={startEmergencySearch} searchState={searchState} />
        </main>
      </div>
    </div>
  );
}
