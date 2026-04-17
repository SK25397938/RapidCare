import { Circle, MapContainer, Marker, Polyline, TileLayer, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import HospitalMarker from "./HospitalMarker";
import { AMBULANCE_ORIGIN } from "../utils/triage";
import { getHospitalOperationalState } from "../utils/hospitalStatus";

const defaultCenter = [19.076, 72.8777];

function createAmbulanceIcon(phase) {
  const phaseLabel = phase === "arriving" ? "Arriving" : phase === "en_route" ? "En route" : "Assigned";

  return L.divIcon({
    className: "",
    html: `
      <div class="ambulance-shell ${phase === "en_route" ? "ambulance-shell-active" : ""}">
        <div class="ambulance-dot"></div>
        <div class="ambulance-label">${phaseLabel}</div>
      </div>
    `,
    iconSize: [120, 42],
    iconAnchor: [60, 21],
  });
}

function FlyToHospital({ hospital }) {
  const map = useMap();

  if (hospital) {
    map.flyTo([hospital.lat, hospital.lng], Math.max(map.getZoom(), 12), {
      animate: true,
      duration: 1.2,
    });
  }

  return null;
}

export default function MapView({ hospitals, selectedHospitalId, reservation, ambulanceSnapshot, onSelectHospital }) {
  const selectedHospital = hospitals.find((hospital) => hospital.id === selectedHospitalId) || null;

  return (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      zoomControl={false}
      className="rapidcare-map h-full min-h-[540px] w-full"
    >
      <ZoomControl position="bottomright" />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      <FlyToHospital hospital={selectedHospital} />

      {hospitals.map((hospital) => {
        const status = getHospitalOperationalState(hospital, reservation);
        return (
          <Circle
            key={`${hospital.id}-zone`}
            center={[hospital.lat, hospital.lng]}
            radius={status.key === "available" ? 1000 : status.key === "limited" ? 700 : status.key === "held" ? 920 : 460}
            pathOptions={{
              color: status.ring,
              fillColor: status.glow,
              fillOpacity: hospital.id === selectedHospitalId ? 0.3 : 0.14,
              weight: hospital.id === selectedHospitalId ? 2.5 : 1,
            }}
          />
        );
      })}

      {ambulanceSnapshot.active && selectedHospital ? (
        <>
          <Polyline
            positions={[
              [AMBULANCE_ORIGIN.lat, AMBULANCE_ORIGIN.lng],
              [selectedHospital.lat, selectedHospital.lng],
            ]}
            pathOptions={{
              color: "#22d3ee",
              weight: 3,
              opacity: 0.7,
              dashArray: "8 10",
            }}
          />
          <Marker
            position={[ambulanceSnapshot.position.lat, ambulanceSnapshot.position.lng]}
            icon={createAmbulanceIcon(ambulanceSnapshot.phase)}
          />
        </>
      ) : null}

      {hospitals.map((hospital) => (
        <HospitalMarker
          key={hospital.id}
          hospital={hospital}
          reservation={reservation}
          selected={hospital.id === selectedHospitalId}
          onSelect={() => onSelectHospital(hospital.id)}
        />
      ))}
    </MapContainer>
  );
}
