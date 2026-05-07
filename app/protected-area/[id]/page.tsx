'use client';

import { useParams } from 'next/navigation';
import { ProtectedAreaDetailPage } from './_components/protected-area-details';

export default function ProtectedAreaDetailRoute() {
  const params = useParams();
  const activityId = params.id as string;
  return <ProtectedAreaDetailPage areaId={activityId} />;
}
