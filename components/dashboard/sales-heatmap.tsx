'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

export interface HeatmapPoint {
  lat: number;
  lng: number;
  value: number;
}

interface SalesHeatmapProps {
  data: HeatmapPoint[];
  title?: string;
}

export function SalesHeatmap({ data, title = 'Mapa de Calor de Ventas' }: SalesHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const heatmapLayer = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Inicializar mapa
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([10.4806, -66.9036], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Preparar datos para heatmap
    const heatmapData = data.map(point => [point.lat, point.lng, point.value]);

    // Remover capa anterior si existe
    if (heatmapLayer.current) {
      map.current?.removeLayer(heatmapLayer.current);
    }

    // Crear nueva capa de heatmap
    if (heatmapData.length > 0) {
      heatmapLayer.current = (L as any).heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 100,
        gradient: {
          0.0: '#0000ff',
          0.25: '#00ff00',
          0.5: '#ffff00',
          0.75: '#ff6600',
          1.0: '#ff0000',
        },
      });

      heatmapLayer.current.addTo(map.current);
    }
  }, [data]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div ref={mapContainer} className="h-96 rounded-lg border border-slate-200 shadow-sm" />
    </div>
  );
}
