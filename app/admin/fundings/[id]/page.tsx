'use client';

import { useParams, useRouter } from 'next/navigation';
import { FundingDetailPage } from './_components/funding-details-page';
import React from 'react';

export default function FundingDetailRoute() {
  const params = useParams();
  const activityId = params.id as string;

  return <FundingDetailPage fundingId={activityId} />;
}
