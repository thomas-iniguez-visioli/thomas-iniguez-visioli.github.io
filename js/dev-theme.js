/**
 * Developer Theme JavaScript
 * Enhances the developer theme with interactive features
 * Requirements: 5.1, 5.2 - Maintainable and extensible system
 */

(function() {
  'use strict';

  // Theme initialization
  function initDeveloperTheme() {
    console.log('🎨 Developer theme initialized');
    
    // Add theme classes to body
    document.body.classList.add('dev-theme-loaded');
    
    // Fix z-index and positioning issues
    fixLayeringIssues();
    
    // Initialize responsive behavior
    initResponsiveBehavior();
    
    // Initialize sidebar interactions
    initSidebarInteractions();
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts();
  }

  // Fix layering and z-index issues
  function fixLayeringIssues() {
    // Ensure CSS variables are available
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Check if z-index variables are defined
    const zIndexSticky = computedStyle.getPropertyValue('--z-index-sticky');
    if (!zIndexSticky || zIndexSticky === '') {
      // Define z-index variables if missing
      root.style.setProperty('--z-index-hide', '-1');
      root.style.setProperty('--z-index-auto', 'auto');
      root.style.setProperty('--z-index-base', '0');
      root.style.setProperty('--z-index-docked', '10');
      root.style.setProperty('--z-index-dropdown', '1000');
      root.style.setProperty('--z-index-sticky', '1100');
      root.style.setProperty('--z-index-banner', '1200');
      root.style.setProperty('--z-index-overlay', '1300');
      root.style.setProperty('--z-index-modal', '1400');
      root.style.setProperty('--z-index-popover', '1500');
      root.style.setProperty('--z-index-skiplink', '1600');
      root.style.setProperty('--z-index-toast', '1700');
      root.style.setProperty('--z-index-tooltip', '1800');
    }
    
    // Fix header positioning
    const header = document.querySelector('.page-header, .dev-header');
    if (header) {
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.zIndex = 'var(--z-index-sticky)';
    }
    
    // Fix sidebar positioning
    const sidebar = document.querySelector('.dev-sidebar, #dev-sidebar');
    if (sidebar) {
      if (window.innerWidth > 1023) {
        sidebar.style.position = 'sticky';
        sidebar.style.top = '0';
        sidebar.style.zIndex = 'var(--z-index-docked)';
      } else {
        sidebar.style.position = 'fixed';
        sidebar.style.zIndex = 'var(--z-index-modal)';
      }
    }
    
    // Fix sidebar toggle
    const toggle = document.querySelector('.dev-sidebar-toggle');
    if (toggle) {
      toggle.style.position = 'fixed';
      toggle.style.zIndex = 'calc(var(--z-index-modal) + 2)';
    }
    
    console.log('🔧 Layering issues fixed');
  }

  // Responsive behavior with layering fixes
  function initResponsiveBehavior() {
    const sidebar = document.querySelector('.dev-sidebar, #dev-sidebar');
    const toggle = document.querySelector('.dev-sidebar-toggle');
    const backdrop = document.querySelector('.dev-sidebar-backdrop');
    
    if (!sidebar) return;
    
    // Create backdrop if it doesn't exist
    if (!backdrop && toggle) {
      const newBackdrop = document.createElement('div');
      newBackdrop.className = 'dev-sidebar-backdrop';
      document.body.appendChild(newBackdrop);
    }
    
    // Handle sidebar toggle
    if (toggle) {
      toggle.addEventListener('click', function() {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;
        
        toggle.setAttribute('aria-expanded', newState);
        
        if (newState) {
          sidebar.classList.add('dev-sidebar-open', 'dev-sidebar--open');
          if (backdrop) {
            backdrop.classList.add('dev-sidebar-backdrop-visible', 'visible');
          }
          document.body.classList.add('sidebar-open');
        } else {
          sidebar.classList.remove('dev-sidebar-open', 'dev-sidebar--open');
          if (backdrop) {
            backdrop.classList.remove('dev-sidebar-backdrop-visible', 'visible');
          }
          document.body.classList.remove('sidebar-open');
        }
      });
    }
    
    // Handle backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', function() {
        sidebar.classList.remove('dev-sidebar-open', 'dev-sidebar--open');
        backdrop.classList.remove('dev-sidebar-backdrop-visible', 'visible');
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('sidebar-open');
      });
    }
    
    // Handle responsive breakpoints with layering fixes
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    function handleBreakpointChange(e) {
      if (e.matches) {
        // Mobile: setup mobile sidebar
        sidebar.classList.add('dev-sidebar--mobile');
        sidebar.style.position = 'fixed';
        sidebar.style.zIndex = 'var(--z-index-modal)';
        
        if (toggle) {
          toggle.style.display = 'flex';
          toggle.style.position = 'fixed';
          toggle.style.zIndex = 'calc(var(--z-index-modal) + 2)';
        }
      } else {
        // Desktop: setup desktop sidebar
        sidebar.classList.remove('dev-sidebar--mobile', 'dev-sidebar-open', 'dev-sidebar--open');
        sidebar.style.position = 'sticky';
        sidebar.style.zIndex = 'var(--z-index-docked)';
        
        if (toggle) {
          toggle.style.display = 'none';
          toggle.setAttribute('aria-expanded', 'false');
        }
        
        if (backdrop) {
          backdrop.classList.remove('dev-sidebar-backdrop-visible', 'visible');
        }
        
        document.body.classList.remove('sidebar-open');
      }
    }
    
    mediaQuery.addListener(handleBreakpointChange);
    handleBreakpointChange(mediaQuery);
    
    // Handle window resize for layering fixes
    window.addEventListener('resize', function() {
      setTimeout(fixLayeringIssues, 100);
    });
  }

  // Sidebar interactions
  function initSidebarInteractions() {
    const techBadges = document.querySelectorAll('.dev-tech-badge');
    
    techBadges.forEach(badge => {
      badge.addEventListener('mouseenter', function() {
        const tech = this.getAttribute('data-tech');
        if (tech) {
          this.setAttribute('title', `Technology: ${tech}`);
        }
      });
    });
    
    // Navigation link active states
    const navLinks = document.querySelectorAll('.dev-nav-link');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    });
  }

  // Keyboard shortcuts
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      // Only handle shortcuts when not in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Cmd/Ctrl + shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch(e.key) {
          case 'h':
            e.preventDefault();
            navigateToHome();
            break;
          case 'a':
            e.preventDefault();
            navigateToAbout();
            break;
          case 'p':
            e.preventDefault();
            navigateToArticles();
            break;
          case 'j':
            e.preventDefault();
            navigateToJournal();
            break;
        }
      }
    });
  }

  // Navigation functions
  function navigateToHome() {
    const homeLink = document.querySelector('[data-nav="home"]');
    if (homeLink) homeLink.click();
  }

  function navigateToAbout() {
    const aboutLink = document.querySelector('[data-nav="about"]');
    if (aboutLink) aboutLink.click();
  }

  function navigateToArticles() {
    const articlesLink = document.querySelector('[data-nav="articles"]');
    if (articlesLink) articlesLink.click();
  }

  function navigateToJournal() {
    const journalLink = document.querySelector('[data-nav="journal"]');
    if (journalLink) journalLink.click();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeveloperTheme);
  } else {
    initDeveloperTheme();
  }

  // Export for testing
  window.DevTheme = {
    init: initDeveloperTheme,
    fixLayering: fixLayeringIssues,
    responsive: initResponsiveBehavior,
    sidebar: initSidebarInteractions,
    shortcuts: initKeyboardShortcuts
  };

})();