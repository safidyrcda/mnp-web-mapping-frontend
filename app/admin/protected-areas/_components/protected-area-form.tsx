'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { ProtectedArea } from '@/lib/schemas';

interface Props {
  initialData?: Partial<ProtectedArea> & {
    superficie?: number;
    creationYear?: number;
    regions?: string[];
    districts?: string[];
    communes?: string[];
    populationCount?: number;
    femaleClpNumber?: number;
    maleClpNumber?: number;
  };
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
}

export function ProtectedAreaForm({ initialData, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    name: initialData?.name ?? '',
    status: initialData?.status ?? '',
    superficie: initialData?.superficie ?? '',
    creationYear: initialData?.creationYear ?? '',
    regions: (initialData?.regions ?? []).join(', '),
    districts: (initialData?.districts ?? []).join(', '),
    communes: (initialData?.communes ?? []).join(', '),
    populationCount: initialData?.populationCount ?? '',
    femaleClpNumber: initialData?.femaleClpNumber ?? '',
    maleClpNumber: initialData?.maleClpNumber ?? '',
  });

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    await onSubmit({
      name: form.name || undefined,
      status: form.status || undefined,
      superficie: form.superficie ? Number(form.superficie) : undefined,
      creationYear: form.creationYear ? Number(form.creationYear) : undefined,
      regions: form.regions
        ? form.regions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      districts: form.districts
        ? form.districts
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      communes: form.communes
        ? form.communes
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      populationCount: form.populationCount
        ? Number(form.populationCount)
        : undefined,
      femaleClpNumber: form.femaleClpNumber
        ? Number(form.femaleClpNumber)
        : undefined,
      maleClpNumber: form.maleClpNumber
        ? Number(form.maleClpNumber)
        : undefined,
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 8,
    fontSize: 13,
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    color: '#64748b',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    display: 'block',
    marginBottom: 5,
  };

  return (
    <div className="space-y-4">
      {/* Identité */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: 10,
          padding: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1e4976',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
          }}
        >
          Identité
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Nom</label>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Nom complet"
            />
          </div>
          <div>
            <label style={labelStyle}>Statut</label>
            <input
              style={inputStyle}
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
              placeholder="ex. Parc National"
            />
          </div>
        </div>
      </div>

      {/* Géographie */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: 10,
          padding: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1e4976',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
          }}
        >
          Géographie
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={labelStyle}>Superficie (ha)</label>
            <input
              type="number"
              style={inputStyle}
              value={form.superficie}
              onChange={(e) => set('superficie', e.target.value)}
              placeholder="ex. 125000"
            />
          </div>
          <div>
            <label style={labelStyle}>Année de création</label>
            <input
              type="number"
              style={inputStyle}
              value={form.creationYear}
              onChange={(e) => set('creationYear', e.target.value)}
              placeholder="ex. 1997"
            />
          </div>
        </div>
        <div className="space-y-3 mt-3">
          {[
            { key: 'regions', label: 'Régions' },
            { key: 'districts', label: 'Districts' },
            { key: 'communes', label: 'Communes' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>
                {label}{' '}
                <span
                  style={{
                    fontWeight: 400,
                    textTransform: 'none',
                    letterSpacing: 0,
                  }}
                >
                  (séparées par des virgules)
                </span>
              </label>
              <input
                style={inputStyle}
                value={(form as any)[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={`ex. Sofia, Diana`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Population & CLP */}
      <div
        style={{
          background: '#f8fafc',
          borderRadius: 10,
          padding: '14px',
          border: '1px solid #e2e8f0',
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: '#1e4976',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 12,
          }}
        >
          Population & CLP
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'populationCount', label: 'Population totale' },
            { key: 'femaleClpNumber', label: 'Membres CLP ♀' },
            { key: 'maleClpNumber', label: 'Membres CLP ♂' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <input
                type="number"
                style={inputStyle}
                value={(form as any)[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <Button type="button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
}
