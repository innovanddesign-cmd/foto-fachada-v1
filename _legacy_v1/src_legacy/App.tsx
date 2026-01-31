import { useCallback, useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useAppStore } from './store/appStore';
import { ToastProvider, useToast } from './components/ui/Toast';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';
import { Button } from './components/ui/Button';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import { PublicLayout } from './components/layout/PublicLayout';
// Removed HomePageV3 import as it's replaced by PublicHome
import { CreateProjectModal } from './components/CreateProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { SupportCenter } from './components/features/support/SupportCenter';
import { CookieBanner } from './components/legal/CookieBanner';
import type { Project, UserTier } from './types';
import { PublicLandingPage } from './components/pages/PublicLandingPage';
import { WidgetPageViewer } from './components/pages/WidgetPageViewer';
import { MobileTabBar } from './components/layout/MobileTabBar';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { OnboardingCarousel } from './components/features/OnboardingCarousel';
import { Loader2 } from 'lucide-react';

// Public Pages
import { PublicHome } from './components/public/PublicHome';
import { PublicExamples } from './components/public/PublicExamples';
import { PublicSolutions } from './components/public/PublicSolutions';
import { PublicPricing } from './components/public/PublicPricing';
import { PublicHelp } from './components/public/PublicHelp';

// Lazy Imports for heavy components
const DashboardV3 = lazy(() => import('./components/features/DashboardV3').then(module => ({ default: module.DashboardV3 })));
const PricingPageV3 = lazy(() => import('./components/features/PricingPageV3').then(module => ({ default: module.PricingPageV3 })));
const ProjectViewV3 = lazy(() => import('./components/features/ProjectViewV3').then(module => ({ default: module.ProjectViewV3 })));
const AccountSettings = lazy(() => import('./components/features/AccountSettings').then(module => ({ default: module.AccountSettings })));
const HelpCenter = lazy(() => import('./components/features/HelpCenter').then(module => ({ default: module.HelpCenter })));
const LandingsList = lazy(() => import('./components/features/LandingsList').then(module => ({ default: module.LandingsList })));
const PostersList = lazy(() => import('./components/features/PostersList').then(module => ({ default: module.PostersList })));
const EscaparateEngine = lazy(() => import('./components/EscaparateEngine').then(module => ({ default: module.EscaparateEngine })));

