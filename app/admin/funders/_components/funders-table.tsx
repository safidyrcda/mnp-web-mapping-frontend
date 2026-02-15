'use client';

import { Funder } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface FundersTableProps {
  funders: Funder[];
  onEdit: (funder: Funder) => void;
  onDelete: (funder: Funder) => void;
}

export function FundersTable({ funders, onEdit, onDelete }: FundersTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Nom complet
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {funders.map((funder) => (
            <tr
              key={funder.id}
              className="border-b border-border hover:bg-muted/30 transition-colors"
            >
              <td className="px-6 py-3 text-sm font-medium">{funder.name}</td>
              <td className="px-6 py-3 text-sm text-muted-foreground">
                {funder.fullname || '-'}
              </td>
              <td className="px-6 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(funder)}
                    className="w-9 h-9 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(funder)}
                    className="w-9 h-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {funders.length === 0 && (
        <div className="px-6 py-12 text-center text-muted-foreground">
          Aucun financeur trouvé. Créez-en un pour commencer.
        </div>
      )}
    </div>
  );
}
