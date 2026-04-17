import { MapContainer, TileLayer, ZoomControl, Circle, useMap } from "react-leaflet";
import HospitalMarker from "./HospitalMarker";
import { getHospitalStatus } from "../utils/hospitalStatus";

const defaultCenter = [19.076, 72.8777];

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

export default function MapView({ hospitals, selectedHospitalId, onSelectHospital }) {
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
        const status = getHospitalStatus(hospital.beds);
        return (
          <Circle
            key={`${hospital.id}-zone`}
            center={[hospital.lat, hospital.lng]}
            radius={status.key === "available" ? 900 : status.key === "limited" ? 650 : 400}
            pathOptions={{
              color: status.ring,
              fillColor: status.glow,
              fillOpacity: hospital.id === selectedHospitalId ? 0.28 : 0.14,
              weight: hospital.id === selectedHospitalId ? 2.5 : 1,
            }}
          />
        );
      })}

      {hospitals.map((hospital) => (
        <HospitalMarker
          key={hospital.id}
          hospital={hospital}
          selected={hospital.id === selectedHospitalId}
          onSelect={() => onSelectHospital(hospital.id)}
        />
      ))}
    </MapContainer>
  );
}