type AppView = 'home' | 'dashboard' | 'project' | 'create-landing' | 'escaparate' | 'pricing' | 'campaigns' | 'landings' | 'strategies' | 'posters' | 'settings' | 'help';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-gray-500 font-medium">Cargando...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const {
    currentView,
    setCurrentView,
    resetFlow,
    currentProject,
    setCurrentProject,
    setUser,
    fetchProjects
  } = useAppStore();

  const { addToast } = useToast();
  // Sincronizar estado local con global para la vista, aunque idealmente usaríamos solo el global
  const [appView, setAppView] = useState<AppView>(currentView as AppView);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Sincronizar URL con estado actual
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      if (currentView === 'home' || currentView === 'public') {
        setCurrentView('dashboard');
      }
    }
  }, [location.pathname, currentView, setCurrentView]);

  // Sincronizar cambios del store a local (temporal hasta refactor total)
  useEffect(() => {
    setAppView(currentView as AppView);
  }, [currentView]);

  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check Onboarding Status
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('foto_fachada_onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('foto_fachada_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  // Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      if (session?.user) fetchProjects();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email } : null);
      if (session?.user) fetchProjects();
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchProjects]);

  // Recuperar sesión de escaparate si existe
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('escaparate-session');
      if (stored) {
        const parsed = JSON.parse(stored);
        const step = parsed?.state?.currentState?.step;
        // Si hay una sesión activa (no está en UPLOAD inicial)
        if (step && step !== 'UPLOAD') {
          console.log('[App] Recuperando sesión de escaparate:', step);
          setCurrentView('escaparate');
        }
      }
    } catch (e) {
      // Ignorar errores de parsing
    }
  }, [setCurrentView]);

  // Navigation handlers
  const handleNavigate = useCallback((view: string) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      setCurrentProject(null);
      resetFlow();
    }
  }, [setCurrentView, setCurrentProject, resetFlow]);

  const handleOpenProject = useCallback((project: Project) => {
    setCurrentProject(project);
    setCurrentView('project');
  }, [setCurrentProject, setCurrentView]);

  const handleCreateLanding = useCallback(() => {
    resetFlow();
    // Usar el nuevo motor de escaparates
    setCurrentView('escaparate');
  }, [resetFlow, setCurrentView]);

  const handleShowPricing = useCallback(() => {
    setCurrentView('pricing');
  }, [setCurrentView]);

  // Handle Auth Modal from outside
  useEffect(() => {
    const handleOpenAuth = () => setShowAuthModal(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  // Render Dashboard
  if (appView === 'dashboard') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Header
          onNavigate={handleNavigate}
          currentView="dashboard"
          onLogin={() => setShowAuthModal(true)}
          onShowPricing={handleShowPricing}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
        <PageContainer>
          <DashboardV3
            onCreateNew={() => {
              setShowCreateModal(true);
            }}
            onOpenProject={(project) => {
              handleOpenProject(project);
            }}
          />
        </PageContainer>
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreated={(project) => {
            handleOpenProject(project);
            handleCreateLanding();
            addToast('Proyecto creado', 'success');
          }}
        />
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
        <MobileTabBar
          currentView={appView}
          onNavigate={handleNavigate}
        />
        {showOnboarding && <OnboardingCarousel onComplete={handleOnboardingComplete} />}
      </Suspense>
    );
  }

  // Render Landings Tab
  if (appView === 'landings') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Header
          onNavigate={handleNavigate}
          currentView="landings"
          onLogin={() => setShowAuthModal(true)}
          onShowPricing={handleShowPricing}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
        <PageContainer>
          <LandingsList onCreateNew={handleCreateLanding} />
        </PageContainer>
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </Suspense>
    );
  }

  // Render Posters Tab
  if (appView === 'posters') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Header
          onNavigate={handleNavigate}
          currentView="posters"
          onLogin={() => setShowAuthModal(true)}
          onShowPricing={handleShowPricing}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
        <PageContainer>
          <PostersList onGenerate={handleCreateLanding} />
        </PageContainer>
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </Suspense>
    );
  }

  // Placeholder for remaining tabs (Campaigns/Strategies)
  if (['campaigns', 'strategies'].includes(appView)) {
    return (
      <>
        <Header
          onNavigate={handleNavigate}
          currentView={appView}
          onLogin={() => setShowAuthModal(true)}
          onShowPricing={handleShowPricing}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
        <PageContainer>
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4 capitalize">{appView}</h2>
            <p className="text-secondary text-lg">Esta sección estará disponible próximamente.</p>
            <div className="mt-8">
              <Button variant="primary" onClick={() => handleNavigate('dashboard')}>
                Volver al Dashboard
              </Button>
            </div>
          </div>
        </PageContainer>
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      </>
    );
  }

  // Render Create Landing Flow (MOTOR DE ESCAPARATES - NUEVO)
  if (appView === 'escaparate' || appView === 'create-landing') {
    return (
      <div className="min-h-screen has-tab-bar">
        <Suspense fallback={<LoadingScreen />}>
          <Header
            onNavigate={handleNavigate}
            onShowPricing={handleShowPricing}
            currentView="escaparate"
            onLogin={() => setShowAuthModal(true)}
          />
          <EscaparateEngine />
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
          <MobileTabBar
            currentView={appView}
            onNavigate={handleNavigate}
          />
        </Suspense>
      </div>
    );
  }

  // Render Project View
  if (appView === 'project' && currentProject) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Header
          onNavigate={handleNavigate}
          currentView="project"
          onLogin={() => setShowAuthModal(true)}
        />
        <PageContainer>
          <ProjectViewV3
            project={currentProject}
            onBack={() => handleNavigate('dashboard')}
            onCreateLanding={handleCreateLanding}
          />
        </PageContainer>
      </Suspense>
    );
  }

  // Render Pricing
  if (appView === 'pricing') {
    const handleSelectPlan = async (tier: UserTier) => {
      if (tier === 'free') return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Trigger login if not authenticated
          const event = new CustomEvent('open-auth-modal');
          window.dispatchEvent(event);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/billing/create-checkout-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`
          },
          body: JSON.stringify({
            planId: tier,
            userId: session.user.id,
            email: session.user.email,
            successUrl: `${window.location.origin}/dashboard?payment=success`,
            cancelUrl: `${window.location.origin}/pricing?payment=cancelled`
          })
        });

        const data = await response.json();

        if (data.success && data.url) {
          window.location.href = data.url;
        } else {
          addToast('Error al iniciar el pago: ' + (data.error || 'Desconocido'), 'error');
        }
      } catch (error) {
        console.error('Payment Error:', error);
        addToast('Error de conexión con el servidor de pagos', 'error');
      }
    };

    return (
      <Suspense fallback={<LoadingScreen />}>
        <Header
          onNavigate={handleNavigate}
          currentView="pricing"
          onLogin={() => setShowAuthModal(true)}
        />
        <PageContainer>
          <PricingPageV3 onSelectPlan={handleSelectPlan} />
        </PageContainer>
      </Suspense>
    );
  }
  // Render Settings
  if (appView === 'settings') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Header
          onNavigate={handleNavigate}
          currentView="settings"
          onLogin={() => setShowAuthModal(true)}
        />
        <PageContainer>
          <AccountSettings />
        </PageContainer>
        <SupportCenter />
      </Suspense>
    );
  }

  // Render Help Center
  if (appView === 'help') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Header
          onNavigate={handleNavigate}
          currentView="help"
          onLogin={() => setShowAuthModal(true)}
        />
        <PageContainer>
          <HelpCenter />
        </PageContainer>
        <SupportCenter />
      </Suspense>
    );
  }

  return null;
}

export default function App() {
  const handleLogin = () => {
    // Navigate to dashboard which triggers auth modal if not logged in
    window.location.href = '/dashboard';
  };

  const handleGetStarted = () => {
    window.location.href = '/dashboard';
  };

  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<PublicLayout onLogin={handleLogin} onGetStarted={handleGetStarted}><PublicHome onGetStarted={handleGetStarted} onViewDemo={() => window.location.href = '/p/demo'} /></PublicLayout>} />
        <Route path="/ejemplos" element={<PublicLayout onLogin={handleLogin} onGetStarted={handleGetStarted}><PublicExamples /></PublicLayout>} />
        <Route path="/como-funciona" element={<PublicLayout onLogin={handleLogin} onGetStarted={handleGetStarted}><PublicSolutions /></PublicLayout>} />
        <Route path="/precios" element={<PublicLayout onLogin={handleLogin} onGetStarted={handleGetStarted}><PublicPricing /></PublicLayout>} />
        <Route path="/ayuda" element={<PublicLayout onLogin={handleLogin} onGetStarted={handleGetStarted}><PublicHelp /></PublicLayout>} />

        <Route path="/dashboard" element={<AppContent />} />
        <Route path="/p/:id" element={<PublicLandingPage />} />
        <Route path="/widget/:slug" element={<WidgetPageViewer />} />
        <Route path="/*" element={<AppContent />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieBanner />
    </ToastProvider>
  );
}
