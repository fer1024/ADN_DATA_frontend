import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// 1. Se eliminó la importación de ReactQueryDevtools
import './index.css'
import Router from './router'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      {/* 2. Se eliminó el componente <ReactQueryDevtools /> de aquí */}
    </QueryClientProvider>
  </React.StrictMode>,
)