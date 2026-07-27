// Squelette de chargement/transition (UX-DR12). Utilisé comme état de repli
// pendant qu'un écran de carrière s'initialise (le contenu est validé au build,
// donc le vrai chargement est instantané ; ce squelette couvre les transitions).
export function Skeleton() {
  return (
    <main className="screen" aria-busy="true" aria-label="Chargement">
      <div className="skeleton skeleton-header" />
      <div className="skeleton skeleton-chips" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-choice" />
      <div className="skeleton skeleton-choice" />
    </main>
  )
}
