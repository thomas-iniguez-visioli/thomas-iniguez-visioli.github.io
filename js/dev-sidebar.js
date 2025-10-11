/**
 * Developer Sidebar JavaScript
 * Handles mobile menu toggle, keyboard shortcuts, and interactive features
 */

class DevSidebar {
  constructor() {
    this.sidebar = document.getElementById('dev-sidebar');
    this.toggle = document.querySelector('.dev-sidebar-toggle');
    this.backdrop = null;
    this.isOpen = false;
    
    this.init();
  }
  
  init() {
    if (!this.sidebar || !this.toggle) return;
    
    this.createBackdrop();
    this.bindEvents();
    this.setupKeyboardShortcuts();
    this.setupTechBadgeTooltips();
  }
  
  createBackdrop() {
    this.backdrop = document.createElement('div');
    this.backdrop.className = 'dev-sidebar-backdrop';
    document.body.appendChild(this.backdrop);
  }
  
  bindEvents() {
    // Toggle button click
    this.toggle.addEventListener('click', () => this.toggleSidebar());
    
    // Backdrop click to close
    this.backdrop.addEventListener('click', () => this.closeSidebar());
    
    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeSidebar();
      }
    });
    
    // Close on window resize to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024 && this.isOpen) {
        this.closeSidebar();
      }
    });
    
    // Handle navigation link clicks on mobile
    const navLinks = this.sidebar.querySelectorAll('.dev-nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          this.closeSidebar();
        }
      });
    });
  }
  
  toggleSidebar() {
    if (this.isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }
  
  openSidebar() {
    this.isOpen = true;
    this.sidebar.classList.add('dev-sidebar-open');
    this.backdrop.classList.add('dev-sidebar-backdrop-visible');
    this.toggle.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Focus first navigation link
    const firstNavLink = this.sidebar.querySelector('.dev-nav-link');
    if (firstNavLink) {
      setTimeout(() => firstNavLink.focus(), 100);
    }
  }
  
  closeSidebar() {
    this.isOpen = false;
    this.sidebar.classList.remove('dev-sidebar-open');
    this.backdrop.classList.remove('dev-sidebar-backdrop-visible');
    this.toggle.setAttribute('aria-expanded', 'false');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Return focus to toggle button
    this.toggle.focus();
  }
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Only handle shortcuts when not in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      // Check for Cmd/Ctrl + key combinations
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            e.preventDefault();
            this.navigateToPage('/');
            break;
          case 'a':
            e.preventDefault();
            this.navigateToPage('/about/');
            break;
          case 'p':
            e.preventDefault();
            this.navigateToPage('/archives/');
            break;
          case 'j':
            e.preventDefault();
            this.navigateToPage('/categories/journal/');
            break;
        }
      }
    });
  }
  
  navigateToPage(url) {
    // Add visual feedback
    const link = this.sidebar.querySelector(`[href="${url}"]`);
    if (link) {
      link.style.transform = 'scale(0.95)';
      setTimeout(() => {
        link.style.transform = '';
        window.location.href = url;
      }, 100);
    } else {
      window.location.href = url;
    }
  }
  
  setupTechBadgeTooltips() {
    const badges = this.sidebar.querySelectorAll('.dev-tech-badge');
    
    badges.forEach(badge => {
      const techName = badge.getAttribute('data-tech');
      if (!techName) return;
      
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'dev-tech-tooltip';
      tooltip.textContent = techName;
      tooltip.style.cssText = `
        position: absolute;
        background: var(--dev-ide-panel);
        color: var(--color-neutral-100);
        padding: var(--space-1) var(--space-2);
        border-radius: var(--border-radius-sm);
        font-size: var(--font-size-xs);
        font-family: var(--font-family-mono);
        border: 1px solid var(--dev-ide-border);
        z-index: var(--z-index-tooltip);
        pointer-events: none;
        opacity: 0;
        transform: translateY(-100%) translateX(-50%);
        transition: var(--transition-opacity);
        white-space: nowrap;
        top: -8px;
        left: 50%;
      `;
      
      badge.style.position = 'relative';
      badge.appendChild(tooltip);
      
      // Show/hide tooltip on hover
      badge.addEventListener('mouseenter', () => {
        tooltip.style.opacity = '1';
      });
      
      badge.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });
      
      // Handle focus for keyboard users
      badge.addEventListener('focus', () => {
        tooltip.style.opacity = '1';
      });
      
      badge.addEventListener('blur', () => {
        tooltip.style.opacity = '0';
      });
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DevSidebar();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DevSidebar;
}