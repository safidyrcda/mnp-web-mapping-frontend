'use client';

import { Activity } from '@/lib/schemas';
import { ActivityWithFundings } from '@/app/api/manage-data';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ActivitiesTableProps {
  activities: ActivityWithFundings[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
}

export function ActivitiesTable({
  activities,
  onEdit,
  onDelete,
}: ActivitiesTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left text-sm font-semibold">Titre</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Description
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Financements liés
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr
              key={activity.id}
              className="border-b border-border hover:bg-muted/30 transition-colors"
            >
              <td className="px-6 py-3 text-sm font-medium max-w-xs">
                {activity.title}
              </td>
              <td className="px-6 py-3 text-sm text-muted-foreground max-w-sm">
                <span className="line-clamp-2">
                  {activity.description || '—'}
                </span>
              </td>
              <td className="px-6 py-3 text-sm">
                {activity.fundings.length === 0 ? (
                  <span className="text-muted-foreground italic text-xs">
                    Aucun financement
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activity.fundings.map((f) => (
                      <span
                        key={f.id}
                        className="bg-muted px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        {f.name || 'Sans nom'}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-6 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(activity)}
                    className="w-9 h-9 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(activity)}
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
      {activities.length === 0 && (
        <div className="px-6 py-12 text-center text-muted-foreground">
          Aucune activité trouvée. Créez-en une pour commencer.
        </div>
      )}
    </div>
  );
}
