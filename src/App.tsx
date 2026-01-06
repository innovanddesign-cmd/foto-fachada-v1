import { useCallback, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChevronRight, Sparkles, ArrowLeft, Plus } from 'lucide-react';
import { useAppStore } from './store/appStore';
import { ToastProvider, useToast } from './components/ui/Toast';
import { AuthModal } from './components/AuthModal';
import { supabase } from './lib/supabase';
import { Button } from './components/ui/Button';
import { Header } from './components/layout/Header';
import { PageContainer } from './components/layout/PageContainer';
import { DashboardV3 } from './components/features/DashboardV3';
import { PricingPageV3 } from './components/features/PricingPageV3';
import { ProjectViewV3 } from './components/features/ProjectViewV3';
import { PublicLayout } from './components/layout/PublicLayout';
import { HomePageV3 } from './components/features/HomePageV3';
import { StepIndicator } from './components/StepIndicator';
import { ImageUploader } from './components/ImageUploader';
import { BrandAnalysis } from './components/BrandAnalysis';
import { StrategyViewV3 } from './components/StrategyViewV3';
import { LinkEditorV3 } from './components/LinkEditorV3';
import { LandingPreviewV3 } from './components/LandingPreviewV3';
import { PosterGeneratorV3 } from './components/PosterGeneratorV3';
import { CreateProjectModal } from './components/CreateProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { AccountSettings } from './components/features/AccountSettings';
import { HelpCenter } from './components/features/HelpCenter';
import { LandingsList } from './components/features/LandingsList';
import { PostersList } from './components/features/PostersList';
import { SupportCenter } from './components/features/support/SupportCenter';
import { CookieBanner } from './components/legal/CookieBanner';
import { analyzeBusinessMedia, getMockBrandData } from './services/visionAI';
import { generateMarketingStrategies, generateLandingLinks, getMockStrategies, getMockLinks } from './services/marketingAgent';
import type { Project, LandingConfig, UserTier } from './types';
import { PublicLandingPage } from './components/pages/PublicLandingPage';

type AppView = 'home' | 'dashboard' | 'project' | 'create-landing' | 'pricing' | 'campaigns' | 'landings' | 'strategies' | 'posters' | 'settings' | 'help';

