'use client';

import { useParams } from 'next/navigation';
import ProtectedAreaEditor from './_components/ap-editor';

export default function ProtectedAreaPage() {
  const params = useParams();
  const areaId = params.id as string;

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ProtectedAreaEditor areaId={areaId} />
    </div>
  );
}
