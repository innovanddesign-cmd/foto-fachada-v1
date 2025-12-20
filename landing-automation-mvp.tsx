import React, { useState } from 'react';
import { Upload, Camera, Sparkles, Target, Layout, QrCode, CheckCircle, Loader } from 'lucide-react';

export default function LandingAutomationMVP() {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [brandAnalysis, setBrandAnalysis] = useState(null);
  const [marketingProposal, setMarketingProposal] = useState(null);
  const [landingPreview, setLandingPreview] = useState(false);
  const [posterPreview, setPosterPreview] = useState(false);

  const steps = [
    { id: 0, name: 'Subir Foto', icon: Camera, status: 'current' },
    { id: 1, name: 'Análisis de Marca', icon: Sparkles, status: 'pending' },
    { id: 2, name: 'Propuesta Marketing', icon: Target, status: 'pending' },
    { id: 3, name: 'Landing Page', icon: Layout, status: 'pending' },
    { id: 4, name: 'Cartel QR', icon: QrCode, status: 'pending' }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeBrand = () => {
    setProcessing(true);
    setCurrentStep(1);
    
    setTimeout(() => {
      const analysis = {
        businessType: 'Bar de Copas',
        niche: 'Zona Universitaria',
        businessName: 'LA MOVIDA',
        logo: '🍺',
        colors: {
          primary: '#FF6B35',
          secondary: '#004E89',
          accent: '#F7B801'
        },
        typography: 'Bold, Moderna, Energética',
        style: 'Urbano, Juvenil, Vibrante',
        targetAudience: 'Estudiantes universitarios 18-25 años'
      };
      
      setBrandAnalysis(analysis);
      setProcessing(false);
    }, 2500);
  };

  const generateMarketingProposal = () => {
    setProcessing(true);
    setCurrentStep(2);
    
    setTimeout(() => {
      const proposal = {
        reasoning: 'Bar en zona universitaria requiere engagement constante y viralidad. Estrategia enfocada en gamificación y fidelización del público joven.',
        features: [
          {
            name: '🎰 Ruleta de la Suerte',
            description: 'Gira cada día para ganar chupito gratis, 2x1 o descuentos',
            engagement: 'Alto',
            conversion: 'Muy Alto',
            priority: 'Crítica'
          },
          {
            name: '🎉 Calendario de Eventos',
            description: 'Fiestas temáticas, DJ sets, torneos de beer pong',
            engagement: 'Medio',
            conversion: 'Alto',
            priority: 'Alta'
          },
          {
            name: '🏆 Top 10 Clientes del Mes',
            description: 'Ranking con premios: ronda gratis, entrada VIP, merchandising',
            engagement: 'Muy Alto',
            conversion: 'Medio',
            priority: 'Alta'
          },
          {
            name: '📸 Muro Social',
            description: 'Sube tu foto de la noche, etiqueta amigos, gana premios',
            engagement: 'Muy Alto',
            conversion: 'Alto',
            priority: 'Media'
          },
          {
            name: '🎵 Playlist de la Semana',
            description: 'Vota las canciones que quieres escuchar, integrado con Spotify',
            engagement: 'Medio',
            conversion: 'Bajo',
            priority: 'Media'
          }
        ],
        recommendedPlan: 'Plan Plus (€180/año)',
        estimatedROI: 'Se estima atraer 30-50 clientes nuevos/mes mediante viralidad'
      };
      
      setMarketingProposal(proposal);
      setProcessing(false);
    }, 3000);
  };

  const generateLanding = () => {
    setProcessing(true);
    setCurrentStep(3);
    setTimeout(() => {
      setLandingPreview(true);
      setProcessing(false);
    }, 2000);
  };

  const generatePoster = () => {
    setProcessing(true);
    setCurrentStep(4);
    setTimeout(() => {
      setPosterPreview(true);
      setProcessing(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Landing Pages Personalizadas
          </h1>
          <p className="text-purple-200">
            Automatización inteligente para negocios locales
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted ? 'bg-green-500' : 
                      isCurrent ? 'bg-purple-500 animate-pulse' : 
                      'bg-slate-700'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${
                      isCompleted || isCurrent ? 'text-white font-semibold' : 'text-slate-400'
                    }`}>
                      {step.name}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-1 w-16 mx-2 transition-all ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-6">
            
            {currentStep === 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Camera className="w-6 h-6" />
                  Subir Foto de Fachada
                </h2>
                
                <div className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center">
                  {!imagePreview ? (
                    <label className="cursor-pointer block w-full h-full" htmlFor="image-upload">
                      <div className="flex flex-col items-center justify-center py-8">
                        <Upload className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                        <p className="text-white mb-2 font-semibold">Toca aquí para subir una imagen</p>
                        <p className="text-sm text-purple-200">JPG, PNG o WEBP</p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg mb-4"
                      />
                      <button
                        onClick={analyzeBrand}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                      >
                        Analizar Negocio
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep >= 1 && brandAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  Análisis de Marca
                </h2>
                
                {processing && currentStep === 1 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <div>
                    {currentStep === 1 && (
                      <button
                        onClick={generateMarketingProposal}
                        className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                      >
                        Generar Propuesta de Marketing
                        <Target className="w-5 h-5" />
                      </button>
                    )}
                    
                    <div className="space-y-4">
                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-sm text-purple-200 mb-1">Tipo de Negocio</p>
                        <p className="text-xl font-bold text-white">{brandAnalysis.businessType}</p>
                        <p className="text-purple-300">{brandAnalysis.niche}</p>
                      </div>
                      
                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-sm text-purple-200 mb-2">Nombre del Negocio</p>
                        <p className="text-2xl font-bold text-white flex items-center gap-2">
                          <span className="text-4xl">{brandAnalysis.logo}</span>
                          {brandAnalysis.businessName}
                        </p>
                      </div>

                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-sm text-purple-200 mb-2">Colores de Marca</p>
                        <div className="flex gap-2">
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-white/20"
                            style={{ backgroundColor: brandAnalysis.colors.primary }}
                          />
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-white/20"
                            style={{ backgroundColor: brandAnalysis.colors.secondary }}
                          />
                          <div 
                            className="w-16 h-16 rounded-lg border-2 border-white/20"
                            style={{ backgroundColor: brandAnalysis.colors.accent }}
                          />
                        </div>
                      </div>

                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-sm text-purple-200 mb-1">Estilo Visual</p>
                        <p className="text-white">{brandAnalysis.style}</p>
                      </div>

                      <div className="bg-black/20 rounded-lg p-4">
                        <p className="text-sm text-purple-200 mb-1">Público Objetivo</p>
                        <p className="text-white">{brandAnalysis.targetAudience}</p>
                      </div>

                      {currentStep === 1 && (
                        <button
                          onClick={generateMarketingProposal}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          Generar Propuesta de Marketing
                          <Target className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep >= 2 && marketingProposal && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-400" />
                  Propuesta de Marketing
                </h2>
                
                {processing && currentStep === 2 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-green-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-sm text-green-200 mb-2">Razonamiento Estratégico</p>
                      <p className="text-white text-sm">{marketingProposal.reasoning}</p>
                    </div>

                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-sm text-green-200 mb-3">Funcionalidades Propuestas</p>
                      <div className="space-y-3">
                        {marketingProposal.features.map((feature, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold text-white">{feature.name}</p>
                              <span className={`text-xs px-2 py-1 rounded ${
                                feature.priority === 'Crítica' ? 'bg-red-500/20 text-red-300' :
                                feature.priority === 'Alta' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {feature.priority}
                              </span>
                            </div>
                            <p className="text-sm text-purple-200 mb-2">{feature.description}</p>
                            <div className="flex gap-3 text-xs">
                              <span className="text-green-300">Engagement: {feature.engagement}</span>
                              <span className="text-blue-300">Conversión: {feature.conversion}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-400/30 rounded-lg p-4">
                      <p className="text-sm text-green-200 mb-1">Plan Recomendado</p>
                      <p className="text-xl font-bold text-white mb-2">{marketingProposal.recommendedPlan}</p>
                      <p className="text-sm text-purple-200">{marketingProposal.estimatedROI}</p>
                    </div>

                    {currentStep === 2 && (
                      <button
                        onClick={generateLanding}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                      >
                        Generar Landing Page
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            
            {currentStep >= 3 && landingPreview && brandAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Layout className="w-6 h-6 text-blue-400" />
                  Vista Previa Landing Page
                </h2>
                
                {processing && currentStep === 3 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-blue-400 animate-spin" />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                    <div 
                      className="p-8 text-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${brandAnalysis.colors.primary}, ${brandAnalysis.colors.secondary})`
                      }}
                    >
                      <div className="text-6xl mb-4">{brandAnalysis.logo}</div>
                      <h1 className="text-4xl font-bold text-white mb-2">
                        {brandAnalysis.businessName}
                      </h1>
                      <p className="text-white/80">{brandAnalysis.businessType}</p>
                    </div>
                    
                    <div className="p-6 bg-white space-y-4">
                      {marketingProposal.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
                          <p className="font-semibold text-gray-800">{feature.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                        </div>
                      ))}
                      
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <button 
                          className="py-3 rounded-lg font-semibold text-white transition-all"
                          style={{ backgroundColor: brandAnalysis.colors.primary }}
                        >
                          📍 Ubicación
                        </button>
                        <button 
                          className="py-3 rounded-lg font-semibold text-white transition-all"
                          style={{ backgroundColor: brandAnalysis.colors.secondary }}
                        >
                          📱 Contacto
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && !processing && (
                  <button
                    onClick={generatePoster}
                    className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Generar Cartel con QR
                  </button>
                )}
              </div>
            )}

            {currentStep >= 4 && posterPreview && brandAnalysis && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-purple-400" />
                  Cartel A4 con QR
                </h2>
                
                {processing && currentStep === 4 ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-12 h-12 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-8 shadow-2xl">
                    <div 
                      className="text-center p-8 rounded-lg mb-6"
                      style={{ 
                        background: `linear-gradient(135deg, ${brandAnalysis.colors.primary}, ${brandAnalysis.colors.secondary})`
                      }}
                    >
                      <div className="text-6xl mb-3">{brandAnalysis.logo}</div>
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {brandAnalysis.businessName}
                      </h2>
                      <p className="text-white/90 text-lg">¡Descubre nuestras promociones!</p>
                    </div>

                    <div className="text-center">
                      <div className="bg-white p-4 inline-block rounded-lg shadow-lg mb-4">
                        <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-600 rounded-lg flex items-center justify-center">
                          <QrCode className="w-32 h-32 text-white" />
                        </div>
                      </div>
                      <p className="text-gray-800 font-semibold text-lg mb-1">
                        Escanea y gana
                      </p>
                      <p className="text-gray-600 text-sm">
                        Accede a promociones exclusivas
                      </p>
                    </div>

                    <div 
                      className="mt-6 p-4 rounded-lg text-center"
                      style={{ backgroundColor: `${brandAnalysis.colors.accent}20` }}
                    >
                      <p className="text-sm font-semibold" style={{ color: brandAnalysis.colors.accent }}>
                        🎰 Gira la ruleta diaria • 🎉 Eventos especiales • 🏆 Premios exclusivos
                      </p>
                    </div>
                  </div>
                )}

                {!processing && (
                  <div className="mt-6 bg-green-500/20 border border-green-400 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white font-semibold mb-1">¡Automatización Completada!</p>
                        <p className="text-sm text-green-200">
                          Landing page generada y cartel listo para imprimir. 
                          Tiempo total: ~8 segundos.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {currentStep === 0 && (
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 text-center">
            <p className="text-purple-200 mb-2">
              💡 <strong>Cómo funciona:</strong>
            </p>
            <p className="text-sm text-purple-300">
              Sube una foto de la fachada del negocio y la IA analizará automáticamente la marca, 
              propondrá funcionalidades de marketing personalizadas, generará una landing page 
              y creará un cartel con QR listo para imprimir. Todo en menos de 10 segundos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}