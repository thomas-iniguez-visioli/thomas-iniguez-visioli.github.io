/**
 * Accessibility Enhancements
 * WCAG 2.1 AA compliance, keyboard navigation, and assistive technology support
 */

class AccessibilityManager {
  constructor() {
    this.isKeyboardUser = false;
    this.focusableElements = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    this.init();
  }
  
  init() {
    this.loadAccessibilityPreferences();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupAriaLabels();
    this.setupLiveRegions();
    this.setupSkipLinks();
    this.setupModalAccessibility();
    this.setupFormAccessibility();
    this.setupColorContrastToggle();
    this.setupReducedMotionToggle();
    
    // Run initial accessibility audit in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setTimeout(() => {
        const audit = this.runAccessibilityAudit();
        if (audit.issues.length > 0) {
          console.warn('Problèmes d\'accessibilité détectés:', audit.issues);
        } else {
          console.log('✓ Audit d\'accessibilité réussi');
        }
      }, 1000);
    }
  }
  
  setupKeyboardNavigation() {
    // Detect keyboard usage
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.isKeyboardUser = true;
        document.body.classList.add('keyboard-navigation');
      }
    });
    
    document.addEventListener('mousedown', () => {
      this.isKeyboardUser = false;
      document.body.classList.remove('keyboard-navigation');
    });
    
    // Escape key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
    });
    
    // Arrow key navigation for menus
    this.setupArrowKeyNavigation();
    
    // Keyboard shortcuts for accessibility features
    this.setupAccessibilityShortcuts();
    
    // Enhanced keyboard navigation for complex widgets
    this.setupAdvancedKeyboardNavigation();
  }
  
  setupArrowKeyNavigation() {
    const menus = document.querySelectorAll('[role="menu"], .nav-menu');
    
    menus.forEach(menu => {
      menu.addEventListener('keydown', (e) => {
        const items = menu.querySelectorAll('[role="menuitem"], .nav-link');
        const currentIndex = Array.from(items).indexOf(document.activeElement);
        
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex].focus();
            break;
            
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            items[prevIndex].focus();
            break;
            
          case 'Home':
            e.preventDefault();
            items[0].focus();
            break;
            
          case 'End':
            e.preventDefault();
            items[items.length - 1].focus();
            break;
        }
      });
    });
  }
  
  setupFocusManagement() {
    // Focus trap for modals
    this.setupFocusTrap();
    
    // Focus restoration
    this.setupFocusRestoration();
    
    // Focus indicators
    this.enhanceFocusIndicators();
  }
  
  setupFocusTrap() {
    const modals = document.querySelectorAll('.modal, .focus-trap');
    
    modals.forEach(modal => {
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          this.trapFocus(e, modal);
        }
      });
    });
  }
  
  trapFocus(event, container) {
    const focusableElements = container.querySelectorAll(this.focusableElements);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  setupFocusRestoration() {
    let lastFocusedElement = null;
    
    // Store focus before opening modals
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-modal-trigger]')) {
        lastFocusedElement = e.target;
      }
    });
    
    // Restore focus when modals close
    document.addEventListener('modal-closed', () => {
      if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
    });
  }
  
  enhanceFocusIndicators() {
    // Add enhanced focus indicators for better visibility
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 3px solid var(--color-primary) !important;
        outline-offset: 2px !important;
        box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.2) !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  setupAriaLabels() {
    // Auto-generate ARIA labels for common elements
    this.generateAriaLabels();
    
    // Update ARIA states dynamically
    this.updateAriaStates();
  }
  
  generateAriaLabels() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link:not([aria-label])');
    navLinks.forEach(link => {
      const text = link.textContent.trim();
      if (text) {
        link.setAttribute('aria-label', `Naviguer vers ${text}`);
      }
    });
    
    // Social links
    const socialLinks = document.querySelectorAll('.footer-social-link:not([aria-label])');
    socialLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href.includes('github')) {
        link.setAttribute('aria-label', 'Profil GitHub');
      } else if (href.includes('twitter')) {
        link.setAttribute('aria-label', 'Profil Twitter');
      } else if (href.includes('mastodon')) {
        link.setAttribute('aria-label', 'Profil Mastodon');
      } else if (href.includes('feed')) {
        link.setAttribute('aria-label', 'Flux RSS');
      }
    });
    
    // Form inputs without labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    inputs.forEach(input => {
      const placeholder = input.getAttribute('placeholder');
      const type = input.getAttribute('type');
      
      if (placeholder) {
        input.setAttribute('aria-label', placeholder);
      } else if (type === 'email') {
        input.setAttribute('aria-label', 'Adresse email');
      } else if (type === 'search') {
        input.setAttribute('aria-label', 'Rechercher');
      }
    });
  }
  
  updateAriaStates() {
    // Update expanded states for navigation
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      const observer = new MutationObserver(() => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navMenu.setAttribute('aria-hidden', !isExpanded);
      });
      
      observer.observe(navToggle, { attributes: true });
    }
    
    // Update loading states
    this.updateLoadingStates();
  }
  
  updateLoadingStates() {
    const loadingElements = document.querySelectorAll('.loading');
    
    loadingElements.forEach(element => {
      element.setAttribute('aria-busy', 'true');
      element.setAttribute('aria-live', 'polite');
    });
    
    // Remove loading states when complete
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const element = mutation.target;
          if (!element.classList.contains('loading')) {
            element.removeAttribute('aria-busy');
            element.removeAttribute('aria-live');
          }
        }
      });
    });
    
    loadingElements.forEach(element => {
      observer.observe(element, { attributes: true });
    });
  }
  
  setupLiveRegions() {
    // Create live region for announcements
    this.createLiveRegion();
    
    // Announce page changes
    this.announcePageChanges();
    
    // Announce form validation
    this.announceFormValidation();
  }
  
  createLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.className = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    document.body.appendChild(liveRegion);
    
    this.liveRegion = liveRegion;
  }
  
  announce(message, priority = 'polite') {
    if (!this.liveRegion) return;
    
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // Clear after announcement
    setTimeout(() => {
      this.liveRegion.textContent = '';
    }, 1000);
  }
  
  announcePageChanges() {
    // Announce when new content loads
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const addedElements = Array.from(mutation.addedNodes).filter(node => 
            node.nodeType === Node.ELEMENT_NODE
          );
          
          if (addedElements.length > 0) {
            this.announce('Nouveau contenu chargé');
          }
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  announceFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        const errors = form.querySelectorAll('.error, [aria-invalid="true"]');
        
        if (errors.length > 0) {
          e.preventDefault();
          this.announce(`Formulaire contient ${errors.length} erreur${errors.length > 1 ? 's' : ''}`, 'assertive');
          errors[0].focus();
        } else {
          this.announce('Formulaire envoyé avec succès');
        }
      });
    });
  }
  
  setupSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');
    
    skipLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
          this.announce(`Navigation vers ${target.textContent || targetId}`);
        }
      });
    });
  }
  
  setupModalAccessibility() {
    const modalTriggers = document.querySelectorAll('[data-modal-trigger]');
    
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal-trigger');
        this.openModal(modalId);
      });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }
  
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Set ARIA attributes
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    // Focus first focusable element
    const firstFocusable = modal.querySelector(this.focusableElements);
    if (firstFocusable) {
      firstFocusable.focus();
    }
    
    // Announce modal opening
    const title = modal.querySelector('.modal-title');
    if (title) {
      this.announce(`Ouverture de la boîte de dialogue: ${title.textContent}`);
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }
  
  closeAllModals() {
    const modals = document.querySelectorAll('.modal[aria-hidden="false"]');
    
    modals.forEach(modal => {
      modal.setAttribute('aria-hidden', 'true');
      this.announce('Boîte de dialogue fermée');
    });
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Dispatch close event
    document.dispatchEvent(new CustomEvent('modal-closed'));
  }
  
  setupFormAccessibility() {
    // Associate labels with inputs
    this.associateLabelsWithInputs();
    
    // Add required field indicators
    this.addRequiredFieldIndicators();
    
    // Setup form validation
    this.setupFormValidation();
  }
  
  associateLabelsWithInputs() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      if (!input.id) {
        input.id = `input-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Find associated label
      let label = document.querySelector(`label[for="${input.id}"]`);
      
      if (!label) {
        // Look for parent label
        label = input.closest('label');
      }
      
      if (!label) {
        // Create label from placeholder or nearby text
        const placeholder = input.getAttribute('placeholder');
        if (placeholder) {
          label = document.createElement('label');
          label.setAttribute('for', input.id);
          label.textContent = placeholder;
          label.className = 'sr-only';
          input.parentNode.insertBefore(label, input);
        }
      }
    });
  }
  
  addRequiredFieldIndicators() {
    const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
    
    requiredInputs.forEach(input => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label && !label.classList.contains('required')) {
        label.classList.add('required');
        input.setAttribute('aria-required', 'true');
      }
    });
  }
  
  setupFormValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
    });
  }
  
  validateField(input) {
    const isValid = input.checkValidity();
    
    if (isValid) {
      input.classList.remove('error');
      input.setAttribute('aria-invalid', 'false');
      this.removeErrorMessage(input);
    } else {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      this.showErrorMessage(input);
    }
  }
  
  showErrorMessage(input) {
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.id = `${input.id}-error`;
    errorMessage.textContent = input.validationMessage;
    
    input.setAttribute('aria-describedby', errorMessage.id);
    input.parentNode.appendChild(errorMessage);
  }
  
  removeErrorMessage(input) {
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
      input.removeAttribute('aria-describedby');
    }
  }
  
  setupColorContrastToggle() {
    // Create high contrast toggle
    const contrastToggle = document.createElement('button');
    contrastToggle.textContent = 'Contraste élevé';
    contrastToggle.className = 'contrast-toggle sr-only';
    contrastToggle.setAttribute('aria-label', 'Activer le mode contraste élevé');
    
    contrastToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('high-contrast');
      const isHighContrast = document.documentElement.classList.contains('high-contrast');
      
      contrastToggle.textContent = isHighContrast ? 'Contraste normal' : 'Contraste élevé';
      contrastToggle.setAttribute('aria-label', 
        isHighContrast ? 'Désactiver le mode contraste élevé' : 'Activer le mode contraste élevé'
      );
      
      this.announce(isHighContrast ? 'Mode contraste élevé activé' : 'Mode contraste normal activé');
    });
    
    document.body.appendChild(contrastToggle);
  }
  
  setupReducedMotionToggle() {
    // Create reduced motion toggle
    const motionToggle = document.createElement('button');
    motionToggle.textContent = 'Réduire les animations';
    motionToggle.className = 'motion-toggle sr-only';
    motionToggle.setAttribute('aria-label', 'Réduire les animations');
    
    motionToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('reduce-motion');
      const isReduced = document.documentElement.classList.contains('reduce-motion');
      
      motionToggle.textContent = isReduced ? 'Animations normales' : 'Réduire les animations';
      motionToggle.setAttribute('aria-label', 
        isReduced ? 'Activer les animations' : 'Réduire les animations'
      );
      
      this.announce(isReduced ? 'Animations réduites' : 'Animations normales activées');
    });
    
    document.body.appendChild(motionToggle);
  }
  
  handleEscapeKey() {
    // Close any open modals
    this.closeAllModals();
    
    // Close any open menus
    const openMenus = document.querySelectorAll('[aria-expanded="true"]');
    openMenus.forEach(menu => {
      menu.setAttribute('aria-expanded', 'false');
    });
  }
  
  // Public methods
  focusElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
      return true;
    }
    return false;
  }
  
  announceToScreenReader(message, priority = 'polite') {
    this.announce(message, priority);
  }
  
  setupAccessibilityShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + H: Go to main content
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        const mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent) {
          mainContent.focus();
          mainContent.scrollIntoView({ behavior: 'smooth' });
          this.announce('Navigation vers le contenu principal');
        }
      }
      
      // Alt + N: Go to navigation
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const nav = document.querySelector('nav[role="navigation"], .nav-menu');
        if (nav) {
          const firstLink = nav.querySelector('a, button');
          if (firstLink) {
            firstLink.focus();
            this.announce('Navigation vers le menu principal');
          }
        }
      }
      
      // Alt + S: Go to search
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const search = document.querySelector('input[type="search"], .search-input');
        if (search) {
          search.focus();
          this.announce('Navigation vers la recherche');
        }
      }
      
      // Alt + C: Toggle high contrast
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        this.toggleHighContrast();
      }
      
      // Alt + M: Toggle reduced motion
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        this.toggleReducedMotion();
      }
    });
  }
  
  setupAdvancedKeyboardNavigation() {
    // Tab panels navigation
    const tabLists = document.querySelectorAll('[role="tablist"]');
    tabLists.forEach(tabList => {
      const tabs = tabList.querySelectorAll('[role="tab"]');
      
      tabList.addEventListener('keydown', (e) => {
        const currentIndex = Array.from(tabs).indexOf(e.target);
        
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
            break;
            
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
            tabs[prevIndex].focus();
            tabs[prevIndex].click();
            break;
            
          case 'Home':
            e.preventDefault();
            tabs[0].focus();
            tabs[0].click();
            break;
            
          case 'End':
            e.preventDefault();
            tabs[tabs.length - 1].focus();
            tabs[tabs.length - 1].click();
            break;
        }
      });
    });
    
    // Accordion navigation
    const accordions = document.querySelectorAll('.accordion, [data-accordion]');
    accordions.forEach(accordion => {
      const headers = accordion.querySelectorAll('.accordion-header, [data-accordion-header]');
      
      headers.forEach(header => {
        header.addEventListener('keydown', (e) => {
          switch (e.key) {
            case 'Enter':
            case ' ':
              e.preventDefault();
              header.click();
              break;
          }
        });
      });
    });
  }
  
  toggleHighContrast() {
    document.documentElement.classList.toggle('high-contrast');
    const isHighContrast = document.documentElement.classList.contains('high-contrast');
    
    // Store preference
    localStorage.setItem('high-contrast', isHighContrast);
    
    this.announce(isHighContrast ? 'Mode contraste élevé activé' : 'Mode contraste normal activé');
  }
  
  toggleReducedMotion() {
    document.documentElement.classList.toggle('reduce-motion');
    const isReduced = document.documentElement.classList.contains('reduce-motion');
    
    // Store preference
    localStorage.setItem('reduce-motion', isReduced);
    
    this.announce(isReduced ? 'Animations réduites' : 'Animations normales activées');
  }
  
  // Enhanced color contrast checker
  checkColorContrast(foreground, background) {
    // Simple color contrast checker
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g);
      if (!rgb) return 0;
      
      const [r, g, b] = rgb.map(c => {
        c = parseInt(c) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio: ratio,
      AA: ratio >= 4.5,
      AAA: ratio >= 7,
      AALarge: ratio >= 3,
      AAALarge: ratio >= 4.5
    };
  }
  
  // Automatic accessibility testing
  runAccessibilityAudit() {
    const issues = [];
    
    // Check for missing alt text
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) {
      issues.push(`${images.length} image(s) sans attribut alt`);
    }
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
    const unlabeledInputs = Array.from(inputs).filter(input => {
      return !document.querySelector(`label[for="${input.id}"]`) && !input.closest('label');
    });
    if (unlabeledInputs.length > 0) {
      issues.push(`${unlabeledInputs.length} champ(s) de formulaire sans label`);
    }
    
    // Check for missing headings hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let hierarchyIssues = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        hierarchyIssues++;
      }
      previousLevel = level;
    });
    
    if (hierarchyIssues > 0) {
      issues.push(`${hierarchyIssues} problème(s) de hiérarchie des titres`);
    }
    
    // Check for missing landmarks
    const landmarks = document.querySelectorAll('[role="banner"], [role="main"], [role="navigation"], [role="contentinfo"], header, main, nav, footer');
    if (landmarks.length === 0) {
      issues.push('Aucun landmark ARIA détecté');
    }
    
    return {
      issues: issues,
      score: Math.max(0, 100 - (issues.length * 10)),
      passed: issues.length === 0
    };
  }
  
  // Load user preferences
  loadAccessibilityPreferences() {
    // Load high contrast preference
    if (localStorage.getItem('high-contrast') === 'true') {
      document.documentElement.classList.add('high-contrast');
    }
    
    // Load reduced motion preference
    if (localStorage.getItem('reduce-motion') === 'true') {
      document.documentElement.classList.add('reduce-motion');
    }
    
    // Respect system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }
    
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.classList.add('high-contrast');
    }
  }
}

// Initialize accessibility manager
document.addEventListener('DOMContentLoaded', () => {
  window.accessibilityManager = new AccessibilityManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibilityManager;
}