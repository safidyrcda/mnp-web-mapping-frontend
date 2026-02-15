'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/lib/schemas';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/mock-data';
import { ProjectForm } from './project-form';
import { ProjectsTable } from './projects-table';
import { BaseModal } from '@/components/modals/base-modal';
import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsInitialLoading(true);
      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des projets');
      console.error(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSelectedProject(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (data: Project) => {
    try {
      setIsLoading(true);
      if (selectedProject?.id) {
        await updateProject(selectedProject.id, data);
        toast.success('Projet mis à jour avec succès');
      } else {
        await createProject(data);
        toast.success('Projet créé avec succès');
      }
      setIsFormOpen(false);
      await loadProjects();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject?.id) return;
    try {
      setIsLoading(true);
      await deleteProject(selectedProject.id);
      toast.success('Projet supprimé avec succès');
      await loadProjects();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projets</h1>
        <Button onClick={handleCreateClick} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau projet
        </Button>
      </div>

      <ProjectsTable
        projects={projects}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <BaseModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={selectedProject ? 'Modifier le projet' : 'Nouveau projet'}
      >
        <ProjectForm
          initialData={selectedProject || undefined}
          onSubmit={handleFormSubmit}
          loading={isLoading}
        />
      </BaseModal>

      <ConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Supprimer le projet"
        description={`Êtes-vous sûr de vouloir supprimer "${selectedProject?.name}" ? Cette action ne peut pas être annulée.`}
        onConfirm={handleDeleteConfirm}
        loading={isLoading}
        confirmText="Supprimer"
        isDangerous={true}
      />
    </div>
  );
}
