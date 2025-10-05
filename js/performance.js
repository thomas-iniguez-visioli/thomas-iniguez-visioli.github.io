/**
 * Performance Optimizations
 * Lazy loading, asset optimization, and performance monitoring
 */

class PerformanceOptimizer {
  constructor() {
    this.isOnline = navigator.onLine;
    this.connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    this.prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
    
    this.init();
  }
  
  init() {
    this.setupLazyLoading();
    this.setupFontLoading();
    this.setupImageOptimization();
    this.setupResourceHints();
    this.setupPerformanceMonitoring();
    this.setupServiceWorker();
    this.setupNetworkOptimizations();
  }
  
  setupLazyLoading() {
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      this.fallbackLazyLoading();
    }
    
    // Lazy load background images
    this.setupBackgroundImageLazyLoading();
    
    // Lazy load iframes
    this.setupIframeLazyLoading();
  }
  
  setupIntersectionObserver() {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          imageObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    // Observe lazy images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  loadImage(img) {
    // Create placeholder while loading
    const placeholder = this.createImagePlaceholder(img);
    
    // Load the actual image
    const imageLoader = new Image();
    imageLoader.onload = () => {
      img.src = imageLoader.src;
      img.classList.add('loaded');
      if (placeholder) placeholder.remove();
    };
    
    imageLoader.onerror = () => {
      this.handleImageError(img, placeholder);
    };
    
    // Start loading
    imageLoader.src = img.dataset.src || img.src;
  }
  
  createImagePlaceholder(img) {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.style.width = img.width || '100%';
    placeholder.style.height = img.height || '200px';
    placeholder.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
    `;
    
    img.parentNode.insertBefore(placeholder, img);
    return placeholder;
  }
  
  handleImageError(img, placeholder) {
    img.style.display = 'none';
    if (placeholder) {
      placeholder.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <p>Image non disponible</p>
      `;
      placeholder.classList.add('error');
    }
  }
  
  fallbackLazyLoading() {
    // Simple fallback for browsers without IntersectionObserver
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    const loadImagesInViewport = () => {
      lazyImages.forEach(img => {
        if (this.isInViewport(img)) {
          this.loadImage(img);
        }
      });
    };
    
    window.addEventListener('scroll', this.throttle(loadImagesInViewport, 100));
    window.addEventListener('resize', this.throttle(loadImagesInViewport, 100));
    loadImagesInViewport();
  }
  
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  setupBackgroundImageLazyLoading() {
    const bgLazyElements = document.querySelectorAll('.bg-lazy');
    
    if ('IntersectionObserver' in window) {
      const bgObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const bgImage = entry.target.dataset.bg;
            if (bgImage) {
              entry.target.style.backgroundImage = `url(${bgImage})`;
              entry.target.classList.add('loaded');
            }
            bgObserver.unobserve(entry.target);
          }
        });
      });
      
      bgLazyElements.forEach(el => bgObserver.observe(el));
    }
  }
  
  setupIframeLazyLoading() {
    const lazyIframes = document.querySelectorAll('iframe[data-src]');
    
    if ('IntersectionObserver' in window) {
      const iframeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const iframe = entry.target;
            iframe.src = iframe.dataset.src;
            iframe.removeAttribute('data-src');
            iframeObserver.unobserve(iframe);
          }
        });
      });
      
      lazyIframes.forEach(iframe => iframeObserver.observe(iframe));
    }
  }
  
  setupFontLoading() {
    if ('fonts' in document) {
      // Use Font Loading API
      this.loadFontsWithAPI();
    } else {
      // Fallback font loading
      this.fallbackFontLoading();
    }
  }
  
  loadFontsWithAPI() {
    const fonts = [
      { family: 'Inter', weight: '400' },
      { family: 'Inter', weight: '600' },
      { family: 'Georgia', weight: '400' }
    ];
    
    const fontPromises = fonts.map(font => {
      return document.fonts.load(`${font.weight} 1em ${font.family}`);
    });
    
    Promise.all(fontPromises).then(() => {
      document.documentElement.classList.add('fonts-loaded');
      sessionStorage.setItem('fonts-loaded', 'true');
    }).catch(() => {
      // Fallback after timeout
      setTimeout(() => {
        document.documentElement.classList.add('fonts-loaded');
      }, 3000);
    });
  }
  
  fallbackFontLoading() {
    // Check if fonts were previously loaded
    if (sessionStorage.getItem('fonts-loaded')) {
      document.documentElement.classList.add('fonts-loaded');
      return;
    }
    
    // Simple timeout fallback
    setTimeout(() => {
      document.documentElement.classList.add('fonts-loaded');
      sessionStorage.setItem('fonts-loaded', 'true');
    }, 3000);
  }
  
  setupImageOptimization() {
    // WebP support detection
    this.detectWebPSupport().then(supportsWebP => {
      document.documentElement.classList.add(supportsWebP ? 'webp' : 'no-webp');
      
      if (supportsWebP) {
        this.convertImagesToWebP();
      }
    });
    
    // Responsive images with srcset
    this.setupResponsiveImages();
  }
  
  detectWebPSupport() {
    return new Promise(resolve => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
  
  convertImagesToWebP() {
    const images = document.querySelectorAll('img[data-webp]');
    images.forEach(img => {
      img.src = img.dataset.webp;
    });
  }
  
  setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-sizes]');
    
    images.forEach(img => {
      const sizes = JSON.parse(img.dataset.sizes);
      const srcset = sizes.map(size => `${size.src} ${size.width}w`).join(', ');
      
      img.srcset = srcset;
      img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    });
  }
  
  setupResourceHints() {
    // Preconnect to external domains
    this.preconnectExternalDomains();
    
    // Prefetch next page resources
    this.prefetchNextPageResources();
    
    // Preload critical resources
    this.preloadCriticalResources();
  }
  
  preconnectExternalDomains() {
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];
    
    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
  
  prefetchNextPageResources() {
    // Prefetch likely next pages
    const nextPageLinks = document.querySelectorAll('a[href^="/"]');
    const prefetchedUrls = new Set();
    
    nextPageLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const url = link.href;
        if (!prefetchedUrls.has(url)) {
          this.prefetchPage(url);
          prefetchedUrls.add(url);
        }
      });
    });
  }
  
  prefetchPage(url) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }
  
  preloadCriticalResources() {
    const criticalResources = [
      { href: '/css/modern.css', as: 'style' },
      { href: '/js/navigation.js', as: 'script' },
      { href: '/assets/avatar.avif', as: 'image' }
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.as === 'script') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }
  
  setupPerformanceMonitoring() {
    // Web Vitals monitoring
    this.monitorWebVitals();
    
    // Resource timing
    this.monitorResourceTiming();
    
    // User timing
    this.setupUserTiming();
  }
  
  monitorWebVitals() {
    // First Contentful Paint
    this.measureFCP();
    
    // Largest Contentful Paint
    this.measureLCP();
    
    // Cumulative Layout Shift
    this.measureCLS();
    
    // First Input Delay
    this.measureFID();
  }
  
  measureFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          console.log('FCP:', fcp.startTime);
          this.reportMetric('FCP', fcp.startTime);
        }
      });
      observer.observe({ entryTypes: ['paint'] });
    }
  }
  
  measureLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        console.log('LCP:', lcp.startTime);
        this.reportMetric('LCP', lcp.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }
  
  measureCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        console.log('CLS:', clsValue);
        this.reportMetric('CLS', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  measureFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fid = entries[0];
        console.log('FID:', fid.processingStart - fid.startTime);
        this.reportMetric('FID', fid.processingStart - fid.startTime);
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }
  
  reportMetric(name, value) {
    // Report to analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: name,
        value: Math.round(value)
      });
    }
  }
  
  monitorResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.duration > 1000) { // Slow resources
            console.warn('Slow resource:', entry.name, entry.duration);
          }
        });
      });
      observer.observe({ entryTypes: ['resource'] });
    }
  }
  
  setupUserTiming() {
    // Mark important events
    performance.mark('app-start');
    
    window.addEventListener('load', () => {
      performance.mark('app-loaded');
      performance.measure('app-load-time', 'app-start', 'app-loaded');
    });
  }
  
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }
  }
  
  setupNetworkOptimizations() {
    // Adapt to network conditions
    if (this.connection) {
      this.adaptToNetworkConditions();
    }
    
    // Handle online/offline states
    this.setupOfflineHandling();
  }
  
  adaptToNetworkConditions() {
    const effectiveType = this.connection.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      // Reduce quality for slow connections
      document.documentElement.classList.add('slow-connection');
      this.disableNonEssentialFeatures();
    } else if (effectiveType === '3g') {
      document.documentElement.classList.add('medium-connection');
    } else {
      document.documentElement.classList.add('fast-connection');
    }
  }
  
  disableNonEssentialFeatures() {
    // Disable animations
    document.documentElement.classList.add('reduce-animations');
    
    // Disable autoplay videos
    const videos = document.querySelectorAll('video[autoplay]');
    videos.forEach(video => {
      video.removeAttribute('autoplay');
    });
    
    // Use lower quality images
    const images = document.querySelectorAll('img[data-low-quality]');
    images.forEach(img => {
      img.src = img.dataset.lowQuality;
    });
  }
  
  setupOfflineHandling() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      document.documentElement.classList.remove('offline');
      this.showNotification('Connexion rétablie', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      document.documentElement.classList.add('offline');
      this.showNotification('Connexion perdue', 'warning');
    });
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // Utility functions
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
  new PerformanceOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}