function AppContent() {
  const {
    currentStep,
    setCurrentStep,
    uploadedMedia,
    brandData,
    setBrandData,
    isAnalyzing,
    setIsAnalyzing,
    strategies,
    setStrategies,
    isGeneratingStrategies,
    setIsGeneratingStrategies,
    links,
    setLinks,
    isGeneratingLinks,
    setIsGeneratingLinks,
    resetFlow,
    currentProject,
    setCurrentProject,
    landingConfig,
    setLandingConfig,
    setIsGeneratingDesign,
    addLandingToProject,
  } = useAppStore();

  const { addToast } = useToast();
  const [appView, setAppView] = useState<AppView>('home');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const { setUser, fetchProjects } = useAppStore();

  // Auth Listener
  useState(() => {
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
  });

  const hasApiKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

  // Navigation handlers
  const handleNavigate = useCallback((view: string) => {
    setAppView(view as AppView);
    if (view === 'dashboard') {
      setCurrentProject(null);
      resetFlow();
    }
  }, [setCurrentProject, resetFlow]);

  const handleOpenProject = useCallback((project: Project) => {
    setCurrentProject(project);
    setAppView('project');
  }, [setCurrentProject]);

  const handleCreateLanding = useCallback(() => {
    resetFlow();
    setAppView('create-landing');
  }, [resetFlow]);

  const handleShowPricing = useCallback(() => {
    setAppView('pricing');
  }, []);

  const handleSaveLanding = useCallback(() => {
    if (!brandData || !currentProject) return;

    const newLanding: LandingConfig = {
      id: `landing-${Date.now()}`,
      name: brandData.name,
      brand: brandData,
      links: links,
      config: landingConfig, // AI-generated configuration
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addLandingToProject(currentProject.id, newLanding);
    addToast('Landing guardada correctamente', 'success');
    setAppView('project');
    resetFlow();
  }, [brandData, currentProject, links, landingConfig, addLandingToProject, resetFlow, addToast]);

  // Step handlers
  const handleAnalyze = useCallback(async () => {
    if (uploadedMedia.length === 0) return;

    setCurrentStep('analysis');
    setIsAnalyzing(true);

    try {
      if (hasApiKey) {
        // Collect URLs and convert to Base64
        const mediaUrls = uploadedMedia.map(m => m.url);

        // Convert blob URLs to actual Base64 strings for Gemini API
        const { blobToBase64 } = await import('./services/imageUtils');
        const base64Images = await Promise.all(
          mediaUrls.map(url => blobToBase64(url))
        );

        // Analyze all media
        const result = await analyzeBusinessMedia(base64Images);
        if (result.success && result.data) {
          setBrandData(result.data);
          addToast('Análisis de negocio completado', 'success');
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setBrandData(getMockBrandData());
        addToast('Análisis completado (demo)', 'info');
      }
    } catch (error) {
      addToast('Error en el análisis', 'error');
    }

    setIsAnalyzing(false);
  }, [uploadedMedia, hasApiKey, setCurrentStep, setIsAnalyzing, setBrandData, addToast]);

  const handleGenerateStrategies = useCallback(async () => {
    if (!brandData) return;

    setCurrentStep('strategy');
    setIsGeneratingStrategies(true);

    try {
      if (hasApiKey) {
        console.log('App: Calling generateMarketingStrategies...');
        const result = await generateMarketingStrategies(brandData);
        console.log('App: Result from generateMarketingStrategies:', result);

        if (result.success && result.strategies) {
          console.log('App: Setting strategies:', result.strategies);
          setStrategies(result.strategies);
        } else {
          console.error('App: Strategy generation failed or no strategies returned', result);
          addToast(`Error: ${result.error || 'No strategies returned'}`, 'error');
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2500));
        setStrategies(getMockStrategies());
      }
      addToast('Estrategias generadas', 'success');
    } catch (error) {
      console.error('App: Critical error in handleGenerateStrategies:', error);
      addToast('Error generando estrategias', 'error');
    }

    setIsGeneratingStrategies(false);
  }, [brandData, hasApiKey, setCurrentStep, setIsGeneratingStrategies, setStrategies, addToast]);

  const handleGenerateLinks = useCallback(async () => {
    if (!brandData || strategies.length === 0) return;

    setCurrentStep('links');
    setIsGeneratingLinks(true);

    try {
      if (hasApiKey) {
        const result = await generateLandingLinks(brandData, strategies);
        if (result.success && result.links) {
          setLinks(result.links);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLinks(getMockLinks());
      }
    } catch (error) {
      addToast('Error generando enlaces', 'error');
    }

    setIsGeneratingLinks(false);
  }, [brandData, strategies, hasApiKey, setCurrentStep, setIsGeneratingLinks, setLinks, addToast]);

  const handleGenerateLandingDesign = useCallback(async () => {
    if (!brandData || links.length === 0) return;

    setCurrentStep('design');
    setIsGeneratingDesign(true);

    try {
      const { generateLandingPageDesign } = await import('./services/landingPageGenerator');
      const result = await generateLandingPageDesign(brandData, links);

      setLandingConfig(result.config);

      addToast('Diseño personalizado generado', 'success');
    } catch (error) {
      console.error('Error generating design:', error);
      addToast('Error generando diseño', 'error');
    }

    setIsGeneratingDesign(false);
  }, [brandData, links, setCurrentStep, setIsGeneratingDesign, setLandingConfig, addToast]);

  const handleGeneratePoster = useCallback(() => {
    setCurrentStep('poster');
  }, [setCurrentStep]);

  // Step titles
  const stepTitles: Record<string, { title: string; description: string }> = {
    upload: { title: 'Sube una foto', description: 'Captura la esencia del negocio con una foto de la fachada' },
    analysis: { title: 'Análisis de marca', description: 'Extrayendo identidad visual y datos del negocio' },
    strategy: { title: 'Estrategias de marketing', description: 'Propuestas personalizadas basadas en el análisis' },
    links: { title: 'Enlaces de la landing', description: 'Configura los enlaces que aparecerán en tu landing' },
    design: { title: 'Tu landing personalizada', description: 'Generada automáticamente por IA basada en tu marca' },
    poster: { title: 'Cartel con QR', description: 'Genera un cartel imprimible con código QR' },
  };

  // Render action button based on current step
  const renderActionButton = () => {
    const buttonProps = { variant: 'primary' as const, size: 'lg' as const };

    switch (currentStep) {
      case 'upload':
        return uploadedMedia.length > 0 && (
          <Button {...buttonProps} onClick={handleAnalyze} rightIcon={<ChevronRight size={18} />}>
            <Sparkles size={18} />
            Analizar negocio
          </Button>
        );
      case 'analysis':
        return brandData && !isAnalyzing && (
          <Button {...buttonProps} onClick={handleGenerateStrategies} rightIcon={<ChevronRight size={18} />}>
            Generar estrategias
          </Button>
        );
      case 'strategy':
        return strategies.length > 0 && !isGeneratingStrategies && (
          <Button {...buttonProps} onClick={handleGenerateLinks} rightIcon={<ChevronRight size={18} />}>
            Generar enlaces
          </Button>
        );
      case 'links':
        return links.length > 0 && !isGeneratingLinks && (
          <Button {...buttonProps} onClick={handleGenerateLandingDesign} rightIcon={<Sparkles size={18} />}>
            <Sparkles size={18} />
            Generar diseño personalizado
          </Button>
        );
      case 'design':
        return (
          <Button {...buttonProps} onClick={handleGeneratePoster} rightIcon={<ChevronRight size={18} />}>
            Generar cartel QR
          </Button>
        );
      case 'poster':
        return currentProject && (
          <Button {...buttonProps} onClick={handleSaveLanding}>
            <Plus size={18} />
            Guardar en proyecto
          </Button>
        );
      default:
        return null;
    }
  };

  // Render Public Home
  if (appView === 'home') {
    return (
      <PublicLayout
        onLogin={() => handleNavigate('dashboard')}
        onGetStarted={() => handleNavigate('dashboard')}
      >
        <HomePageV3 onGetStarted={() => handleNavigate('dashboard')} />
      </PublicLayout>
    );
  }

  // Render Dashboard
  if (appView === 'dashboard') {
    return (
      <>
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
              setCurrentProject(project);
              handleNavigate('project');
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
      </>
    );
  }

  // Render Landings Tab
  if (appView === 'landings') {
    return (
      <>
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
      </>
    );
  }

  // Render Posters Tab
  if (appView === 'posters') {
    return (
      <>
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
      </>
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

  // Render Create Landing Flow
  if (appView === 'create-landing') {
    const currentStepInfo = stepTitles[currentStep] || { title: '', description: '' };

    return (
      <div className="min-h-screen">
        <Header
          onNavigate={handleNavigate}
          onShowPricing={handleShowPricing}
          currentView="create-landing"
          onLogin={() => setShowAuthModal(true)}
        />

        <div className="container py-6">
          <StepIndicator />
        </div>

        <PageContainer
          title={currentStepInfo.title}
          description={currentStepInfo.description}
          actions={
            <div className="flex gap-3 items-center">
              <Button
                variant="ghost"
                onClick={() => handleNavigate('dashboard')}
                leftIcon={<ArrowLeft size={16} />}
              >
                Cancelar
              </Button>
              {renderActionButton()}
            </div>
          }
        >
          {/* Main Content */}
          <div className="card p-6 mb-6">
            {currentStep === 'upload' && <ImageUploader />}
            {currentStep === 'analysis' && <BrandAnalysis />}
            {currentStep === 'strategy' && <StrategyViewV3 />}
            {currentStep === 'links' && <LinkEditorV3 />}
            {currentStep === 'design' && (
              <div className="flex justify-center">
                <LandingPreviewV3 />
              </div>
            )}
            {currentStep === 'poster' && <PosterGeneratorV3 />}
          </div>

          {/* Demo Warning */}
          {!hasApiKey && (
            <div className="mt-6 p-4 bg-warning-50 border border-warning-200 rounded-xl text-center">
              <p className="text-sm text-warning-600">
                <strong>Modo Demo:</strong> Usando datos de ejemplo.
                Añade <code className="bg-warning-100 px-1 rounded">VITE_GEMINI_API_KEY</code> para usar IA real.
              </p>
            </div>
          )}
        </PageContainer>
      </div>
    );
  }

  // Render Project View
  if (appView === 'project' && currentProject) {
    return (
      <>
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
      </>
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
      <>
        <Header
          onNavigate={handleNavigate}
          currentView="pricing"
          onLogin={() => setShowAuthModal(true)}
        />
        <PageContainer>
          <PricingPageV3 onSelectPlan={handleSelectPlan} />
        </PageContainer>
      </>
    );
  }
  // Render Settings
  if (appView === 'settings') {
    return (
      <>
        <Header
          onNavigate={handleNavigate}
          currentView="settings"
          onLogin={() => setShowAuthModal(true)}
        />
        <PageContainer>
          <AccountSettings />
        </PageContainer>
        <SupportCenter />
      </>
    );
  }

  // Render Help Center
  if (appView === 'help') {
    return (
      <>
        <Header
          onNavigate={handleNavigate}
          currentView="help"
          onLogin={() => setShowAuthModal(true)}
        />
        <PageContainer>
          <HelpCenter />
        </PageContainer>
        <SupportCenter />
      </>
    );
  }

  return null;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/p/:id" element={<PublicLandingPage />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
      <CookieBanner />
    </ToastProvider>
  );
}
