'use client';

import { Project } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectsTable({ projects, onEdit, onDelete }: ProjectsTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-3 text-left text-sm font-semibold">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
            <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id} className="border-b border-border hover:bg-muted/30 transition-colors">
              <td className="px-6 py-3 text-sm font-medium">{project.name}</td>
              <td className="px-6 py-3 text-sm text-muted-foreground line-clamp-2">
                {project.fullname || '-'}
              </td>
              <td className="px-6 py-3">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(project)}
                    className="w-9 h-9 p-0"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(project)}
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
      {projects.length === 0 && (
        <div className="px-6 py-12 text-center text-muted-foreground">
          Aucun projet trouvé. Créez-en un pour commencer.
        </div>
      )}
    </div>
  );
}
