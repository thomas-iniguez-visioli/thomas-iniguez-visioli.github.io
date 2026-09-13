/**
 * Viewport Manager for Matrix Flow Theme
 * Handles responsive layout adjustments and viewport-specific optimizations
 */

class ViewportManager {
  constructor() {
    this.breakpoints = {
      mobile: 480,
      tablet: 768,
      desktop: 1200,
      ultrawide: 1600
    };
    
    this.currentBreakpoint = null;
    this.orientation = null;
    this.isHighDPI = false;
    this.prefersReducedMotion = false;
    
    this.init();
  }
  
  init() {
    this.detectFeatures();
    this.bindEvents();
    this.handleResize();
    this.optimizeForViewport();
  }
  
  detectFeatures() {
    // Detect high DPI screens
    this.isHighDPI = window.devicePixelRatio > 1;
    
    // Detect reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Add classes to body for CSS targeting
    document.body.classList.toggle('high-dpi', this.isHighDPI);
    document.body.classList.toggle('reduced-motion', this.prefersReducedMotion);
  }
  
  bindEvents() {
    // Throttled resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.handleResize(), 100);
    });
    
    // Orientation change handler
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.handleOrientationChange(), 100);
    });
    
    // Media query listeners for reduced motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addListener((e) => {
      this.prefersReducedMotion = e.matches;
      document.body.classList.toggle('reduced-motion', this.prefersReducedMotion);
    });
  }
  
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const newBreakpoint = this.getBreakpoint(width);
    const newOrientation = width > height ? 'landscape' : 'portrait';
    
    // Update breakpoint if changed
    if (newBreakpoint !== this.currentBreakpoint) {
      this.updateBreakpoint(newBreakpoint);
    }
    
    // Update orientation if changed
    if (newOrientation !== this.orientation) {
      this.updateOrientation(newOrientation);
    }
    
    // Optimize layout for current viewport
    this.optimizeLayout(width, height);
  }
  
  getBreakpoint(width) {
    if (width <= this.breakpoints.mobile) return 'mobile';
    if (width <= this.breakpoints.tablet) return 'tablet';
    if (width <= this.breakpoints.desktop) return 'desktop';
    if (width >= this.breakpoints.ultrawide) return 'ultrawide';
    return 'desktop';
  }
  
  updateBreakpoint(newBreakpoint) {
    // Remove old breakpoint class
    if (this.currentBreakpoint) {
      document.body.classList.remove(`bp-${this.currentBreakpoint}`);
    }
    
    // Add new breakpoint class
    this.currentBreakpoint = newBreakpoint;
    document.body.classList.add(`bp-${newBreakpoint}`);
    
    // Trigger custom event
    this.dispatchViewportEvent('breakpointchange', {
      breakpoint: newBreakpoint,
      width: window.innerWidth
    });
  }
  
  updateOrientation(newOrientation) {
    // Remove old orientation class
    if (this.orientation) {
      document.body.classList.remove(`orientation-${this.orientation}`);
    }
    
    // Add new orientation class
    this.orientation = newOrientation;
    document.body.classList.add(`orientation-${newOrientation}`);
    
    // Trigger custom event
    this.dispatchViewportEvent('orientationchange', {
      orientation: newOrientation
    });
  }
  
  handleOrientationChange() {
    // Force a resize check after orientation change
    this.handleResize();
    
    // Optimize for new orientation
    this.optimizeForOrientation();
  }
  
  optimizeLayout(width, height) {
    const grid = document.querySelector('.responsive-grid');
    if (!grid) return;
    
    // Adjust grid gap based on viewport size
    if (width <= this.breakpoints.mobile) {
      grid.style.setProperty('--dynamic-gap', '0.25rem');
    } else if (width <= this.breakpoints.tablet) {
      grid.style.setProperty('--dynamic-gap', '0.5rem');
    } else {
      grid.style.setProperty('--dynamic-gap', '1rem');
    }
    
    // Optimize for very short screens (landscape mobile)
    if (height < 500 && this.orientation === 'landscape') {
      document.body.classList.add('short-viewport');
    } else {
      document.body.classList.remove('short-viewport');
    }
  }
  
  optimizeForViewport() {
    // Optimize matrix canvas for performance on mobile
    const canvas = document.getElementById('matrix-canvas');
    if (canvas && this.currentBreakpoint === 'mobile') {
      canvas.style.opacity = '0.2'; // Reduce opacity for better performance
    }
    
    // Adjust font sizes for readability
    this.optimizeFontSizes();
  }
  
  optimizeForOrientation() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Adjust sidebar behavior based on orientation
    if (this.orientation === 'landscape' && window.innerHeight < 600) {
      sidebar.style.maxHeight = '200px';
    } else {
      sidebar.style.maxHeight = '';
    }
  }
  
  optimizeFontSizes() {
    const root = document.documentElement;
    const width = window.innerWidth;
    
    // Dynamic font scaling
    let baseFontSize = 18;
    if (width <= this.breakpoints.mobile) {
      baseFontSize = 16;
    } else if (width >= this.breakpoints.ultrawide) {
      baseFontSize = 20;
    }
    
    root.style.setProperty('--base-font-size', `${baseFontSize}px`);
  }
  
  dispatchViewportEvent(eventName, detail) {
    const event = new CustomEvent(`viewport:${eventName}`, {
      detail: detail,
      bubbles: true
    });
    document.dispatchEvent(event);
  }
  
  // Public API methods
  getCurrentBreakpoint() {
    return this.currentBreakpoint;
  }
  
  getOrientation() {
    return this.orientation;
  }
  
  isBreakpoint(breakpoint) {
    return this.currentBreakpoint === breakpoint;
  }
  
  isMobile() {
    return this.currentBreakpoint === 'mobile';
  }
  
  isTablet() {
    return this.currentBreakpoint === 'tablet';
  }
  
  isDesktop() {
    return this.currentBreakpoint === 'desktop' || this.currentBreakpoint === 'ultrawide';
  }
}

// Initialize viewport manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.viewportManager = new ViewportManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ViewportManager;
}