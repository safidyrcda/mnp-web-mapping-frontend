import { Funder } from '@/lib/schemas';
import { ChevronDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface FunderSearchFilterProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  funders: Funder[];
  active: boolean;
}

export function FunderSearchFilter({
  label,
  value,
  onChange,
  funders,
  active,
}: FunderSearchFilterProps) {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Nom du bailleur sélectionné (pour l'affichage)
  const selectedName = funders.find((f) => f.id === value)?.name ?? '';

  // Quand on ouvre le dropdown, pré-remplir le texte avec le nom sélectionné
  const handleFocus = () => {
    setSearchText('');
    setIsOpen(true);
  };

  const filteredFunders = useMemo(() => {
    if (!searchText.trim()) return funders;
    const q = searchText.toLowerCase();
    return funders.filter(
      (f) =>
        f.name?.toLowerCase().includes(q) ||
        f.fullname?.toLowerCase().includes(q),
    );
  }, [searchText, funders]);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchText('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchText('');
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          display: 'block',
          marginBottom: 6,
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={isOpen ? searchText : selectedName}
          onChange={(e) => {
            setSearchText(e.target.value);
            setIsOpen(true);
          }}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder="Rechercher un bailleur…"
          style={{
            width: '100%',
            padding: '7px 32px 7px 10px',
            border: '1.5px solid',
            borderColor: active ? '#1e4976' : '#e2e8f0',
            borderRadius: 8,
            fontSize: 12,
            color: active ? '#0f172a' : '#64748b',
            background: active ? '#f0f6ff' : '#f8fafc',
            outline: 'none',
            cursor: 'text',
            boxSizing: 'border-box',
          }}
        />

        {/* Bouton effacer si sélectionné, sinon chevron */}
        {value ? (
          <button
            type="button"
            onMouseDown={handleClear}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94a3b8',
              display: 'flex',
              padding: 2,
            }}
          >
            <X size={13} />
          </button>
        ) : (
          <ChevronDown
            size={13}
            color="#94a3b8"
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: 'white',
            border: '1.5px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            zIndex: 100,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {/* Option "Tous" */}
          <button
            type="button"
            onMouseDown={() => handleSelect('')}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 12px',
              fontSize: 12,
              color: '#94a3b8',
              fontStyle: 'italic',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid #f1f5f9',
              cursor: 'pointer',
            }}
          >
            Tous les bailleurs
          </button>

          {filteredFunders.length === 0 ? (
            <div
              style={{
                padding: '10px 12px',
                fontSize: 12,
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              Aucun résultat
            </div>
          ) : (
            filteredFunders.map((f) => (
              <button
                key={f.id}
                type="button"
                onMouseDown={() => handleSelect(f.id ?? '')}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: 12,
                  color: f.id === value ? '#1e4976' : '#0f172a',
                  fontWeight: f.id === value ? 700 : 400,
                  background: f.id === value ? '#eff6ff' : 'none',
                  border: 'none',
                  borderBottom: '1px solid #f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
                onMouseEnter={(e) => {
                  if (f.id !== value)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (f.id !== value)
                    (e.currentTarget as HTMLButtonElement).style.background =
                      'none';
                }}
              >
                <span>{f.name}</span>
                {f.fullname && (
                  <span style={{ fontSize: 10, color: '#94a3b8' }}>
                    {f.fullname}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
