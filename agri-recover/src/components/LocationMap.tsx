import { useEffect, useRef } from 'react';
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Fix broken default icon in Vite/Webpack builds ──────────────────────────
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// @ts-expect-error – leaflet internal
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

/** Re-centres the map whenever the target position changes. */
function Recenter({ position }: { position: LatLngExpression }) {
  const map = useMap();
  const prev = useRef<LatLngExpression | null>(null);
  useEffect(() => {
    const [lat, lng] = position as [number, number];
    const [prevLat, prevLng] = (prev.current as [number, number]) ?? [null, null];
    if (lat !== prevLat || lng !== prevLng) {
      map.setView(position, map.getZoom(), { animate: true });
      prev.current = position;
    }
  }, [map, position]);
  return null;
}

/** Registers click-to-pin on the map (interactive mode only). */
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onChange(e.latlng.lat, e.latlng.lng) });
  return null;
}

interface LocationMapProps {
  latitude: number;
  longitude: number;
  /** When provided the map is interactive (click to move pin + GPS button). */
  onChange?: (lat: number, lng: number) => void;
  /** Accuracy radius in metres to draw around the pin (optional). */
  accuracyMetres?: number;
  /** Map height, defaults to 390px */
  height?: number;
}

export function LocationMap({ latitude, longitude, onChange, accuracyMetres, height = 390 }: LocationMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="location-map" style={{ '--map-h': `${height}px` } as React.CSSProperties}>
      <MapContainer center={position} zoom={13} scrollWheelZoom style={{ height: `${height}px`, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter position={position} />
        <Marker position={position} />
        {accuracyMetres && accuracyMetres > 0 && (
          <Circle
            center={position}
            radius={accuracyMetres}
            pathOptions={{ color: '#166534', fillColor: '#22c55e', fillOpacity: 0.08, weight: 1 }}
          />
        )}
        {onChange && <ClickHandler onChange={onChange} />}
      </MapContainer>
      <span className="map-attribution">
        {onChange
          ? 'Tap the map to pin your field location. Map data © OpenStreetMap contributors.'
          : 'Map data © OpenStreetMap contributors.'}
      </span>
    </div>
  );
}
