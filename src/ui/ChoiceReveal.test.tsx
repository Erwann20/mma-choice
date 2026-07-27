import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChoiceCard } from './ChoiceCard'
import { ChoiceReveal } from './ChoiceReveal'
import type { Choice } from '../schema'

describe('découverte des effets après le choix (Destiny-like)', () => {
  it("la carte de choix ne prévisualise PAS les effets chiffrés", () => {
    const choice: Choice = {
      label: 'Suivre le protocole',
      hint: 'Discipline',
      effects: [{ target: 'reputation', op: 'add', value: 8 }],
    }
    render(<ChoiceCard choice={choice} onClick={() => {}} />)
    expect(screen.getByText('Suivre le protocole')).toBeInTheDocument()
    // Aucun chiffre d'effet visible avant de choisir.
    expect(screen.queryByText(/Réputation \+8/)).not.toBeInTheDocument()
  })

  it("l'écran de conséquences révèle les deltas après coup", () => {
    render(
      <ChoiceReveal
        changes={[
          { target: 'reputation', value: 8 },
          { target: 'health', value: -5 },
        ]}
      />,
    )
    expect(screen.getByText(/Réputation \+8/)).toBeInTheDocument()
    expect(screen.getByText(/Forme −5/)).toBeInTheDocument()
  })
})
