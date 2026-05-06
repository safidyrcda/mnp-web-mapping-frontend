'use client';

import { Funding, Funder, Project, ProtectedArea } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { GetFundingsDTO } from '@/app/api/manage-data';
import { useRouter } from 'next/navigation';

interface FundingTableProps {
  fundings: GetFundingsDTO;
  funders: Funder[];
  projects: Project[];
  protectedAreas: ProtectedArea[];
  onEdit: (funding: Funding) => void;
  onDelete: (funding: Funding) => void;
}

export function FundingTable({
  fundings,
  onEdit,
  onDelete,
}: FundingTableProps) {
  const formatMonthYear = (date?: Date | string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric',
    });
  };

  const router = useRouter();

  const formatAmount = (
    amount?: number | string,
    currency?: string,
  ): string => {
    if (amount === null || amount === undefined) return '-';
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '-';
    const formatted = new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(value);
    return currency ? `${formatted} ${currency}` : formatted;
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Bailleur(s)
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Aires protégées
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Début</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Fin</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Montant
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {fundings.map((funding) => (
            <tr
              key={funding.id}
              className="border-b border-border hover:bg-muted/30 transition-colors"
            >
              <td className="px-6 py-3 text-sm font-medium">
                {funding.name || '-'}
              </td>
              <td className="px-6 py-3 text-sm text-muted-foreground">
                {funding.funderFundings?.map((f) => (
                  <span key={f.id} className="block">
                    {f.funder?.name}
                  </span>
                )) ?? '-'}
              </td>
              <td className="px-6 py-3 text-sm text-muted-foreground">
                {funding.protectedAreaFundings?.map((paf) => (
                  <span key={paf.id} className="block">
                    {paf.protectedArea?.sigle ?? paf.protectedArea?.name}
                  </span>
                )) ?? '-'}
              </td>
              <td className="px-6 py-3 text-sm">
                {formatMonthYear(funding.debut)}
              </td>
              <td className="px-6 py-3 text-sm">
                {formatMonthYear(funding.end)}
              </td>
              <td className="px-6 py-3 text-sm">
                {formatAmount(funding.amount, funding.currency)}
              </td>
              <td className="px-6 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onEdit({
                        id: funding.id,
                        name: funding.name,
                        amount: funding.amount,
                        currency: funding.currency,
                        debut: funding.debut,
                        end: funding.end,
                        projectId: funding.project?.id,
                        protectedAreaIds:
                          funding.protectedAreaFundings?.map(
                            (paf) => paf.protectedArea?.id ?? '',
                          ) ?? [],
                        funders:
                          funding.funderFundings?.map(
                            (ff) => ff.funder?.id ?? '',
                          ) ?? [],
                      })
                    }
                    className="w-9 h-9 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onDelete({
                        id: funding.id,
                        name: funding.name,
                        projectId: funding.project?.id,
                      })
                    }
                    className="w-9 h-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/fundings/${funding.id}`)}
                    className="w-9 h-9 p-0"
                  >
                    <Eye className="w-4 h-4" />
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
