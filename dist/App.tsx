/**
 * PPU-AQC Platform v8
 * Modern UI with HTML5 Aesthetics - 21 Apps, Pagination, Always-Visible Keyboard
 * 4K Resolution, Comprehensive Testing
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { ModernUIEngine } from '@/lib/modern-ui-engine';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ModernUIEngine | null>(null);
  const animationRef = useRef<number | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Initialize and calibrate
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    // Create engine instance
    engineRef.current = new ModernUIEngine();
    const engine = engineRef.current;
    const dims = engine.getDimensions();
    
    // Set canvas to internal resolution (1024x1024)
    canvas.width = dims.width;
    canvas.height = dims.height;
    
    // Calibrate for screen size
    const updateCalibration = () => {
      const rect = canvas.getBoundingClientRect();
      engine.setCanvasSize(rect.width, rect.height);
    };
    
    updateCalibration();
    window.addEventListener('resize', updateCalibration);
    
    // Get context with high quality settings
    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true,
    });
    if (!ctx) return;
    ctxRef.current = ctx;
    
    // Animation loop
    const loop = () => {
      const imageData = engine.render();
      ctx.putImageData(imageData, 0, 0);
      animationRef.current = requestAnimationFrame(loop);
    };
    
    animationRef.current = requestAnimationFrame(loop);
    
    return () => {
      window.removeEventListener('resize', updateCalibration);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Touch handlers with proper button responsiveness
  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    
    const rect = canvas.getBoundingClientRect();
    const dims = engine.getDimensions();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Scale from displayed canvas size to internal 1024x1024 resolution
    const scaleX = dims.width / rect.width;
    const scaleY = dims.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    engine.handleTouchStart(x, y, 1.0);
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;
    
    const rect = canvas.getBoundingClientRect();
    const dims = engine.getDimensions();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        return;
      }
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    // Scale from displayed canvas size to internal 1024x1024 resolution
    const scaleX = dims.width / rect.width;
    const scaleY = dims.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    engine.handleTouchMove(x, y, 0.8);
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.handleTouchEnd();
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="w-screen h-screen bg-black overflow-hidden touch-none select-none flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain"
        style={{ 
          imageRendering: 'pixelated',
          touchAction: 'none',
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.3)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      />
    </div>
  );
}

export default App;
