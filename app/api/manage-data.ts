import { Funder, Project, Funding, ProtectedArea } from '@/lib/schemas';

export const mockFunders: Funder[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'GEF',
    fullname: 'Global Environment Facility',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'PNUD',
    fullname: 'Programme des Nations Unies pour le Développement',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'KfW',
    fullname: 'Kreditanstalt für Wiederaufbau',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'AFD',
    fullname: 'Agence Française de Développement',
  },
];

export const mockProtectedAreas: ProtectedArea[] = [
  {
    id: '880e8400-e29b-41d4-a716-446655440000',
    sigle: 'PNB',
    name: 'Parc National de la Bénoué',
    size: 180000,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440001',
    sigle: 'PNW',
    name: 'Parc National de Waza',
    size: 55000,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440002',
    sigle: 'PNKB',
    name: 'Parc National de Korup',
    size: 126000,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440003',
    sigle: 'FMT',
    name: 'Forêt de Mbam et Djerem',
    size: 420000,
  },
  {
    id: '880e8400-e29b-41d4-a716-446655440004',
    sigle: 'SVS',
    name: 'Sanctuaire de Vie Sauvage de Douala-Edea',
    size: 160000,
  },
];

export const mockProjects: Project[] = [
  {
    id: '660e8400-e29b-41d4-a716-446655440000',
    name: 'Projet REDD+',
    fullname:
      'Réduction des Émissions dues à la Déforestation et la Dégradation des forêts',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    name: 'Conservation Côtière',
    fullname: 'Programme de conservation des zones côtières sensibles',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    name: 'Biodiversité Terrestre',
    fullname: 'Initiative pour la protection de la biodiversité terrestre',
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    name: 'Agroforesterie',
    fullname: 'Développement des pratiques agroforestières durables',
  },
];

export const mockFundings: Funding[] = [
  {
    id: '770e8400-e29b-41d4-a716-446655440000',
    name: 'Financement GEF REDD+',
    funderId: '550e8400-e29b-41d4-a716-446655440000',
    projectId: '660e8400-e29b-41d4-a716-446655440000',
    protectedAreaId: '880e8400-e29b-41d4-a716-446655440000',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440001',
    name: 'Financement PNUD Biodiversité',
    funderId: '550e8400-e29b-41d4-a716-446655440001',
    projectId: '660e8400-e29b-41d4-a716-446655440002',
    protectedAreaId: '880e8400-e29b-41d4-a716-446655440001',
  },
  {
    id: '770e8400-e29b-41d4-a716-446655440002',
    name: 'Financement KfW Côtier',
    funderId: '550e8400-e29b-41d4-a716-446655440002',
    projectId: '660e8400-e29b-41d4-a716-446655440001',
    protectedAreaId: '880e8400-e29b-41d4-a716-446655440003',
  },
];

let funders = [...mockFunders];
let projects = [...mockProjects];
let fundings = [...mockFundings];
const protectedAreas = [...mockProtectedAreas];

// Simulate API calls
export async function getFunders(): Promise<Funder[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(funders), 300);
  });
}

export async function createFunder(
  funder: Omit<Funder, 'id'>
): Promise<Funder> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFunder: Funder = {
        ...funder,
        id: crypto.randomUUID(),
      };
      funders.push(newFunder);
      resolve(newFunder);
    }, 300);
  });
}

export async function updateFunder(
  id: string,
  funder: Partial<Funder>
): Promise<Funder> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = funders.findIndex((f) => f.id === id);
      if (index !== -1) {
        funders[index] = { ...funders[index], ...funder };
        resolve(funders[index]);
      }
    }, 300);
  });
}

export async function deleteFunder(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      funders = funders.filter((f) => f.id !== id);
      resolve();
    }, 300);
  });
}

export async function getProjects(): Promise<Project[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(projects), 300);
  });
}

export async function createProject(
  project: Omit<Project, 'id'>
): Promise<Project> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newProject: Project = {
        ...project,
        id: crypto.randomUUID(),
      };
      projects.push(newProject);
      resolve(newProject);
    }, 300);
  });
}

export async function updateProject(
  id: string,
  project: Partial<Project>
): Promise<Project> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = projects.findIndex((p) => p.id === id);
      if (index !== -1) {
        projects[index] = { ...projects[index], ...project };
        resolve(projects[index]);
      }
    }, 300);
  });
}

export async function deleteProject(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      projects = projects.filter((p) => p.id !== id);
      resolve();
    }, 300);
  });
}

export async function getFundings(): Promise<Funding[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(fundings), 300);
  });
}

export async function createFunding(
  funding: Omit<Funding, 'id'>
): Promise<Funding> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newFunding: Funding = {
        ...funding,
        id: crypto.randomUUID(),
      };
      fundings.push(newFunding);
      resolve(newFunding);
    }, 300);
  });
}

export async function updateFunding(
  id: string,
  funding: Partial<Funding>
): Promise<Funding> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = fundings.findIndex((f) => f.id === id);
      if (index !== -1) {
        fundings[index] = { ...fundings[index], ...funding };
        resolve(fundings[index]);
      }
    }, 300);
  });
}

export async function deleteFunding(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      fundings = fundings.filter((f) => f.id !== id);
      resolve();
    }, 300);
  });
}

export async function getProtectedAreas(): Promise<ProtectedArea[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(protectedAreas), 300);
  });
}
