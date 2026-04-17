import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getHospitalStatus } from "../utils/hospitalStatus";

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

export default function HospitalMarker({ hospital, selected, onSelect }) {
  const status = getHospitalStatus(hospital.beds);

  return (
    <Marker
      position={[hospital.lat, hospital.lng]}
      icon={createHospitalIcon(status, selected)}
      eventHandlers={{
        click: onSelect,
      }}
    >
      <Popup className="rapidcare-popup">
        <div className="space-y-2 text-slate-900">
          <div className="text-base font-semibold">{hospital.name}</div>
          <div className="text-sm text-slate-600">{hospital.type} ICU</div>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: status.ring }}
            />
              <span className="text-sm font-medium">
              {hospital.beds} beds | {status.label}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
