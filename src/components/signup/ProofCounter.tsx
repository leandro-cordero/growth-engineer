import { useEffect, useState } from 'react';
import { formatCount, PROOF_BASE, startTicking } from '../../lib/proof-counter';

// React twin of ProofCounter.astro. Rendered only when variant === 'counter', so control HTML has
// no counter DOM. Simulated figure: see lib/proof-counter.ts.
export default function ProofCounter() {
  const [count, setCount] = useState(PROOF_BASE);
  useEffect(() => startTicking(() => setCount((c) => c + 1)), []);
  return (
    <p data-exp="funnel_proof_v1" data-variant="counter" className="mt-3 text-sm text-ink-muted">
      {formatCount(count)} traders have created a free account
    </p>
  );
}
