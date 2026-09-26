/**
 * Advanced Resource Preloader and Hints Manager
 * Implements intelligent resource preloading with priority-based scheduling
 */

class ResourcePreloader {
    constructor() {
        this.preloadedResources = new Set();
        this.preloadQueue = [];
        this.resourceHints = new Map();
        this.performanceObserver = null;
        
        // Resource priorities
        this.priorities = {
            critical: 1,
            high: 2,
            medium: 3,
            low: 4
        };
        
        this.init();
    }

    init() {
        this.setupResourceHints();
        this.setupPerformanceObserver();
        this.preloadCriticalResources();
        this.setupIntersectionObserver();
        this.setupConnectionObserver();
    }

    setupResourceHints() {
        // DNS prefetch for external domains
        this.addDNSPrefetch('fonts.googleapis.com');
        this.addDNSPrefetch('fonts.gstatic.com');
        
        // Preconnect to critical origins
        this.addPreconnect('https://fonts.googleapis.com', true);
        this.addPreconnect('https://fonts.gstatic.com', true);
        
        // Preload critical resources
        this.addPreload('/js/module-loader.js', 'script', 'critical');
        this.addPreload('/js/viewport-manager.js', 'script', 'critical');
        this.addPreload('/js/matrix.js', 'script', 'critical');
        
        // Prefetch likely-needed resources
        this.addPrefetch('/js/newsletter.js', 'script', 'high');
        this.addPrefetch('/js/lazy-loader.js', 'script', 'medium');
        this.addPrefetch('/css/newsletter.css', 'style', 'medium');
    }

