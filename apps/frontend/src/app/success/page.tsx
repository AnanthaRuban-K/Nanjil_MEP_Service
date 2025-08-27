'use client';

import { Suspense } from 'react';
import { BookingSuccess } from '../../components/customer/BookingSuccess';

function BookingSuccessContent() {
  return <BookingSuccess />;
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingSuccessContent />
    </Suspense>
  );
}