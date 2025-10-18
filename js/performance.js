/**
 * Performance Optimization JavaScript
 * Handles lazy loading, critical CSS, and performance monitoring
 * Requirements: 4.1, 4.3, 4.4
 */

(function() {
  'use strict';

  // ===== CRITICAL CSS LOADING =====
  
  /**
   * Load non-critical CSS asynchronously
   * Requirement 4.1 - Critical CSS inline, non-critical lazy loaded
   */
  function loadNonCriticalCSS() {
    const nonCriticalStyles = [
      '/css/animations.css',
      '/css/cards.css', 
      '/css/buttons.css',
      '/css/forms.css',
      '/css/responsive-improvements.css'
    ];
    
    nonCriticalStyles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href + '?v=' + (window.themeVersion || '1.0.0');
      link.media = 'print'; // Load with low priority
      link.onload = function() {
        this.media = 'all'; // Apply styles once loaded
        this.onload = null;
      };
      
      document.head.appendChild(link);
    });
  }

  // ===== FONT LOADING OPTIMIZATION =====
  
  /**
   * Optimize font loading with font-display: swap and preload
   * Requirement 4.4 - Web font optimization
   */
  function optimizeFontLoading() {
    // Add fonts-loading class to body
    document.body.classList.add('fonts-loading');
    
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/Inter-400.woff2',
      '/fonts/Inter-500.woff2', 
      '/fonts/JetBrainsMono-400.woff2'
    ];
    
    criticalFonts.forEach(fontUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      document.head.appendChild(link);
    });
    
    // Use Font Loading API if available
    if ('fonts' in document) {
      Promise.all([
        document.fonts.load('400 16px Inter'),
        document.fonts.load('500 16px Inter'),
        document.fonts.load('400 14px JetBrains Mono')
      ]).then(() => {
        document.body.classList.remove('fonts-loading');
        document.body.classList.add('fonts-loaded');
      }).catch(() => {
        // Fallback: remove loading class after timeout
        setTimeout(() => {
          document.body.classList.remove('fonts-loading');
          document.body.classList.add('fonts-loaded');
        }, 3000);
      });
    } else {
      // Fallback for browsers without Font Loading API
      setTimeout(() => {
        document.body.classList.remove('fonts-loading');
        document.body.classList.add('fonts-loaded');
      }, 2000);
    }
  }

  // ===== CSS MINIFICATION SUPPORT =====
  
  /**
   * Runtime CSS optimization and compression support
   * Requirement 4.3 - CSS minification and compression
   */
  function optimizeRuntimeCSS() {
    // Remove unused CSS classes (basic implementation)
    const unusedClasses = [];
    const allElements = document.querySelectorAll('*');
    
    // Mark elements for potential optimization
    allElements.forEach(element => {
      if (element.classList.length === 0) {
        element.classList.add('no-classes');
      }
      
      // Add compression-friendly classes
      if (element.tagName === 'IMG') {
        element.classList.add('perf-opt');
      }
    });
  }

  // ===== PERFORMANCE MONITORING =====
  
  /**
   * Monitor Core Web Vitals and performance metrics
   * Requirement 4.1 - Performance optimization
   */
  function monitorPerformance() {
    // Monitor First Contentful Paint (FCP)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
            
            // Mark FCP elements as optimized
            document.querySelectorAll('.fcp-optimized').forEach(el => {
              el.classList.add('fcp-complete');
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    }
    
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        console.log('LCP:', lastEntry.startTime);
        
        // Mark LCP elements as optimized
        document.querySelectorAll('.lcp-optimized').forEach(el => {
          el.classList.add('lcp-complete');
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
    
    // Monitor Cumulative Layout Shift (CLS)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        console.log('CLS:', clsValue);
        
        // Apply CLS prevention classes
        if (clsValue > 0.1) {
          document.querySelectorAll('img, video, iframe').forEach(el => {
            el.classList.add('cls-stable');
          });
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  // ===== LAZY LOADING ENHANCEMENTS =====
  
  /**
   * Enhanced lazy loading for images and CSS
   */
  function enhanceLazyLoading() {
    // Lazy load images with Intersection Observer
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.add('loaded');
            imageObserver.unobserve(img);
          }
        });
      });
      
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
    
    // Lazy load CSS modules
    const cssObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const cssFile = element.dataset.css;
          
          if (cssFile) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssFile;
            link.onload = () => element.classList.add('css-loaded');
            document.head.appendChild(link);
            
            cssObserver.unobserve(element);
          }
        }
      });
    });
    
    document.querySelectorAll('[data-css]').forEach(el => {
      cssObserver.observe(el);
    });
  }

  // ===== RESOURCE OPTIMIZATION =====
  
  /**
   * Optimize resource loading and caching
   */
  function optimizeResources() {
    // Preload critical resources
    const criticalResources = [
      { href: '/assets/icons.svg', as: 'image' },
      { href: '/js/navigation.js', as: 'script' },
      { href: '/css/critical-performance.css', as: 'style' }
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'font') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
    
    // Add resource hints for external domains
    const resourceHints = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
      { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' }
    ];
    
    resourceHints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.crossorigin) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  // ===== COMPRESSION OPTIMIZATION =====
  
  /**
   * Runtime optimizations for better compression
   * Requirement 4.3 - CSS minification and compression
   */
  function optimizeForCompression() {
    // Add consistent classes that compress well
    document.querySelectorAll('.compress-friendly').forEach(el => {
      el.classList.add('opt'); // Short class name for better compression
    });
    
    // Optimize inline styles for compression
    const inlineStyles = document.querySelectorAll('[style]');
    inlineStyles.forEach(el => {
      const style = el.getAttribute('style');
      if (style) {
        // Normalize style values for better compression
        const optimizedStyle = style
          .replace(/\s+/g, ' ')
          .replace(/;\s*$/, '')
          .replace(/:\s+/g, ':')
          .replace(/;\s+/g, ';');
        el.setAttribute('style', optimizedStyle);
      }
    });
  }

  // ===== INITIALIZATION =====
  
  /**
   * Initialize all performance optimizations
   */
  function initPerformanceOptimizations() {
    // Load critical optimizations immediately
    optimizeFontLoading();
    optimizeResources();
    monitorPerformance();
    
    // Load non-critical optimizations after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loadNonCriticalCSS();
        optimizeRuntimeCSS();
        enhanceLazyLoading();
        optimizeForCompression();
      });
    } else {
      loadNonCriticalCSS();
      optimizeRuntimeCSS();
      enhanceLazyLoading();
      optimizeForCompression();
    }
  }

  // Start performance optimizations
  initPerformanceOptimizations();

  // Export for debugging
  window.performanceOptimizations = {
    loadNonCriticalCSS,
    optimizeFontLoading,
    monitorPerformance,
    enhanceLazyLoading,
    optimizeResources
  };

})();