    addDNSPrefetch(hostname) {
        if (this.resourceHints.has(`dns-prefetch-${hostname}`)) return;
        
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${hostname}`;
        
        document.head.appendChild(link);
        this.resourceHints.set(`dns-prefetch-${hostname}`, link);
        
        console.log(`🔍 DNS prefetch added: ${hostname}`);
    }

    addPreconnect(origin, crossorigin = false) {
        if (this.resourceHints.has(`preconnect-${origin}`)) return;
        
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        
        if (crossorigin) {
            link.crossOrigin = 'anonymous';
        }
        
        document.head.appendChild(link);
        this.resourceHints.set(`preconnect-${origin}`, link);
        
        console.log(`🔗 Preconnect added: ${origin}`);
    }

    addPreload(href, as, priority = 'medium', options = {}) {
        const key = `preload-${href}`;
        if (this.resourceHints.has(key)) return;
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        // Set importance if supported
        if ('importance' in link) {
            link.importance = this.mapPriorityToImportance(priority);
        }
        
        // Add crossorigin for scripts and styles
        if (as === 'script' || as === 'style') {
            link.crossOrigin = 'anonymous';
        }
        
        // Add integrity if provided
        if (options.integrity) {
            link.integrity = options.integrity;
        }
        
        // Add media query for conditional loading
        if (options.media) {
            link.media = options.media;
        }
        
        document.head.appendChild(link);
        this.resourceHints.set(key, link);
        this.preloadedResources.add(href);
        
        console.log(`⚡ Preload added: ${href} (${as}, ${priority})`);
    }

    addPrefetch(href, as, priority = 'low', options = {}) {
        const key = `prefetch-${href}`;
        if (this.resourceHints.has(key)) return;
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = href;
        link.as = as;
        
        // Add to queue for intelligent loading
        this.preloadQueue.push({
            href,
            as,
            priority,
            options,
            link
        });
        
        // Process queue based on network conditions
        this.processPreloadQueue();
        
        console.log(`📦 Prefetch queued: ${href} (${as}, ${priority})`);
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

    setupPerformanceObserver() {
        if (!('PerformanceObserver' in window)) return;
        
        this.performanceObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach(entry => {
                if (entry.entryType === 'resource') {
                    this.trackResourcePerformance(entry);
                }
            });
        });
        
        this.performanceObserver.observe({ entryTypes: ['resource'] });
    }

    trackResourcePerformance(entry) {
        const isPreloaded = this.preloadedResources.has(entry.name);
        
        if (isPreloaded) {
            const performance = {
                name: entry.name,
                loadTime: entry.responseEnd - entry.startTime,
                transferSize: entry.transferSize,
                cached: entry.transferSize === 0,
                preloaded: true
            };
            
            console.log('📊 Preloaded resource performance:', performance);
        }
    }

    preloadCriticalResources() {
        // Preload critical CSS
        this.addPreload('/css/style.css', 'style', 'critical');
        
        // Preload critical fonts
        this.addPreload('https://fonts.googleapis.com/css2?family=VT323&display=swap', 'style', 'high');
        
        // Preload hero images if they exist
        const heroImages = document.querySelectorAll('img[data-hero]');
        heroImages.forEach(img => {
            if (img.src || img.dataset.src) {
                this.addPreload(img.src || img.dataset.src, 'image', 'high');
            }
        });
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Preload resources for visible elements
                    this.preloadElementResources(element);
                    
                    observer.unobserve(element);
                }
            });
        }, {
            rootMargin: '200px 0px',
            threshold: 0.1
        });
        
        // Observe elements with data-preload attributes
        document.querySelectorAll('[data-preload]').forEach(el => {
            observer.observe(el);
        });
        
        // Observe images for lazy preloading
        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }

    preloadElementResources(element) {
        // Preload images
        if (element.tagName === 'IMG' && element.dataset.src) {
            this.addPreload(element.dataset.src, 'image', 'medium');
        }
        
        // Preload resources specified in data attributes
        if (element.dataset.preload) {
            const resources = JSON.parse(element.dataset.preload);
            resources.forEach(resource => {
                this.addPreload(resource.href, resource.as, resource.priority || 'medium');
            });
        }
        
        // Preload background images
        const computedStyle = window.getComputedStyle(element);
        const backgroundImage = computedStyle.backgroundImage;
        if (backgroundImage && backgroundImage !== 'none') {
            const imageUrl = backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (imageUrl) {
                this.addPreload(imageUrl[1], 'image', 'medium');
            }
        }
    }

    setupConnectionObserver() {
        // Adapt preloading strategy based on connection quality
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            const updateStrategy = () => {
                const effectiveType = connection.effectiveType;
                const saveData = connection.saveData;
                
                if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
                    this.setConservativeStrategy();
                } else if (effectiveType === '3g') {
                    this.setModerateStrategy();
                } else {
                    this.setAggressiveStrategy();
                }
                
                console.log(`📶 Connection strategy updated: ${effectiveType}, saveData: ${saveData}`);
            };
            
            updateStrategy();
            connection.addEventListener('change', updateStrategy);
        }
    }

    setConservativeStrategy() {
        // Only preload critical resources on slow connections
        this.strategy = 'conservative';
        this.clearNonCriticalPreloads();
    }

    setModerateStrategy() {
        // Preload critical and high priority resources
        this.strategy = 'moderate';
        this.processPreloadQueue(['critical', 'high']);
    }

    setAggressiveStrategy() {
        // Preload all queued resources
        this.strategy = 'aggressive';
        this.processPreloadQueue();
    }

    clearNonCriticalPreloads() {
        // Remove non-critical preload hints to save bandwidth
        this.resourceHints.forEach((link, key) => {
            if (key.startsWith('prefetch-') || 
                (key.startsWith('preload-') && !key.includes('critical'))) {
                link.remove();
                this.resourceHints.delete(key);
            }
        });
    }

    processPreloadQueue(allowedPriorities = ['critical', 'high', 'medium', 'low']) {
        const queue = this.preloadQueue
            .filter(item => allowedPriorities.includes(item.priority))
            .sort((a, b) => this.priorities[a.priority] - this.priorities[b.priority]);
        
        queue.forEach(item => {
            if (!this.resourceHints.has(`prefetch-${item.href}`)) {
                document.head.appendChild(item.link);
                this.resourceHints.set(`prefetch-${item.href}`, item.link);
            }
        });
        
        // Clear processed items
        this.preloadQueue = this.preloadQueue.filter(item => 
            !allowedPriorities.includes(item.priority)
        );
    }

    // Preload resources for specific routes/pages
    preloadRoute(routePath) {
        const routeResources = this.getRouteResources(routePath);
        
        routeResources.forEach(resource => {
            this.addPrefetch(resource.href, resource.as, resource.priority);
        });
        
        console.log(`🛣️ Route resources preloaded: ${routePath}`);
    }

    getRouteResources(routePath) {
        // Define resources needed for different routes
        const routeMap = {
            '/': [
                { href: '/js/newsletter.js', as: 'script', priority: 'high' },
                { href: '/css/newsletter.css', as: 'style', priority: 'medium' }
            ],
            '/posts': [
                { href: '/js/lazy-loader.js', as: 'script', priority: 'high' },
                { href: '/css/posts.css', as: 'style', priority: 'medium' }
            ],
            '/about': [
                { href: '/js/contact-form.js', as: 'script', priority: 'medium' }
            ]
        };
        
        return routeMap[routePath] || [];
    }

    // Preload resources based on user behavior
    setupBehaviorBasedPreloading() {
        // Preload on hover for likely navigation
        document.addEventListener('mouseover', (event) => {
            const link = event.target.closest('a[href]');
            if (link && link.hostname === window.location.hostname) {
                const href = link.getAttribute('href');
                this.preloadRoute(href);
            }
        });
        
        // Preload on focus for keyboard navigation
        document.addEventListener('focusin', (event) => {
            const link = event.target.closest('a[href]');
            if (link && link.hostname === window.location.hostname) {
                const href = link.getAttribute('href');
                this.preloadRoute(href);
            }
        });
    }

    // Public API
    getPreloadedResources() {
        return Array.from(this.preloadedResources);
    }

    getResourceHints() {
        return Array.from(this.resourceHints.keys());
    }

    getStrategy() {
        return this.strategy || 'moderate';
    }

    // Manual preload methods
    preloadImage(src, priority = 'medium') {
        this.addPreload(src, 'image', priority);
    }

    preloadScript(src, priority = 'medium') {
        this.addPreload(src, 'script', priority);
    }

    preloadStyle(src, priority = 'medium') {
        this.addPreload(src, 'style', priority);
    }
}

// Initialize resource preloader
document.addEventListener('DOMContentLoaded', () => {
    window.resourcePreloader = new ResourcePreloader();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResourcePreloader;
}