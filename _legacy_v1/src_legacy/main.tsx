import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastContainer } from './components/ui/ToastContainer'
import './i18n' // Initialize i18n
import './styles/elite-design-system.css' // Elite Design System
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <ToastContainer />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

