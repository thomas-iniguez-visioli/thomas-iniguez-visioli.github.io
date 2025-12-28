/**
 * Performance Monitoring for Matrix Flow Theme
 * Tracks loading times, resource usage, and optimization effectiveness
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTimes: {},
            resourceSizes: {},
            criticalPath: {},
            userTiming: {}
        };

        this.init();
    }

    init() {
        // Wait for page load to collect metrics
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.collectMetrics());
        } else {
            this.collectMetrics();
        }

        // Collect additional metrics after full load
        window.addEventListener('load', () => this.collectLoadMetrics());
    }

    collectMetrics() {
        this.collectNavigationTiming();
        this.collectResourceTiming();
        this.collectCriticalPathMetrics();
        this.startUserTimingCollection();
    }

    collectNavigationTiming() {
        if (!('performance' in window) || !performance.timing) return;

        const timing = performance.timing;
        const navigation = performance.navigation;

        this.metrics.loadTimes = {
            // DNS lookup time
            dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,

            // TCP connection time
            tcpConnection: timing.connectEnd - timing.connectStart,

            // Request time
            request: timing.responseStart - timing.requestStart,

            // Response time
            response: timing.responseEnd - timing.responseStart,

            // DOM processing time
            domProcessing: timing.domComplete - timing.domLoading,

            // Total page load time
            totalLoad: timing.loadEventEnd - timing.navigationStart,

            // Time to first byte
            ttfb: timing.responseStart - timing.navigationStart,

            // DOM content loaded
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,

            // Navigation type
            navigationType: navigation.type
        };

        console.log('📊 Navigation Timing:', this.metrics.loadTimes);
    }

    collectResourceTiming() {
        if (!('performance' in window) || !performance.getEntriesByType) return;

        const resources = performance.getEntriesByType('resource');

        resources.forEach(resource => {
            const type = this.getResourceType(resource.name);

            if (!this.metrics.resourceSizes[type]) {
                this.metrics.resourceSizes[type] = {
                    count: 0,
                    totalSize: 0,
                    totalDuration: 0,
                    resources: []
                };
            }

            const size = resource.transferSize || resource.encodedBodySize || 0;
            const duration = resource.responseEnd - resource.startTime;

            this.metrics.resourceSizes[type].count++;
            this.metrics.resourceSizes[type].totalSize += size;
            this.metrics.resourceSizes[type].totalDuration += duration;
            this.metrics.resourceSizes[type].resources.push({
                name: resource.name,
                size: size,
                duration: duration,
                cached: resource.transferSize === 0
            });
        });

        console.log('📦 Resource Timing:', this.metrics.resourceSizes);
    }

    getResourceType(url) {
        if (url.includes('.css')) return 'css';
        if (url.includes('.js')) return 'javascript';
        if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) return 'image';
        if (url.includes('font')) return 'font';
        return 'other';
    }

    collectCriticalPathMetrics() {
        // Measure critical CSS effectiveness
        const criticalCSS = document.querySelector('style');
        if (criticalCSS) {
            this.metrics.criticalPath.criticalCSSSize = criticalCSS.textContent.length;
        }

        // Measure render-blocking resources
        const renderBlockingCSS = document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])');
        const renderBlockingJS = document.querySelectorAll('script:not([async]):not([defer])');

        this.metrics.criticalPath.renderBlockingCSS = renderBlockingCSS.length;
        this.metrics.criticalPath.renderBlockingJS = renderBlockingJS.length;

        // Measure first paint and first contentful paint
        if ('performance' in window && performance.getEntriesByType) {
            const paintEntries = performance.getEntriesByType('paint');
            paintEntries.forEach(entry => {
                this.metrics.criticalPath[entry.name] = entry.startTime;
            });
        }

        console.log('🎨 Critical Path Metrics:', this.metrics.criticalPath);
    }

    startUserTimingCollection() {
        // Mark important events
        this.mark('matrix-animation-start');
        this.mark('lazy-loader-init');
        this.mark('newsletter-widget-ready');

        // Measure module loading times
        if (window.moduleLoader) {
            const originalLoadModule = window.moduleLoader.loadModule.bind(window.moduleLoader);
            window.moduleLoader.loadModule = async (src, options) => {
                const startTime = performance.now();
                this.mark(`module-load-start-${src}`);

                try {
                    const result = await originalLoadModule(src, options);
                    const endTime = performance.now();
                    this.mark(`module-load-end-${src}`);
                    this.measure(`module-load-${src}`, `module-load-start-${src}`, `module-load-end-${src}`);

                    console.log(`⚡ Module loaded: ${src} in ${(endTime - startTime).toFixed(2)}ms`);
                    return result;
                } catch (error) {
                    this.mark(`module-load-error-${src}`);
                    throw error;
                }
            };
        }
    }

    collectLoadMetrics() {
        // Collect Core Web Vitals if available
        this.collectCoreWebVitals();

        // Generate performance report
        this.generateReport();
    }

    collectCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    this.metrics.userTiming.lcp = lastEntry.startTime;
                    console.log('🎯 LCP:', lastEntry.startTime);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

                // First Input Delay (FID)
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        this.metrics.userTiming.fid = entry.processingStart - entry.startTime;
                        console.log('⚡ FID:', entry.processingStart - entry.startTime);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });

            } catch (error) {
                console.warn('Core Web Vitals collection failed:', error);
            }
        }

        // Cumulative Layout Shift (CLS) - simplified measurement
        let clsScore = 0;
        if ('PerformanceObserver' in window) {
            try {
                const clsObserver = new PerformanceObserver((list) => {
                    list.getEntries().forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    });
                    this.metrics.userTiming.cls = clsScore;
                    console.log('📐 CLS:', clsScore);
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (error) {
                console.warn('CLS measurement failed:', error);
            }
        }
    }

    mark(name) {
        if ('performance' in window && performance.mark) {
            performance.mark(name);
        }
    }

    measure(name, startMark, endMark) {
        if ('performance' in window && performance.measure) {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                this.metrics.userTiming[name] = measure.duration;
            } catch (error) {
                console.warn(`Failed to measure ${name}:`, error);
            }
        }
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics: this.metrics,
            recommendations: this.generateRecommendations()
        };

        console.log('📈 Performance Report:', report);

        // Store report for analytics (if needed)
        this.storeReport(report);

        return report;
    }

    generateRecommendations() {
        const recommendations = [];

        // Check load times
        if (this.metrics.loadTimes.totalLoad > 3000) {
            recommendations.push('Consider optimizing total page load time (>3s)');
        }

        if (this.metrics.loadTimes.ttfb > 800) {
            recommendations.push('Server response time could be improved (TTFB >800ms)');
        }

        // Check resource sizes
        Object.entries(this.metrics.resourceSizes).forEach(([type, data]) => {
            if (type === 'css' && data.totalSize > 50000) {
                recommendations.push('CSS bundle size is large, consider code splitting');
            }
            if (type === 'javascript' && data.totalSize > 100000) {
                recommendations.push('JavaScript bundle size is large, consider code splitting');
            }
        });

        // Check critical path
        if (this.metrics.criticalPath.renderBlockingCSS > 2) {
            recommendations.push('Too many render-blocking CSS files');
        }

        if (this.metrics.criticalPath.renderBlockingJS > 1) {
            recommendations.push('Consider making JavaScript non-render-blocking');
        }

        return recommendations;
    }

    storeReport(report) {
        // Store in localStorage for development
        if (typeof Storage !== 'undefined') {
            const reports = JSON.parse(localStorage.getItem('performanceReports') || '[]');
            reports.push(report);

            // Keep only last 10 reports
            if (reports.length > 10) {
                reports.splice(0, reports.length - 10);
            }

            localStorage.setItem('performanceReports', JSON.stringify(reports));
        }
    }

    // Public API
    getMetrics() {
        return this.metrics;
    }

    getReport() {
        return this.generateReport();
    }
}

// Initialize performance monitoring
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}