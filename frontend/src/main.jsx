import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { get, set, del } from 'idb-keyval'
import './index.css'
import App from './App.jsx'

function createIDBPersister(idbValidKey = "reactQuery") {
  return {
    persistClient: async (client) => {
      await set(idbValidKey, client)
    },
    restoreClient: async () => {
      return await get(idbValidKey)
    },
    removeClient: async () => {
      await del(idbValidKey)
    },
  }
}

const persister = createIDBPersister()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 1,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
    }
  },
})

const persistOptions = {
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateMutation: (mutation) => {
      // Dehydrate all paused mutations
      return mutation.state.isPaused
    },
    shouldDehydrateQuery: (query) => {
      const defaultShouldDehydrateQuery = (query) => {
        if (query.state.status === 'success') {
          return true
        }
        return false
      }
      return defaultShouldDehydrateQuery(query)
    },
  },
}

import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from './components/ErrorFallback'

import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App is ready for offline work.')
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.replace('/')}>
      <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
        <App />
      </PersistQueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
