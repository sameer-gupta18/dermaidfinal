import { useEffect, useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { Link } from 'react-router-dom'

function FindDermatologist() {
  const [userLocation, setUserLocation] = useState(null);
  const [dermatologists, setDermatologists] = useState([]);
  const [map, setMap] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyB-fsH5XZpQbimC8E9lfgZTSE9wXLfI4hc',
    libraries: ["places"],
  });

  // Get user location
  useEffect(() => {
    if (!navigator?.geolocation) return;
    const opts = { enableHighAccuracy: true, timeout: 10000 };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => console.error('Geolocation error:', error),
      { ...opts }
    );
  }, []);

  // Haversine distance in km
  const distanceKm = (a, b) => {
    if (!a || !b) return null;
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.msg || a.lat) * 0 + a.lat; // ensure numbers
    const lat2 = (b.msg || b.lat) * 0 + b.lat;
    const s1 = Math.sin(dLat / 2);
    const s2 = Math.sin(dLon / 2);
    const aVal = s1 * s1 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * s2 * s2;
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return Number((R * c).toFixed(2));
  };

  const priceText = (level) => {
    if (level === undefined || level === null) return 'N/A';
    return '$'.repeat(Math.max(1, Math.min(4, level)));
  };

  const handleMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Fetch nearby dermatologists when map & location are ready
  useEffect(() => {
    if (!isLoaded || !map || !userLocation || !window.google) return;

    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location: userLocation,
      radius: 5000,
      keyword: 'dermatologist',
      type: 'doctor',
      // You can also use `type: ['doctor']` depending on API version
    };

    const resultsAccumulator = [];

    const fetchNext = () => {
      service.nearbySearch(request, (results, status, pagination) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const mappedBatch = results.map((place) => {
            const loc = place.geometry?.location;
            const coords = loc ? { lat: Number(loc.lat()), lng: Number(loc.lng()) } : null;
            return {
              id: place.place_id,
              name: place.name || 'Unknown',
              location: {
                lat: coords?.lat ?? null,
                lng: coords?.lng ?? null,
                address: place.vicinity || place.formatted_address || 'Address not available',
              },
              distanceKm: coords ? distanceKm(userLocation, coords) : null,
              rating: place.rating ?? 'N/A',
              price: priceText(place.price_level),
              userRatingsTotal: place.user_ratings_total ?? 0,
              link: null,
            };
          });

          resultsAccumulator.push(...mappedBatch);

          if (pagination && pagination.hasNextPage) {
            // Fetch next page of results
            pagination.nextPage();
          } else {
            // De-duplicate by place_id and set state once
            const dedup = new Map(resultsAccumulator.map((r) => [r.id, r]));
            const combined = Array.from(dedup.values()).sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
            setDermatologists(combined);

            // Fetch details for each place to get Google Maps URL
            combined.forEach((p) => {
              const detailReq = { placeId: p.id, fields: ['url'] };
              service.getDetails(detailReq, (detail, ds) => {
                if (ds === window.google.maps.places.PlacesServiceStatus.OK && detail?.url) {
                  setDermatologists((prev) => prev.map((d) => (d.id === p.id ? { ...d, link: detail.url } : d)));
                }
              });
            });
          }
        } else if (status !== window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
          console.warn("Places search status:", status);
        }
      });
    };

    // kick off first page fetch
    fetchNext();
  }, [isLoaded, map, userLocation]);

  return (
    <div style={{ paddingTop: '90px', minHeight: '100vh', padding: '90px 2rem 2rem' }}>
      <h1>Find Nearest Dermatologist</h1>

      {!isLoaded && <p>Loading map…</p>}

      {isLoaded && userLocation && (
        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <GoogleMap
            onLoad={handleMapLoad}
            center={userLocation}
            zoom={13}
            mapContainerStyle={{ width: '100%', height: '360px', borderRadius: '16px' }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* User location marker */}
            <Marker position={userLocation} title="You are here" />
            {/* Dermatologist markers */}
            {dermatologists
              .filter((d) => d.location?.lat && d.location?.lng)
              .map((d) => (
                <Marker
                  key={d.id}
                  position={{ lat: d.location.lat, lng: d.location.lng }}
                  title={`${d.name} (${d.rating !== 'N/A' ? `★ ${d.rating}` : ''})`}
                  
                  
                />
              ))}
          </GoogleMap>
        </div>
      )}

      {userLocation && (
        <div style={{ marginTop: '16px' }}>
          <h2>Nearby dermatologists</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {dermatologists.map((d) => (
              <a
                key={d.id}
                href={d.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 6px 18px rgba(20,184,166,0.12)'
                }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.name}</div>
                  <div style={{ fontSize: '0.9rem', color: '#0f172a', opacity: 0.85 }}>{d.location.address}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '12px', fontSize: '0.9rem' }}>
                    <span>Distance: {d.distanceKm ?? '—'} km</span>
                    <span>Rating: {d.rating}</span>
                    <span>Price: {d.price}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FindDermatologist;

