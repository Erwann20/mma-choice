import { createFileRoute } from '@tanstack/react-router'
import { GameRoot } from '../ui/GameRoot'

export const Route = createFileRoute('/')({
  component: GameRoot,
})
