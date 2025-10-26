/**
 * Font Loading Manager
 * Handles font loading with fallbacks and error detection
 */

(function() {
  'use strict';

  // Font loading configuration
  const FONTS_CONFIG = {
    'Inter': [
      { weight: '400', url: '/fonts/inter/Inter-Regular.woff2' },
      { weight: '500', url: '/fonts/inter/Inter-Medium.woff2' },
      { weight: '600', url: '/fonts/inter/Inter-SemiBold.woff2' },
      { weight: '700', url: '/fonts/inter/Inter-Bold.woff2' }
    ],
    'JetBrains Mono': [
      { weight: '400', url: '/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2' },
      { weight: '500', url: '/fonts/jetbrains-mono/JetBrainsMono-Medium.woff2' },
      { weight: '700', url: '/fonts/jetbrains-mono/JetBrainsMono-Bold.woff2' }
    ]
  };

  // Font loading timeout (3 seconds)
  const FONT_TIMEOUT = 3000;

  // Font loading state
  let fontsLoaded = false;
  let fontLoadingErrors = [];

  // Initialize font loading
  function initFontLoading() {
    console.log('🔤 Initializing font loading...');
    
    // Add loading class
    document.documentElement.classList.add('font-loading');
    
    // Check if Font Loading API is supported
    if ('fonts' in document) {
      loadFontsWithAPI();
    } else {
      // Fallback for older browsers
      loadFontsWithFallback();
    }
  }

  // Load fonts using Font Loading API
  function loadFontsWithAPI() {
    const fontPromises = [];
    
    Object.entries(FONTS_CONFIG).forEach(([family, variants]) => {
      variants.forEach(variant => {
        const fontFace = new FontFace(family, `url(${variant.url})`, {
          weight: variant.weight,
          display: 'swap'
        });
        
        // Add font to document
        document.fonts.add(fontFace);
        
        // Load font
        const promise = fontFace.load().catch(error => {
          console.warn(`Failed to load font: ${family} ${variant.weight}`, error);
          fontLoadingErrors.push({ family, weight: variant.weight, error });
          return null;
        });
        
        fontPromises.push(promise);
      });
    });
    
    // Wait for all fonts to load or timeout
    Promise.allSettled(fontPromises).then(results => {
      const successfulLoads = results.filter(result => 
        result.status === 'fulfilled' && result.value !== null
      ).length;
      
      console.log(`🔤 Fonts loaded: ${successfulLoads}/${fontPromises.length}`);
      
      if (fontLoadingErrors.length > 0) {
        console.warn('🔤 Font loading errors:', fontLoadingErrors);
        handleFontLoadingErrors();
      }
      
      onFontsLoaded();
    });
    
    // Timeout fallback
    setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('🔤 Font loading timeout, using fallbacks');
        handleFontLoadingErrors();
        onFontsLoaded();
      }
    }, FONT_TIMEOUT);
  }

  // Fallback font loading for older browsers
  function loadFontsWithFallback() {
    console.log('🔤 Using fallback font loading method');
    
    // Create test elements to detect font loading
    const testElements = [];
    
    Object.keys(FONTS_CONFIG).forEach(family => {
      const testElement = document.createElement('div');
      testElement.style.fontFamily = `"${family}", monospace`;
      testElement.style.fontSize = '100px';
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.top = '-9999px';
      testElement.style.visibility = 'hidden';
      testElement.textContent = 'BESbswy';
      
      document.body.appendChild(testElement);
      testElements.push({ element: testElement, family });
    });
    
    // Check if fonts have loaded by measuring text width
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds with 100ms intervals
    
    const checkFonts = () => {
      attempts++;
      let allLoaded = true;
      
      testElements.forEach(({ element, family }) => {
        const currentWidth = element.offsetWidth;
        // If width changed from initial monospace width, font is loaded
        if (currentWidth === 0) {
          allLoaded = false;
        }
      });
      
      if (allLoaded || attempts >= maxAttempts) {
        // Clean up test elements
        testElements.forEach(({ element }) => {
          document.body.removeChild(element);
        });
        
        if (attempts >= maxAttempts) {
          console.warn('🔤 Font loading timeout with fallback method');
          handleFontLoadingErrors();
        }
        
        onFontsLoaded();
      } else {
        setTimeout(checkFonts, 100);
      }
    };
    
    // Start checking after a short delay
    setTimeout(checkFonts, 100);
  }

  // Handle font loading errors
  function handleFontLoadingErrors() {
    document.documentElement.classList.add('font-loading-error');
    
    // Update CSS variables to use system fonts
    const root = document.documentElement;
    root.style.setProperty('--font-family-sans', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif');
    root.style.setProperty('--font-family-mono', '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace');
    
    console.log('🔤 Applied system font fallbacks');
  }

  // Called when fonts are loaded (or failed)
  function onFontsLoaded() {
    if (fontsLoaded) return;
    
    fontsLoaded = true;
    
    // Remove loading class and add loaded class
    document.documentElement.classList.remove('font-loading');
    document.documentElement.classList.add('fonts-loaded');
    
    // Dispatch custom event
    const event = new CustomEvent('fontsloaded', {
      detail: {
        errors: fontLoadingErrors,
        hasErrors: fontLoadingErrors.length > 0
      }
    });
    document.dispatchEvent(event);
    
    console.log('🔤 Font loading complete');
  }

  // Check if fonts are already cached
  function checkCachedFonts() {
    if ('fonts' in document) {
      // Check if fonts are already loaded
      const fontChecks = Object.keys(FONTS_CONFIG).map(family => {
        return document.fonts.check(`16px "${family}"`);
      });
      
      if (fontChecks.every(check => check)) {
        console.log('🔤 Fonts already cached');
        onFontsLoaded();
        return true;
      }
    }
    return false;
  }

  // Preload critical fonts
  function preloadFonts() {
    // Preload the most important font variants
    const criticalFonts = [
      '/fonts/inter/Inter-Regular.woff2',
      '/fonts/inter/Inter-SemiBold.woff2',
      '/fonts/jetbrains-mono/JetBrainsMono-Regular.woff2'
    ];
    
    criticalFonts.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = url;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
    
    console.log('🔤 Critical fonts preloaded');
  }

  // Initialize when DOM is ready
  function init() {
    // Preload critical fonts
    preloadFonts();
    
    // Check if fonts are already cached
    if (!checkCachedFonts()) {
      // Start font loading
      initFontLoading();
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for debugging
  window.FontLoader = {
    reload: initFontLoading,
    status: () => ({
      loaded: fontsLoaded,
      errors: fontLoadingErrors
    }),
    forceSystemFonts: handleFontLoadingErrors
  };

})();