import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { World } from './components/World';
import { DitherEffect } from './components/EffectShader';
import { generatePhilosophy } from './services/geminiService';
import { THEMES } from './constants';
import { AppStatus, SubtitleState } from './types';
import { Play, Pause, RefreshCw, Aperture, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [subtitleData, setSubtitleData] = useState<SubtitleState>({
    text: "Waiting for signal...",
    isLoading: false,
    theme: "",
  });

  // Start the journey on mount
  useEffect(() => {
    setStatus(AppStatus.PLAYING);
    handleGenerate(THEMES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async (theme: string) => {
    setSubtitleData((prev) => ({ ...prev, isLoading: true, theme }));
    
    const text = await generatePhilosophy(theme);
    
    setSubtitleData({
      text,
      isLoading: false,
      theme,
    });
  };

  const togglePause = () => {
    setStatus(prev => prev === AppStatus.PLAYING ? AppStatus.PAUSED : AppStatus.PLAYING);
  };

  return (
    <div className="relative w-full h-full bg-black font-mono">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 0], fov: 75 }} dpr={[1, 2]}>
          <color attach="background" args={['#000000']} />
          <Suspense fallback={null}>
            <World status={status} />
            <EffectComposer disableNormalPass>
              <DitherEffect />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 md:p-12">
        
        {/* Header */}
        <div className="pointer-events-auto flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-white mix-blend-difference" style={{ fontFamily: '"Space Mono", monospace' }}>
              VOYAGER
            </h1>
            <p className="text-xs text-gray-400 mt-2 tracking-widest">
              SIMULATION :: {status === AppStatus.PLAYING ? 'RUNNING' : 'HALTED'}
            </p>
          </div>

          <button 
            onClick={togglePause}
            className="p-3 border border-white/30 rounded-full hover:bg-white/10 hover:border-white transition-all group backdrop-blur-sm"
          >
            {status === AppStatus.PLAYING ? 
              <Pause className="w-6 h-6 text-white" /> : 
              <Play className="w-6 h-6 text-white" />
            }
          </button>
        </div>

        {/* Center - Subtitle Display */}
        <div className="flex-1 flex flex-col justify-end pb-24 md:pb-32 items-center text-center">
          <div className="max-w-3xl w-full">
            {subtitleData.isLoading ? (
               <div className="flex justify-center items-center space-x-2 text-white/50 animate-pulse">
                 <Loader2 className="w-5 h-5 animate-spin" />
                 <span className="text-sm tracking-widest">INTERPRETING NOISE...</span>
               </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <p 
                  className="text-2xl md:text-4xl lg:text-5xl leading-tight text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)]"
                  style={{ fontFamily: '"Cinzel", serif' }}
                >
                  "{subtitleData.text}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Controls */}
        <div className="pointer-events-auto border-t border-white/20 pt-6 backdrop-blur-sm bg-black/20">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-400">
               <Aperture className="w-4 h-4" />
               <span>Dither // ON</span>
            </div>

            {/* Theme Selector */}
            <div className="flex flex-wrap justify-center gap-2">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleGenerate(theme)}
                  disabled={subtitleData.isLoading}
                  className={`
                    px-4 py-2 text-xs uppercase tracking-wider border transition-all duration-300
                    ${subtitleData.theme === theme 
                      ? 'bg-white text-black border-white font-bold' 
                      : 'bg-transparent text-gray-300 border-white/30 hover:border-white hover:text-white'
                    }
                    ${subtitleData.isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {theme.split(' ')[0]}
                </button>
              ))}
            </div>

            <button 
              onClick={() => handleGenerate(subtitleData.theme || THEMES[0])}
              className="hidden md:flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${subtitleData.isLoading ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Scanline overlay effect via CSS */}
      <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] bg-repeat" />
      <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

export default App;