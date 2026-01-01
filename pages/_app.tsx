import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'next-themes'
import '@/styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: '16px',
            padding: '16px 24px',
            boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)',
          },
          success: {
            iconTheme: {
              primary: 'var(--prime)',
              secondary: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  )
}
