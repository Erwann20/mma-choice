import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { PrimeReactProvider } from '@primereact/core'
import Aura from '@primeuix/themes/aura'
import { routeTree } from './routeTree.gen'
import 'primeicons/primeicons.css'
import './index.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrimeReactProvider theme={{ preset: Aura, options: { darkModeSelector: '.dark' } }}>
      <RouterProvider router={router} />
    </PrimeReactProvider>
  </StrictMode>,
)
