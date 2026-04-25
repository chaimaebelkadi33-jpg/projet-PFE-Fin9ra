import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const OpenStreetMap = ({ city, schoolName, adress }) => {
  // Coordinates for Moroccan cities (city centers)
  const cityCoordinates = {
    Rabat: { lat: 34.020882, lng: -6.84165 },
    Casablanca: { lat: 33.57311, lng: -7.589843 },
    Marrakech: { lat: 31.629472, lng: -7.981084 },
    Fès: { lat: 34.018125, lng: -5.007845 },
    Meknès: { lat: 33.87762, lng: -5.538886 },
    Salé: { lat: 34.04143, lng: -6.807482 },
    Kénitra: { lat: 34.26101, lng: -6.57983 },
    Tétouan: { lat: 35.5889, lng: -5.36255 },
    Tanger: { lat: 35.759465, lng: -5.833954 },
    Agadir: { lat: 30.427755, lng: -9.598107 },
    Oujda: { lat: 34.68139, lng: -1.900155 },
  };

  const position = cityCoordinates[city] || { lat: 34.020882, lng: -6.84165 };

  function getIconByType(type) {
    if (type.includes("Ingénieur")) return "🎓";
    if (type.includes("Médecine")) return "🏥";
    if (type.includes("Commerce")) return "💼";
    if (type.includes("Architecture")) return "🏛️";
    if (type.includes("Agriculture")) return "🌱";
    return "🏫";
  }

  return (
    <div className="map-container">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: "8px" }}
        scrollWheelZoom={true}
        className="finn9ra-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[position.lat, position.lng]}>
          <Popup>
            <div className="map-popup">
              <strong>{schoolName}</strong>
              <br />
              {adress}
              <br />
              📍 {city}, Maroc
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;
