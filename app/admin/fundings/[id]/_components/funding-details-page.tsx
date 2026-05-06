'use client';

import { useState, useEffect } from 'react';
import { FundingItem, getFundings } from '@/app/api/manage-data';
import { ActivityTab } from './activity-tab';
import { DisbursementTab } from './disbursement-tab';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FundingDetailPageProps {
  fundingId: string;
}

type Tab = 'activities' | 'disbursements';

export function FundingDetailPage({ fundingId }: FundingDetailPageProps) {
  const router = useRouter();
  const [funding, setFunding] = useState<FundingItem | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('activities');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFunding();
  }, [fundingId]);

  const loadFunding = async () => {
    try {
      setIsLoading(true);
      const all = await getFundings();
      const found = all.find((f) => f.id === fundingId) ?? null;
      setFunding(found);
    } catch {
      toast.error('Erreur lors du chargement du financement');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!funding) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Financement introuvable.</div>
      </div>
    );
  }

  const funders = funding.funderFundings.map((ff) => ff.funder.name).join(', ');
  const areas = funding.protectedAreaFundings
    .map((paf) => paf.protectedArea.sigle)
    .join(', ');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 space-y-2">
        <h1 className="text-2xl font-bold">
          {funding.name || 'Financement sans nom'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {funders && (
            <span>
              Bailleur(s) :{' '}
              <strong className="text-foreground">{funders}</strong>
            </span>
          )}
          {areas && (
            <span>
              Aires protégées :{' '}
              <strong className="text-foreground">{areas}</strong>
            </span>
          )}
          {funding.amount && (
            <span>
              Montant :{' '}
              <strong className="text-foreground">
                {new Intl.NumberFormat('fr-FR').format(funding.amount)}{' '}
                {funding.currency ?? ''}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0">
          {(
            [
              { key: 'activities', label: 'Activités' },
              { key: 'disbursements', label: 'Décaissements' },
            ] as { key: Tab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'activities' && <ActivityTab fundingId={fundingId} />}
      {activeTab === 'disbursements' && (
        <DisbursementTab fundingId={fundingId} />
      )}
    </div>
  );
}
