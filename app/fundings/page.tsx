'use client';

import { ArrowLeft } from 'lucide-react';
import { FundingPage } from './_components/funding-page';
import { useRouter } from 'next/navigation';

const colors = {
  green: {
    50: '#EAF3DE',
    100: '#C0DD97',
    200: '#97C459',
    600: '#3B6D11',
    800: '#27500A',
    900: '#173404',
  },
  teal: {
    50: '#E1F5EE',
    100: '#9FE1CB',
    200: '#5DCAA5',
    600: '#0F6E56',
    800: '#085041',
    900: '#04342C',
  },
  amber: {
    50: '#FAEEDA',
    100: '#FAC775',
    200: '#EF9F27',
    600: '#854F0B',
    800: '#633806',
  },
};
export default function FundingsPageRoute() {
  const router = useRouter();
  return (
    <div className="mx-auto py-6 px-4 space-y-4">
      {/* Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: colors.teal[600] }}
        onMouseEnter={(e) => (e.currentTarget.style.color = colors.teal[800])}
        onMouseLeave={(e) => (e.currentTarget.style.color = colors.teal[600])}
      >
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="rounded-2xl overflow-hidden shadow-sm" style={{}}></div>
      <FundingPage />
    </div>
  );
}
