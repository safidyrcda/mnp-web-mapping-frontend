'use client';

import { Funding, Funder, Project, ProtectedArea } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface FundingTableProps {
  fundings: Funding[];
  funders: Funder[];
  projects: Project[];
  protectedAreas: ProtectedArea[];
  onEdit: (funding: Funding) => void;
  onDelete: (funding: Funding) => void;
}

export function FundingTable({
  fundings,
  funders,
  projects,
  protectedAreas,
  onEdit,
  onDelete,
}: FundingTableProps) {
  const getFunderName = (id: string) => {
    return funders.find((f) => f.id === id)?.name || 'N/A';
  };

  const getProjectName = (id: string | null | undefined) => {
    if (!id) return 'Aucun';
    return projects.find((p) => p.id === id)?.name || 'N/A';
  };

  const getProtectedAreaName = (id: string) => {
    const pa = protectedAreas.find((p) => p.id === id);
    return pa ? `${pa.sigle} - ${pa.name}` : 'N/A';
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Financeur</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Aire protégée</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Projet</th>
            <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fundings.map((funding) => (
            <tr key={funding.id} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="px-6 py-3 text-sm font-medium">{funding.name}</td>
              <td className="px-6 py-3 text-sm text-muted-foreground">
                {getFunderName(funding.funderId)}
              </td>
              <td className="px-6 py-3 text-sm text-muted-foreground">
                {getProtectedAreaName(funding.protectedAreaId)}
              </td>
              <td className="px-6 py-3 text-sm text-muted-foreground">
                {getProjectName(funding.projectId)}
              </td>
              <td className="px-6 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(funding)}
                    className="w-9 h-9 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(funding)}
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
      {fundings.length === 0 && (
        <div className="px-6 py-12 text-center text-muted-foreground">
          Aucun financement trouvé. Créez-en un pour commencer.
        </div>
      )}
    </div>
  );
}
