'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Store } from '@/lib/stores-db';

interface StoresMapProps {
  stores: Store[];
  onStoreClick?: (store: Store) => void;
}

export function StoresMap({ stores, onStoreClick }: StoresMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersGroup = useRef<L.FeatureGroup | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Venezuela
    map.current = L.map(mapContainer.current).setView([6.5, -66.5], 5);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    markersGroup.current = L.featureGroup().addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !markersGroup.current) return;

    // Clear existing markers
    markersGroup.current.clearLayers();

    stores.forEach((store) => {
      // Create custom HTML icon with IVOO branding
      const iconHtml = `
        <div class="flex items-center justify-center relative">
          <svg width="40" height="50" viewBox="0 0 40 50" fill="none" class="drop-shadow-lg">
            <!-- Heart/Pin shape -->
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
              </filter>
            </defs>
            <!-- White background pin -->
            <path d="M 20 0 C 8.95 0 0 8.95 0 20 C 0 35 20 50 20 50 C 20 50 40 35 40 20 C 40 8.95 31.05 0 20 0 Z" 
                  fill="white" filter="url(#shadow)" stroke="#f0f0f0" stroke-width="1"/>
            <!-- Green IVOO logo text -->
            <text x="20" y="22" font-family="Arial, sans-serif" font-size="8" font-weight="bold" 
                  text-anchor="middle" fill="#00d96f">
              IVOO
            </text>
          </svg>
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        iconSize: [40, 50],
        iconAnchor: [20, 50],
        popupAnchor: [0, -50],
        className: 'ivoo-pin-icon',
      });

      const marker = L.marker([store.latitude, store.longitude], { icon })
        .bindPopup(`
          <div class="p-2">
            <p class="font-bold text-sm mb-1">${store.name}</p>
            <p class="text-xs text-gray-600">${store.address}</p>
            <p class="text-xs text-gray-500 mt-1">${store.city}, ${store.region}</p>
          </div>
        `)
        .on('click', () => {
          onStoreClick?.(store);
        });

      if (markersGroup.current) {
        markersGroup.current.addLayer(marker);
      }
    });

    // Fit map bounds to all stores
    if (stores.length > 0) {
      const bounds = markersGroup.current?.getBounds();
      if (bounds) {
        map.current?.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [stores, onStoreClick]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-lg border border-gray-200"
      style={{ minHeight: '600px' }}
    />
  );
}
