/**
 * Modern Navigation Component
 * Handles mobile menu toggle, scroll behavior, and active link highlighting
 */

class ModernNavigation {
    constructor() {
        this.header = document.querySelector('.page-header');
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');

        this.isMenuOpen = false;
        this.lastScrollY = window.scrollY;

        this.init();
    }

    init() {
        if (!this.header || !this.navToggle || !this.navMenu) return;

        this.setupEventListeners();
        this.setupScrollBehavior();
        this.setupActiveLinks();
        this.setupKeyboardNavigation();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.navToggle.addEventListener('click', (e) => { e.preventDefault(); this.toggleMobileMenu(); });

        // Close menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => { if (this.isMenuOpen) this.closeMobileMenu(); });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && !this.header.contains(e.target)) this.closeMobileMenu();
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) { this.closeMobileMenu(); this.navToggle.focus(); }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768 && this.isMenuOpen) this.closeMobileMenu();
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen ? this.closeMobileMenu() : this.openMobileMenu();
    }

    openMobileMenu() {
        this.isMenuOpen = true;
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus first nav link
        setTimeout(() => {
            const firstLink = this.navMenu.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
        }, 100);

        // Add class for styling
        this.header.classList.add('menu-open');
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');

        // Restore body scroll
        document.body.style.overflow = '';

        // Remove class
        this.header.classList.remove('menu-open');
    }

    setupScrollBehavior() {
        let ticking = false;

        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            currentScrollY > 10 ? this.header.classList.add('scrolled') : this.header.classList.remove('scrolled');
            this.lastScrollY = currentScrollY;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) { requestAnimationFrame(updateHeader); ticking = true; }
        });
    }

    setupActiveLinks() {
        const currentPath = window.location.pathname;

        this.navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            link.removeAttribute('aria-current');
            link.classList.remove('active');

            if (linkPath === currentPath || (currentPath !== '/' && linkPath !== '/' && currentPath.startsWith(linkPath))) {
                link.setAttribute('aria-current', 'page');
                link.classList.add('active');
            }
        });
    }

    setupKeyboardNavigation() {
        // Trap focus in mobile menu
        this.navMenu.addEventListener('keydown', (e) => {
            if (!this.isMenuOpen) return;

            const focusableElements = this.navMenu.querySelectorAll('.nav-link');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault(); lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault(); firstElement.focus();
                }
            }
        });
    }

    // Public method to highlight active section on scroll
    highlightActiveSection() {
        const sections = document.querySelectorAll('section[id], article[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => { link.classList.remove('active'); link.removeAttribute('aria-current'); });
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) { activeLink.classList.add('active'); activeLink.setAttribute('aria-current', 'page'); }
            }
        });
    }
}

// Smooth scroll polyfill for older browsers
function smoothScrollTo(target) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;

    const headerHeight = document.querySelector('.page-header')?.offsetHeight || 0;
    const targetPosition = targetElement.offsetTop - headerHeight - 20;

    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    } else {
        // Fallback for older browsers
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--; return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const navigation = new ModernNavigation();

    // Handle smooth scroll for anchor links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link && link.getAttribute('href') !== '#') {
            e.preventDefault();
            smoothScrollTo(link.getAttribute('href'));
        }
    });

    // Update active section on scroll (optional)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => navigation.highlightActiveSection(), 100);
    });
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernNavigation;
}