import { createFileRoute } from '@tanstack/react-router'
import { HomeScreen } from '../ui/HomeScreen'

export const Route = createFileRoute('/')({
  component: HomeScreen,
})
