'use client';

import { Suspense } from 'react';
import { ProblemDescriptionForm } from '../../components/customer/ProblemDescriptionForm';

function ProblemDescriptionContent() {
  return <ProblemDescriptionForm />;
}

export default function DescribePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProblemDescriptionContent />
    </Suspense>
  );
}