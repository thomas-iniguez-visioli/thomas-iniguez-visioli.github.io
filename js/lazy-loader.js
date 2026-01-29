/**
 * Lazy Loading System for Matrix Flow Theme
 * Implements intersection observer for images and components
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: '50px 0px',
            threshold: 0.1,
            loadingClass: 'lazy-loading',
            loadedClass: 'lazy-loaded',
            errorClass: 'lazy-error',
            placeholderClass: 'lazy-placeholder',
            ...options
        };
        
        this.observer = null;
        this.init();
    }

    init() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            this.fallbackLoad();
            return;
        }

        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );

        this.observeElements();
    }

    observeElements() {
        // Observe images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.addPlaceholder(img);
            this.observer.observe(img);
        });

        // Observe components with data-lazy attribute
        const lazyComponents = document.querySelectorAll('[data-lazy]');
        lazyComponents.forEach(component => {
            this.observer.observe(component);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.tagName === 'IMG') {
                    this.loadImage(element);
                } else {
                    this.loadComponent(element);
                }
                
                this.observer.unobserve(element);
            }
        });
    }

    addPlaceholder(img) {
        img.classList.add(this.options.placeholderClass);
        
        // Create a low-quality placeholder if dimensions are available
        if (img.dataset.width && img.dataset.height) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = parseInt(img.dataset.width);
            canvas.height = parseInt(img.dataset.height);
            
            // Create matrix-style placeholder
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#00FF41';
            ctx.font = '12px monospace';
            ctx.fillText('LOADING...', 10, canvas.height / 2);
            
            img.src = canvas.toDataURL();
        }
    }

    loadImage(img) {
        img.classList.add(this.options.loadingClass);
        
        const actualImg = new Image();
        
        actualImg.onload = () => {
            // Smooth transition effect
            img.style.transition = 'opacity 0.3s ease-in-out';
            img.style.opacity = '0';
            
            setTimeout(() => {
                img.src = actualImg.src;
                img.classList.remove(this.options.loadingClass, this.options.placeholderClass);
                img.classList.add(this.options.loadedClass);
                img.style.opacity = '1';
                
                // Copy other attributes
                if (img.dataset.srcset) {
                    img.srcset = img.dataset.srcset;
                }
                if (img.dataset.sizes) {
                    img.sizes = img.dataset.sizes;
                }
            }, 50);
        };
        
        actualImg.onerror = () => {
            img.classList.remove(this.options.loadingClass);
            img.classList.add(this.options.errorClass);
            console.warn('Failed to load image:', img.dataset.src);
        };
        
        actualImg.src = img.dataset.src;
    }

    loadComponent(component) {
        component.classList.add(this.options.loadingClass);
        
        const componentType = component.dataset.lazy;
        
        switch (componentType) {
            case 'newsletter-widget':
                this.loadNewsletterWidget(component);
                break;
            case 'social-links':
                this.loadSocialLinks(component);
                break;
            case 'code-block':
                this.loadCodeBlock(component);
                break;
            default:
                this.loadGenericComponent(component);
        }
    }

    loadNewsletterWidget(component) {
        // Progressive enhancement for newsletter widget
        const form = component.querySelector('form');
        if (form) {
            // Add enhanced validation and animations
            this.enhanceForm(form);
        }
        
        component.classList.remove(this.options.loadingClass);
        component.classList.add(this.options.loadedClass);
    }

    loadSocialLinks(component) {
        // Add hover effects and icons
        const links = component.querySelectorAll('a');
        links.forEach(link => {
            link.style.transition = 'all 0.3s ease';
        });
        
        component.classList.remove(this.options.loadingClass);
        component.classList.add(this.options.loadedClass);
    }

    loadCodeBlock(component) {
        // Add syntax highlighting if available
        if (window.Prism) {
            window.Prism.highlightAllUnder(component);
        }
        
        component.classList.remove(this.options.loadingClass);
        component.classList.add(this.options.loadedClass);
    }

    loadGenericComponent(component) {
        // Generic component loading with fade-in effect
        component.style.transition = 'opacity 0.3s ease-in-out';
        component.style.opacity = '0';
        
        setTimeout(() => {
            component.style.opacity = '1';
            component.classList.remove(this.options.loadingClass);
            component.classList.add(this.options.loadedClass);
        }, 100);
    }

    enhanceForm(form) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Add matrix-style focus effects
            input.addEventListener('focus', () => {
                input.style.boxShadow = '0 0 10px var(--matrix-green)';
            });
            
            input.addEventListener('blur', () => {
                input.style.boxShadow = 'none';
            });
        });
    }

    fallbackLoad() {
        // Fallback for browsers without Intersection Observer
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
        });

        const lazyComponents = document.querySelectorAll('[data-lazy]');
        lazyComponents.forEach(component => {
            this.loadComponent(component);
        });
    }

    // Public method to observe new elements added dynamically
    observeNewElements() {
        this.observeElements();
    }

    // Public method to disconnect observer
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyLoader();
});

// Re-observe elements when new content is added
document.addEventListener('contentLoaded', () => {
    if (window.lazyLoader) {
        window.lazyLoader.observeNewElements();
    }
});