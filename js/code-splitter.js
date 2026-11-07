/**
 * Advanced Code Splitting and Dynamic Import Manager
 * Implements intelligent module loading with priority-based scheduling
 */

class CodeSplitter {
    constructor() {
        this.moduleRegistry = new Map();
        this.loadingQueue = [];
        this.loadedModules = new Set();
        this.failedModules = new Set();
        this.loadingPromises = new Map();
        
        // Performance budgets
        this.budgets = {
            critical: 50 * 1024,      // 50KB for critical modules
            high: 100 * 1024,         // 100KB for high priority
            medium: 200 * 1024,       // 200KB for medium priority
            low: 500 * 1024           // 500KB for low priority
        };
        
        this.init();
    }

    init() {
        this.registerModules();
        this.setupPerformanceObserver();
        this.loadCriticalModules();
    }

    registerModules() {
        // Register all available modules with their metadata
        this.moduleRegistry.set('viewport-manager', {
            path: '/js/viewport-manager.js',
            priority: 'critical',
            dependencies: [],
            size: 15 * 1024,
            features: ['responsive-layout', 'viewport-detection']
        });

        this.moduleRegistry.set('matrix-animation', {
            path: '/js/matrix.js',
            priority: 'critical',
            dependencies: [],
            size: 25 * 1024,
            features: ['background-animation', 'canvas-rendering']
        });

        this.moduleRegistry.set('newsletter', {
            path: '/js/newsletter.js',
            priority: 'high',
            dependencies: [],
            size: 35 * 1024,
            features: ['form-handling', 'api-integration'],
            loadTrigger: 'interaction'
        });

        this.moduleRegistry.set('lazy-loader', {
            path: '/js/lazy-loader.js',
            priority: 'medium',
            dependencies: [],
            size: 20 * 1024,
            features: ['image-lazy-loading', 'intersection-observer'],
            loadTrigger: 'scroll'
        });

        this.moduleRegistry.set('performance-analytics', {
            path: '/js/performance-analytics.js',
            priority: 'low',
            dependencies: ['performance-monitor'],
            size: 30 * 1024,
            features: ['analytics', 'reporting'],
            loadTrigger: 'idle'
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'resource' && entry.name.includes('.js')) {
                        this.trackModulePerformance(entry);
                    }
                });
            });

            observer.observe({ entryTypes: ['resource'] });
        }
    }

    trackModulePerformance(entry) {
        const moduleName = this.getModuleNameFromPath(entry.name);
        if (moduleName) {
            const performance = {
                loadTime: entry.responseEnd - entry.startTime,
                transferSize: entry.transferSize,
                cached: entry.transferSize === 0,
                timestamp: Date.now()
            };

            console.log(`📊 Module Performance - ${moduleName}:`, performance);
        }
    }

    getModuleNameFromPath(path) {
        for (const [name, config] of this.moduleRegistry) {
            if (path.includes(config.path)) {
                return name;
            }
        }
        return null;
    }

    async loadCriticalModules() {
        const criticalModules = Array.from(this.moduleRegistry.entries())
            .filter(([_, config]) => config.priority === 'critical')
            .map(([name]) => name);

        console.log('🚀 Loading critical modules:', criticalModules);

        for (const moduleName of criticalModules) {
            await this.loadModule(moduleName);
        }
    }

    async loadModule(moduleName, options = {}) {
        const config = this.moduleRegistry.get(moduleName);
        if (!config) {
            throw new Error(`Module not found: ${moduleName}`);
        }

        // Return existing promise if module is already loading
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }

        // Return immediately if already loaded
        if (this.loadedModules.has(moduleName)) {
            return Promise.resolve();
        }

        // Check if module failed before
        if (this.failedModules.has(moduleName)) {
            console.warn(`⚠️ Module ${moduleName} previously failed, retrying...`);
        }

        // Load dependencies first
        if (config.dependencies.length > 0) {
            await Promise.all(
                config.dependencies.map(dep => this.loadModule(dep))
            );
        }

        // Create loading promise
        const loadingPromise = this.createModuleLoadingPromise(moduleName, config, options);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            await loadingPromise;
            this.loadedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);
            console.log(`✅ Module loaded: ${moduleName}`);
        } catch (error) {
            this.failedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);
            console.error(`❌ Module failed to load: ${moduleName}`, error);
            throw error;
        }
    }

    createModuleLoadingPromise(moduleName, config, options) {
        return new Promise((resolve, reject) => {
            // Check performance budget
            if (!this.checkPerformanceBudget(config)) {
                console.warn(`⚠️ Module ${moduleName} exceeds performance budget`);
            }

            // Create script element
            const script = document.createElement('script');
            script.src = config.path;
            script.async = true;

            // Set loading priority if supported
            if ('importance' in script) {
                script.importance = this.mapPriorityToImportance(config.priority);
            }

            // Add integrity check if available
            if (options.integrity) {
                script.integrity = options.integrity;
                script.crossOrigin = 'anonymous';
            }

            // Set up event handlers
            const cleanup = () => {
                script.removeEventListener('load', onLoad);
                script.removeEventListener('error', onError);
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };

            const onLoad = () => {
                cleanup();
                resolve();
            };

            const onError = () => {
                cleanup();
                reject(new Error(`Failed to load module: ${moduleName}`));
            };

            script.addEventListener('load', onLoad);
            script.addEventListener('error', onError);

            // Add to document
            document.head.appendChild(script);
        });
    }

    checkPerformanceBudget(config) {
        const budget = this.budgets[config.priority];
        return config.size <= budget;
    }

    mapPriorityToImportance(priority) {
        const mapping = {
            critical: 'high',
            high: 'high',
            medium: 'auto',
            low: 'low'
        };
        return mapping[priority] || 'auto';
    }

    // Dynamic import with code splitting
    async importModule(moduleName) {
        const config = this.moduleRegistry.get(moduleName);
        if (!config) {
            throw new Error(`Module not found: ${moduleName}`);
        }

        try {
            // Use dynamic import for better code splitting
            const module = await import(config.path);
            console.log(`📦 Dynamic import successful: ${moduleName}`);
            return module;
        } catch (error) {
            console.error(`❌ Dynamic import failed: ${moduleName}`, error);
            // Fallback to script loading
            await this.loadModule(moduleName);
        }
    }

    // Preload modules based on user interaction
    setupInteractionPreloading() {
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
        const interactiveModules = Array.from(this.moduleRegistry.entries())
            .filter(([_, config]) => config.loadTrigger === 'interaction')
            .map(([name]) => name);

        console.log('🎯 Preloading interactive modules:', interactiveModules);

        for (const moduleName of interactiveModules) {
            this.preloadModule(moduleName);
        }
    }

    preloadModule(moduleName) {
        const config = this.moduleRegistry.get(moduleName);
        if (!config) return;

        // Use link preload for better browser optimization
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = config.path;
        
        if (config.priority === 'critical' || config.priority === 'high') {
            link.importance = 'high';
        }

        document.head.appendChild(link);
        console.log(`🔗 Preloading module: ${moduleName}`);
    }

    // Load modules based on viewport visibility
    setupViewportBasedLoading() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for browsers without intersection observer
            this.loadAllModules();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const modules = element.dataset.modules?.split(',') || [];
                    
                    modules.forEach(moduleName => {
                        this.loadModule(moduleName.trim());
                    });
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });

        // Observe elements that need specific modules
        document.querySelectorAll('[data-modules]').forEach(el => {
            observer.observe(el);
        });
    }

    // Load modules when browser is idle
    setupIdleLoading() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                this.loadIdleModules();
            });
        } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
                this.loadIdleModules();
            }, 2000);
        }
    }

    async loadIdleModules() {
        const idleModules = Array.from(this.moduleRegistry.entries())
            .filter(([_, config]) => config.loadTrigger === 'idle')
            .map(([name]) => name);

        console.log('😴 Loading idle modules:', idleModules);

        for (const moduleName of idleModules) {
            await this.loadModule(moduleName);
        }
    }

    async loadAllModules() {
        // Fallback method to load all modules
        const allModules = Array.from(this.moduleRegistry.keys());
        
        for (const moduleName of allModules) {
            if (!this.loadedModules.has(moduleName)) {
                try {
                    await this.loadModule(moduleName);
                } catch (error) {
                    console.warn(`Failed to load module in fallback mode: ${moduleName}`, error);
                }
            }
        }
    }

    // Public API
    getLoadedModules() {
        return Array.from(this.loadedModules);
    }

    getModuleStatus(moduleName) {
        if (this.loadedModules.has(moduleName)) return 'loaded';
        if (this.loadingPromises.has(moduleName)) return 'loading';
        if (this.failedModules.has(moduleName)) return 'failed';
        return 'not-loaded';
    }

    getPerformanceReport() {
        return {
            loaded: this.loadedModules.size,
            failed: this.failedModules.size,
            loading: this.loadingPromises.size,
            total: this.moduleRegistry.size
        };
    }
}

// Initialize code splitter
window.codeSplitter = new CodeSplitter();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CodeSplitter;
}