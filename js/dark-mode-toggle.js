/**
 * Dark Mode Toggle System
 * Provides manual dark mode toggle with localStorage persistence
 * Falls back to system preference when no manual preference is set
 */

(function() {
  'use strict';

  // Constants
  const STORAGE_KEY = 'hexo-theme-dark-mode';
  const THEME_ATTRIBUTE = 'data-theme';
  const DARK_THEME = 'dark';
  const LIGHT_THEME = 'light';
  
  // Theme state management
  class ThemeManager {
    constructor() {
      this.currentTheme = this.getInitialTheme();
      this.toggleButtons = [];
      this.init();
    }

    /**
     * Initialize the theme system
     */
    init() {
      this.applyTheme(this.currentTheme);
      this.setupToggleButtons();
      this.setupSystemPreferenceListener();
      this.setupStorageListener();
    }

    /**
     * Get the initial theme based on stored preference or system preference
     */
    getInitialTheme() {
      // Check for stored preference first
      const storedTheme = localStorage.getItem(STORAGE_KEY);
      if (storedTheme === DARK_THEME || storedTheme === LIGHT_THEME) {
        return storedTheme;
      }

      // Fall back to system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return DARK_THEME;
      }

      return DARK_THEME;
    }

    /**
     * Apply the theme to the document
     */
    applyTheme(theme) {
      const html = document.documentElement;
      
      if (theme === DARK_THEME) {
        html.setAttribute(THEME_ATTRIBUTE, DARK_THEME);
        html.classList.add('dark-mode');
        html.classList.remove('light-mode');
      } else {
        html.setAttribute(THEME_ATTRIBUTE, LIGHT_THEME);
        html.classList.add('light-mode');
        html.classList.remove('dark-mode');
      }

      this.currentTheme = theme;
      this.updateToggleButtons();
      this.dispatchThemeChangeEvent(theme);
    }

    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
      const newTheme = this.currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
      this.setTheme(newTheme);
    }

    /**
     * Set a specific theme
     */
    setTheme(theme) {
      if (theme !== DARK_THEME && theme !== LIGHT_THEME) {
        console.warn('Invalid theme:', theme);
        return;
      }

      localStorage.setItem(STORAGE_KEY, theme);
      this.applyTheme(theme);
    }

    /**
     * Clear stored preference and use system preference
     */
    useSystemPreference() {
      localStorage.removeItem(STORAGE_KEY);
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME;
      this.applyTheme(systemTheme);
    }

    /**
     * Setup toggle buttons
     */
    setupToggleButtons() {
      // Find all toggle buttons
      this.toggleButtons = document.querySelectorAll('[data-theme-toggle]');
      
      // Add click listeners
      this.toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleTheme();
        });
      });

      this.updateToggleButtons();
    }

    /**
     * Update toggle button states
     */
    updateToggleButtons() {
      this.toggleButtons.forEach(button => {
        const isDark = this.currentTheme === DARK_THEME;
        
        // Update aria-label for accessibility
        button.setAttribute('aria-label', 
          isDark ? 'Switch to light mode' : 'Switch to dark mode'
        );
        
        // Update button text if it has text content
        if (button.textContent.trim()) {
          button.textContent = isDark ? 'Light Mode' : 'Dark Mode';
        }
        
        // Update data attribute for CSS styling
        button.setAttribute('data-theme-current', this.currentTheme);
        
        // Update icon if present
        const icon = button.querySelector('[data-theme-icon]');
        if (icon) {
          icon.setAttribute('data-theme-icon', isDark ? 'sun' : 'moon');
        }
      });
    }

    /**
     * Listen for system preference changes
     */
    setupSystemPreferenceListener() {
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        mediaQuery.addEventListener('change', (e) => {
          // Only apply system preference if no manual preference is stored
          if (!localStorage.getItem(STORAGE_KEY)) {
            const systemTheme = e.matches ? DARK_THEME : LIGHT_THEME;
            this.applyTheme(systemTheme);
          }
        });
      }
    }

    /**
     * Listen for storage changes (for multi-tab sync)
     */
    setupStorageListener() {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          const newTheme = e.newValue || this.getInitialTheme();
          this.applyTheme(newTheme);
        }
      });
    }

    /**
     * Dispatch custom theme change event
     */
    dispatchThemeChangeEvent(theme) {
      const event = new CustomEvent('themechange', {
        detail: { theme, isDark: theme === DARK_THEME }
      });
      document.dispatchEvent(event);
    }

    /**
     * Get current theme
     */
    getCurrentTheme() {
      return this.currentTheme;
    }

    /**
     * Check if current theme is dark
     */
    isDarkMode() {
      return this.currentTheme === DARK_THEME;
    }
  }

  // Initialize theme manager when DOM is ready
  function initThemeManager() {
    window.themeManager = new ThemeManager();
    
    // Expose global functions for convenience
    window.toggleTheme = () => window.themeManager.toggleTheme();
    window.setTheme = (theme) => window.themeManager.setTheme(theme);
    window.useSystemTheme = () => window.themeManager.useSystemPreference();
  }

  // Initialize immediately if DOM is already loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeManager);
  } else {
    initThemeManager();
  }

  // Prevent flash of unstyled content by applying theme as early as possible
  (function() {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemDark ? DARK_THEME : LIGHT_THEME);
    
    document.documentElement.setAttribute(THEME_ATTRIBUTE, initialTheme);
    document.documentElement.classList.add(initialTheme === DARK_THEME ? 'dark-mode' : 'light-mode');
  })();

})();

/**
 * CSS-in-JS for critical theme styles to prevent FOUC
 * This ensures the theme is applied before CSS files load
 */
(function() {
  const criticalCSS = `
    /* Prevent flash of unstyled content */
    html[data-theme="dark"] {
      background-color: #0f172a;
      color: #f1f5f9;
    }
    
    html[data-theme="light"] {
      background-color: #ffffff;
      color: #0f172a;
    }
    
    /* Theme toggle button styles */
    [data-theme-toggle] {
      background: none;
      border: 1px solid currentColor;
      border-radius: 4px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      font-size: 0.875rem;
    }
    
    [data-theme-toggle]:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    html[data-theme="dark"] [data-theme-toggle]:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    [data-theme-toggle]:focus {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    
    /* Theme icon styles */
    [data-theme-icon="moon"]::before {
      content: "🌙";
    }
    
    [data-theme-icon="sun"]::before {
      content: "☀️";
    }
    
    /* Hide content until theme is applied */
    .theme-loading {
      visibility: hidden;
    }
    
    html[data-theme] .theme-loading {
      visibility: visible;
    }
  `;

  // Inject critical CSS
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.insertBefore(style, document.head.firstChild);
})();