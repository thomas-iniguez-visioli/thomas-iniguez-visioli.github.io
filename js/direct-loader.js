/**
 * Direct Loader - Chargement immédiat de tous les modules
 * Remplace le système de lazy loading par un chargement direct
 */

(function() {
    'use strict';
    
    // Configuration pour le chargement direct
    const DIRECT_LOAD_CONFIG = {
        loadImmediately: true,
        skipLazyLoading: true,
        preloadAll: true
    };
    
    // Initialisation immédiate de tous les modules
    function initializeAllModules() {
        // Marquer le body comme chargé immédiatement
        document.body.classList.add('loaded');
        
        // Charger toutes les images immédiatement
        loadAllImages();
        
        // Initialiser tous les composants
        initializeComponents();
        
        // Démarrer les animations
        startAnimations();
    }
    
    // Charger toutes les images sans lazy loading
    function loadAllImages() {
        const images = document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.classList.remove('lazy-image');
                img.classList.add('direct-image');
            }
        });
        
        // Charger les backgrounds lazy
        const backgrounds = document.querySelectorAll('[data-bg-src]');
        backgrounds.forEach(el => {
            if (el.dataset.bgSrc) {
                el.style.backgroundImage = `url(${el.dataset.bgSrc})`;
                el.removeAttribute('data-bg-src');
            }
        });
    }
    
    // Initialiser tous les composants immédiatement
    function initializeComponents() {
        // Newsletter
        if (window.Newsletter) {
            window.Newsletter.init(DIRECT_LOAD_CONFIG);
        }
        
        // Matrix Animation
        if (window.MatrixAnimation) {
            window.MatrixAnimation.init(DIRECT_LOAD_CONFIG);
        }
        
        // Glitch Effects
        if (window.GlitchEffects) {
            window.GlitchEffects.init(DIRECT_LOAD_CONFIG);
        }
        
        // Responsive Handler
        if (window.ResponsiveHandler) {
            window.ResponsiveHandler.init(DIRECT_LOAD_CONFIG);
        }
        
        // Performance Monitor (mais sans optimisations lazy)
        if (window.PerformanceMonitor) {
            window.PerformanceMonitor.init({
                ...DIRECT_LOAD_CONFIG,
                monitorLazyLoading: false
            });
        }
    }
    
    // Démarrer toutes les animations immédiatement
    function startAnimations() {
        // Démarrer l'animation matrix
        const canvas = document.getElementById('matrix-canvas');
        if (canvas && window.MatrixAnimation) {
            window.MatrixAnimation.start();
        }
        
        // Démarrer les effets glitch
        const glitchElements = document.querySelectorAll('.logo-glitch, .glitch-text');
        glitchElements.forEach(el => {
            if (window.GlitchEffects) {
                window.GlitchEffects.applyTo(el);
            }
        });
    }
    
    // Désactiver tous les systèmes de lazy loading
    function disableLazyLoading() {
        // Désactiver Intersection Observer si présent
        if (window.IntersectionObserver) {
            const originalObserver = window.IntersectionObserver;
            window.IntersectionObserver = function(callback, options) {
                // Exécuter le callback immédiatement pour tous les éléments
                const observer = new originalObserver(callback, options);
                const originalObserve = observer.observe;
                observer.observe = function(target) {
                    // Simuler que l'élément est visible immédiatement
                    callback([{
                        target: target,
                        isIntersecting: true,
                        intersectionRatio: 1
                    }]);
                    return originalObserve.call(this, target);
                };
                return observer;
            };
        }
        
        // Désactiver les attributs loading="lazy"
        const lazyElements = document.querySelectorAll('[loading="lazy"]');
        lazyElements.forEach(el => {
            el.removeAttribute('loading');
        });
    }
    
    // Initialisation immédiate
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            disableLazyLoading();
            initializeAllModules();
        });
    } else {
        disableLazyLoading();
        initializeAllModules();
    }
    
    // Export pour utilisation globale
    window.DirectLoader = {
        init: initializeAllModules,
        loadAllImages: loadAllImages,
        disableLazyLoading: disableLazyLoading,
        config: DIRECT_LOAD_CONFIG
    };
    
})();