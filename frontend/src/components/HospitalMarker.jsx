import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import ConfidenceBadge from "./ui/ConfidenceBadge";
import { getHospitalOperationalState } from "../utils/hospitalStatus";
import { formatEta } from "../utils/triage";

function createHospitalIcon(status, selected) {
  return L.divIcon({
    className: "",
    html: `
      <div class="marker-shell ${selected ? "marker-shell-selected" : ""}">
        <div class="marker-glow" style="background:${status.glow}"></div>
        <div class="marker-core" style="border-color:${status.ring}; box-shadow:0 0 18px ${status.shadow}">
          <span class="marker-dot" style="background:${status.ring}"></span>
          <span class="marker-label">${status.shortLabel}</span>
        </div>
      </div>
    `,
    iconSize: [86, 86],
    iconAnchor: [43, 43],
    popupAnchor: [0, -30],
  });
}

export default function HospitalMarker({ hospital, reservation, selected, onSelect }) {
  const status = getHospitalOperationalState(hospital, reservation);

  return (
    <Marker
      position={[hospital.lat, hospital.lng]}
      icon={createHospitalIcon(status, selected)}
      eventHandlers={{
        click: onSelect,
      }}
    >
      <Popup className="rapidcare-popup min-w-[260px]">
        <div className="space-y-3 text-slate-900">
          <div>
            <div className="text-base font-semibold">{hospital.name}</div>
            <div className="text-sm text-slate-600">{hospital.type} ICU</div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>{hospital.beds} beds</span>
            <span>{formatEta(hospital.etaMinutes)}</span>
          </div>
          <ConfidenceBadge updatedAt={hospital.updatedAt} />
        </div>
      </Popup>
    </Marker>
  );
}
