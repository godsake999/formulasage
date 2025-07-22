import { Suspense } from 'react';
import ClientAllFormulas from './client-all-formulas';

export default function FormulasPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading page...</div>}>
      <ClientAllFormulas />
    </Suspense>
  );
}