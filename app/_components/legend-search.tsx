'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProtectedArea } from '@/lib/schemas';
import { getProtectedAreas } from '../_api/manage-data';

type Props = {
  onSelectArea: (area: ProtectedArea, coordinates?: number[]) => void;
};

export default function LegendSearch({ onSelectArea }: Props) {
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [protectedAreas, setProtectedAreas] = useState<ProtectedArea[]>([]);

  useEffect(() => {
    async function fetchProtectedAreas() {
      try {
        const res = await getProtectedAreas();
        setProtectedAreas(res);
      } catch (error) {
        console.error('Erreur lors du chargement des aires protégées', error);
      }
    }

    fetchProtectedAreas();
  }, []);

  const filteredAreas = useMemo(() => {
    if (!searchValue.trim()) return [];

    return protectedAreas.filter((area) => {
      const name = area.name?.toLowerCase() || '';
      const sigle = area.sigle?.toLowerCase() || '';
      const search = searchValue.toLowerCase();

      return name.includes(search) || sigle.includes(search);
    });
  }, [searchValue, protectedAreas]);

  const handleSelectArea = (area: ProtectedArea) => {
    onSelectArea(area);
    setSearchValue('');
    setIsOpen(false);
  };

  const typeColors: Record<string, { color: string; label: string }> = {
    PN: { color: '#2ecc71', label: 'Parc National' },
    RS: { color: '#014d23', label: 'Réserve Spéciale' },
    RNI: { color: '#b86f09', label: 'Réserve Naturelle Intégrale' },
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Search Section */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Rechercher une aire protégée
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Saisissez le nom de l'aire protégée"
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
          />

          {/* Dropdown Results */}
          {isOpen && filteredAreas.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
              {filteredAreas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => handleSelectArea(area)}
                  className="w-full text-left px-4 py-3 hover:bg-amber-50 transition border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-amber-100"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900">
                      {area.name}
                    </span>
                    {area.size && (
                      <span className="text-xs text-gray-500">
                        {area.size.toLocaleString()} ha
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {isOpen && searchValue && filteredAreas.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 text-sm">
              Aucune aire protégée trouvée
            </div>
          )}
        </div>
      </div>

      {/* Legend Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Légende</h3>
        <div className="space-y-3">
          {Object.entries(typeColors).map(([type, { color, label }]) => (
            <div key={type} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Conseil</p>
        <p>
          Cliquez sur une zone de la carte ou utilisez la barre de recherche
          pour explorer les détails et les financements.
        </p>
      </div>
    </div>
  );
}
