/**
 * Dynamic Module Loader for Matrix Flow Theme
 * Implements code splitting and dynamic imports for better performance
 */

class ModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingModules = new Map();
        this.moduleCache = new Map();
        this.init();
    }

    init() {
        // Preload critical modules
        this.preloadCriticalModules();
        
        // Set up intersection observer for lazy module loading
        this.setupLazyLoading();
        
        // Listen for user interactions to preload modules
        this.setupInteractionPreloading();
    }

    async preloadCriticalModules() {
        const criticalModules = [
            '/js/viewport-manager.js',
            '/js/matrix.js'
        ];

        for (const module of criticalModules) {
            await this.loadModule(module, { priority: 'high' });
        }
    }

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            this.loadAllModules();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const modules = element.dataset.modules?.split(',') || [];
                    
                    modules.forEach(module => {
                        this.loadModule(module.trim(), { priority: 'low' });
                    });
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        // Observe elements that need lazy-loaded modules
        document.querySelectorAll('[data-modules]').forEach(el => {
            observer.observe(el);
        });
    }

    setupInteractionPreloading() {
        // Preload modules on first user interaction
        const interactionEvents = ['mousedown', 'touchstart', 'keydown'];
        
        const preloadOnInteraction = () => {
            this.preloadInteractiveModules();
            
            // Remove listeners after first interaction
            interactionEvents.forEach(event => {
                document.removeEventListener(event, preloadOnInteraction, { passive: true });
            });
        };

        interactionEvents.forEach(event => {
            document.addEventListener(event, preloadOnInteraction, { passive: true });
        });
    }

    async preloadInteractiveModules() {
        const interactiveModules = [
            '/js/newsletter.js',
            '/js/lazy-loader.js'
        ];

        for (const module of interactiveModules) {
            await this.loadModule(module, { priority: 'medium' });
        }
    }

    async loadModule(src, options = {}) {
        const { priority = 'low', timeout = 10000 } = options;
        
        // Return cached module if already loaded
        if (this.loadedModules.has(src)) {
            return this.moduleCache.get(src);
        }

        // Return existing promise if module is currently loading
        if (this.loadingModules.has(src)) {
            return this.loadingModules.get(src);
        }

        // Create loading promise
        const loadingPromise = this.createLoadingPromise(src, priority, timeout);
        this.loadingModules.set(src, loadingPromise);

        try {
            const result = await loadingPromise;
            this.loadedModules.add(src);
            this.moduleCache.set(src, result);
            this.loadingModules.delete(src);
            return result;
        } catch (error) {
            this.loadingModules.delete(src);
            console.warn(`Failed to load module: ${src}`, error);
            throw error;
        }
    }

    createLoadingPromise(src, priority, timeout) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            // Set loading priority
            if ('importance' in script) {
                script.importance = priority;
            }
            
            // Set timeout
            const timeoutId = setTimeout(() => {
                reject(new Error(`Module loading timeout: ${src}`));
            }, timeout);

            script.onload = () => {
                clearTimeout(timeoutId);
                resolve(script);
            };

            script.onerror = () => {
                clearTimeout(timeoutId);
                reject(new Error(`Failed to load module: ${src}`));
            };

            // Add to document
            document.head.appendChild(script);
        });
    }

    async loadAllModules() {
        // Fallback for browsers without intersection observer
        const allModules = [
            '/js/newsletter.js',
            '/js/lazy-loader.js'
        ];

        for (const module of allModules) {
            try {
                await this.loadModule(module);
            } catch (error) {
                console.warn(`Failed to load module in fallback mode: ${module}`, error);
            }
        }
    }

    // Public API methods
    async loadNewsletterModule() {
        return this.loadModule('/js/newsletter.js', { priority: 'high' });
    }

    async loadLazyLoaderModule() {
        return this.loadModule('/js/lazy-loader.js', { priority: 'medium' });
    }

    // Preload a module without executing it
    preloadModule(src) {
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = src;
        document.head.appendChild(link);
    }

    // Get loading status
    getModuleStatus(src) {
        if (this.loadedModules.has(src)) return 'loaded';
        if (this.loadingModules.has(src)) return 'loading';
        return 'not-loaded';
    }
}

// Initialize module loader
window.moduleLoader = new ModuleLoader();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleLoader;
}