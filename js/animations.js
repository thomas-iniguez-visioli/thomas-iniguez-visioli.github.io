/**
 * Modern Animations and Interactions
 * Handles scroll-based animations, micro-interactions, and loading states
 */

class ModernAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '50px 0px'
        };

        // Performance monitoring
        this.performanceMonitor = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 60
        };

        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupLoadingStates();
        this.setupMicroInteractions();
        this.setupPageTransitions();
        this.startPerformanceMonitoring();
    }

    startPerformanceMonitoring() {
        // Monitor animation performance to ensure 60fps
        const monitorFrame = (currentTime) => {
            this.performanceMonitor.frameCount++;
            
            if (currentTime - this.performanceMonitor.lastTime >= 1000) {
                this.performanceMonitor.fps = this.performanceMonitor.frameCount;
                this.performanceMonitor.frameCount = 0;
                this.performanceMonitor.lastTime = currentTime;
                
                // Log performance issues in development
                if (this.performanceMonitor.fps < 55 && console && console.warn) {
                    console.warn(`Animation performance warning: ${this.performanceMonitor.fps} FPS`);
                }
            }
            
            requestAnimationFrame(monitorFrame);
        };
        
        // Only monitor in development or when explicitly enabled
        if (window.location.hostname === 'localhost' || window.DEBUG_ANIMATIONS) {
            requestAnimationFrame(monitorFrame);
        }
    }

    setupScrollAnimations() {
        // Check for reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.fallbackAnimations();
            return;
        }

        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.fallbackAnimations();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Use requestAnimationFrame for smooth animations
                    requestAnimationFrame(() => {
                        this.animateElement(entry.target);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll([
            '.card',
            '.hero-content > *',
            '.article-content > *',
            '.footer-section'
        ].join(', '));

        animateElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            el.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }

    animateElement(element) {
        // Use transform3d for hardware acceleration
        element.style.opacity = '1';
        element.style.transform = 'translate3d(0, 0, 0)';

        // Add animation complete class after animation and clean up will-change
        setTimeout(() => {
            element.classList.add('animation-complete');
            // Remove will-change to free GPU memory
            element.style.willChange = 'auto';
        }, 800);
    }

    fallbackAnimations() {
        // Simple fallback for browsers without IntersectionObserver
        const elements = document.querySelectorAll([
            '.card',
            '.hero-content > *',
            '.article-content > *',
            '.footer-section'
        ].join(', '));

        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupParallaxEffects() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const parallaxElements = document.querySelectorAll('.parallax');
        if (parallaxElements.length === 0) return;

        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    setupLoadingStates() {
        // Image loading states
        const images = document.querySelectorAll('img[loading="lazy"]');

        images.forEach(img => {
            if (img.complete) {
                this.handleImageLoad(img);
            } else {
                img.addEventListener('load', () => this.handleImageLoad(img));
                img.addEventListener('error', () => this.handleImageError(img));
            }
        });

        // Form loading states
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', () => {
                this.showFormLoading(form);
            });
        });
    }

    handleImageLoad(img) {
        img.classList.add('loaded');

        // Remove skeleton placeholder if exists
        const placeholder = img.parentNode.querySelector('.skeleton');
        if (placeholder) {
            placeholder.remove();
        }
    }

    handleImageError(img) {
        img.style.display = 'none';

        // Show error placeholder
        const errorPlaceholder = document.createElement('div');
        errorPlaceholder.className = 'image-error';
        errorPlaceholder.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21,15 16,10 5,21"/>
      </svg>
      <p>Image non disponible</p>
    `;

        img.parentNode.appendChild(errorPlaceholder);
    }

    showFormLoading(form) {
        const submitButton = form.querySelector('button[type="submit"]');
        if (!submitButton) return;

        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = `
      <div class="loading-dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <span>Envoi en cours...</span>
    `;

        // Reset after 5 seconds (adjust based on your needs)
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }, 5000);
    }

    setupMicroInteractions() {
        // Button ripple effect
        const buttons = document.querySelectorAll('.btn, .hero-cta, .card-action, .article-action');

        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });

        // Hover sound effects (optional)
        const interactiveElements = document.querySelectorAll('.card, .nav-link, .footer-social-link');

        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });
        });

        // Focus management
        this.setupFocusManagement();
    }

    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    playHoverSound() {
        // Optional subtle hover sound
        if ('AudioContext' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            try {
                const audioContext = new AudioContext();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.005, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            } catch (e) {
                // Ignore audio errors
            }
        }
    }

    setupFocusManagement() {
        // Enhanced focus indicators
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });

        // Skip link functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(skipLink.getAttribute('href'));
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    setupPageTransitions() {
        // Smooth page transitions for SPA-like experience
        const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');

        links.forEach(link => {
            link.addEventListener('click', () => {
                if (link.hostname !== window.location.hostname) return;

                // Add page exit animation
                document.body.classList.add('page-exit');

                // Allow default navigation after animation
                setTimeout(() => {
                    document.body.classList.remove('page-exit');
                }, 300);
            });
        });

        // Page enter animation
        window.addEventListener('load', () => {
            document.body.classList.add('page-enter');
        });
    }

    // Public methods for external use
    showLoading(element) {
        element.classList.add('loading');

        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
      <div class="spinner"></div>
      <p>Chargement...</p>
    `;

        element.style.position = 'relative';
        element.appendChild(loadingOverlay);
    }

    hideLoading(element) {
        element.classList.remove('loading');

        const loadingOverlay = element.querySelector('.loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.remove();
        }
    }

    animateCounter(element, start = 0, end = 100, duration = 2000) {
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeOutQuart);

            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;

        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };

        type();
    }
}

// CSS for ripple effect
const rippleCSS = `
  .ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .keyboard-navigation *:focus {
    outline: 2px solid var(--color-primary) !important;
    outline-offset: 2px !important;
  }
  
  .page-enter {
    animation: pageEnter 0.5s ease-out;
  }
  
  .page-exit {
    animation: pageExit 0.3s ease-in;
  }
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ModernAnimations();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModernAnimations;
}