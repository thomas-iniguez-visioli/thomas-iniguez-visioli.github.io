/**
 * CORRECTION D'URGENCE JAVASCRIPT - Problèmes de Superposition
 * Script à charger en dernier pour forcer les corrections
 */

(function() {
  'use strict';

  console.log('🚨 Correction d\'urgence des problèmes de superposition activée');

  // Fonction pour forcer les z-index
  function forceZIndex() {
    // Définir les variables CSS si elles n'existent pas
    const root = document.documentElement;
    const zIndexVars = {
      '--z-index-hide': '-1',
      '--z-index-auto': 'auto',
      '--z-index-base': '0',
      '--z-index-docked': '10',
      '--z-index-dropdown': '1000',
      '--z-index-sticky': '1100',
      '--z-index-banner': '1200',
      '--z-index-overlay': '1300',
      '--z-index-modal': '1400',
      '--z-index-popover': '1500',
      '--z-index-skiplink': '1600',
      '--z-index-toast': '1700',
      '--z-index-tooltip': '1800'
    };

    Object.entries(zIndexVars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });

    // Forcer le positionnement des éléments critiques
    const header = document.querySelector('.page-header, .dev-header, header');
    if (header) {
      header.style.position = 'sticky';
      header.style.top = '0';
      header.style.zIndex = '1100';
     // header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      header.style.backdropFilter = 'blur(12px)';
      header.style.webkitBackdropFilter = 'blur(12px)';
    //  header.style.borderBottom = '1px solid #e2e8f0';
      header.style.width = '100%';
      header.style.isolation = 'isolate';
    }

    const sidebar = document.querySelector('.dev-sidebar, #dev-sidebar, aside.dev-sidebar');
    if (sidebar) {
      if (window.innerWidth > 1023) {
        sidebar.style.position = 'sticky';
        sidebar.style.top = '0';
        sidebar.style.zIndex = '10';
      } else {
        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.left = '0';
        sidebar.style.zIndex = '1400';
        sidebar.style.width = '320px';
        sidebar.style.height = '100vh';
        sidebar.style.transform = 'translateX(-100%)';
        sidebar.style.transition = 'transform 0.3s ease-out';
     //   sidebar.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
      }
      sidebar.style.overflowY = 'auto';
      sidebar.style.overflowX = 'hidden';
      sidebar.style.isolation = 'isolate';
    }

    const toggle = document.querySelector('.dev-sidebar-toggle');
    if (toggle && window.innerWidth <= 1023) {
      toggle.style.position = 'fixed';
      toggle.style.top = '1rem';
      toggle.style.right = '1rem';
      toggle.style.zIndex = '1402';
     // toggle.style.background = '#252526';
     // toggle.style.border = '1px solid #3e3e42';
      toggle.style.borderRadius = '6px';
      toggle.style.padding = '12px';
      toggle.style.cursor = 'pointer';
      toggle.style.display = 'flex';
    }

    console.log('✅ Z-index forcés appliqués');
  }

  // Fonction pour créer et gérer le backdrop
  function ensureBackdrop() {
    let backdrop = document.querySelector('.dev-sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'dev-sidebar-backdrop';
      backdrop.style.position = 'fixed';
      backdrop.style.top = '0';
      backdrop.style.left = '0';
      backdrop.style.width = '100%';
      backdrop.style.height = '100%';
     // backdrop.style.background = 'rgba(0, 0, 0, 0.5)';
      backdrop.style.zIndex = '1399';
      backdrop.style.opacity = '0';
      backdrop.style.visibility = 'hidden';
      backdrop.style.transition = 'opacity 0.15s ease-in-out';
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  // Fonction pour gérer la sidebar mobile
  function setupMobileSidebar() {
    const sidebar = document.querySelector('.dev-sidebar, #dev-sidebar, aside.dev-sidebar');
    const toggle = document.querySelector('.dev-sidebar-toggle');
    const backdrop = ensureBackdrop();

    if (!sidebar || !toggle) return;

    // Gestionnaire de clic pour le toggle
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isOpen = sidebar.classList.contains('dev-sidebar-open') || 
                     sidebar.classList.contains('dev-sidebar--open');
      
      if (isOpen) {
        // Fermer
        sidebar.classList.remove('dev-sidebar-open', 'dev-sidebar--open');
        sidebar.style.transform = 'translateX(-100%)';
        backdrop.style.opacity = '0';
        backdrop.style.visibility = 'hidden';
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('sidebar-open');
      } else {
        // Ouvrir
        sidebar.classList.add('dev-sidebar-open', 'dev-sidebar--open');
        sidebar.style.transform = 'translateX(0)';
        backdrop.style.opacity = '1';
        backdrop.style.visibility = 'visible';
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('sidebar-open');
      }
    });

    // Gestionnaire de clic pour le backdrop
    backdrop.addEventListener('click', function() {
      sidebar.classList.remove('dev-sidebar-open', 'dev-sidebar--open');
      sidebar.style.transform = 'translateX(-100%)';
      backdrop.style.opacity = '0';
      backdrop.style.visibility = 'hidden';
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('sidebar-open');
    });

    console.log('✅ Sidebar mobile configurée');
  }

  // Fonction pour gérer le responsive
  function handleResponsive() {
    const sidebar = document.querySelector('.dev-sidebar, #dev-sidebar, aside.dev-sidebar');
    const toggle = document.querySelector('.dev-sidebar-toggle');
    const backdrop = document.querySelector('.dev-sidebar-backdrop');

    if (!sidebar) return;

    if (window.innerWidth <= 1023) {
      // Mode mobile
      sidebar.style.position = 'fixed';
      sidebar.style.zIndex = '1400';
      if (toggle) {
        toggle.style.display = 'flex';
        toggle.style.position = 'fixed';
        toggle.style.zIndex = '1402';
      }
    } else {
      // Mode desktop
      sidebar.style.position = 'sticky';
      sidebar.style.zIndex = '10';
      sidebar.style.transform = 'translateX(0)';
      sidebar.classList.remove('dev-sidebar-open', 'dev-sidebar--open');
      
      if (toggle) {
        toggle.style.display = 'none';
        toggle.setAttribute('aria-expanded', 'false');
      }
      
      if (backdrop) {
        backdrop.style.opacity = '0';
        backdrop.style.visibility = 'hidden';
      }
      
      document.body.classList.remove('sidebar-open');
    }
  }

  // Fonction pour corriger les overflow
  function fixOverflow() {
    document.body.style.overflowX = 'hidden';
    document.body.style.maxWidth = '100vw';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.maxWidth = '100vw';

    const containers = document.querySelectorAll('.dev-container, .container, .dev-content-wrapper');
    containers.forEach(container => {
      container.style.width = '100%';
      container.style.maxWidth = '100%';
      container.style.overflowX = 'hidden';
      container.style.boxSizing = 'border-box';
    });

    console.log('✅ Overflow corrigé');
  }

  // Fonction pour corriger les layouts
  function fixLayouts() {
    const pageGrid = document.querySelector('.dev-page-grid, .page-grid');
    if (pageGrid) {
      pageGrid.style.display = 'flex';
      pageGrid.style.flexDirection = 'column';
      pageGrid.style.minHeight = '100vh';
      pageGrid.style.overflowX = 'hidden';
      pageGrid.style.isolation = 'isolate';
    }

    const layoutContainer = document.querySelector('.dev-layout-container, .layout-with-sidebar');
    if (layoutContainer) {
      layoutContainer.style.display = 'flex';
      layoutContainer.style.flex = '1';
      layoutContainer.style.overflowX = 'hidden';
      layoutContainer.style.maxWidth = '100vw';
      layoutContainer.style.isolation = 'isolate';
      
      if (window.innerWidth <= 1023) {
        layoutContainer.style.flexDirection = 'column';
      }
    }

    const mainContent = document.querySelector('.dev-main-content, .main-content');
    if (mainContent) {
      mainContent.style.flex = '1';
      mainContent.style.minWidth = '0';
      mainContent.style.overflowX = 'hidden';
      mainContent.style.width = '100%';
      mainContent.style.isolation = 'isolate';
    }

    console.log('✅ Layouts corrigés');
  }

  // Fonction principale d'initialisation
  function initEmergencyFix() {
    console.log('🔧 Initialisation des corrections d\'urgence...');
    
    // Appliquer toutes les corrections
    forceZIndex();
    fixOverflow();
    fixLayouts();
    
    // Configurer la sidebar mobile si nécessaire
    if (window.innerWidth <= 1023) {
      setupMobileSidebar();
    }
    
    // Gérer le responsive
    handleResponsive();
    
    console.log('✅ Corrections d\'urgence appliquées avec succès');
  }

  // Gestionnaire de redimensionnement
  function handleResize() {
    handleResponsive();
    forceZIndex();
  }

  // Initialiser quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmergencyFix);
  } else {
    initEmergencyFix();
  }

  // Gérer le redimensionnement
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResize, 100);
  });

  // Réappliquer les corrections après un délai (au cas où d'autres scripts interfèrent)
  setTimeout(function() {
    initEmergencyFix();
    console.log('🔄 Corrections réappliquées après délai');
  }, 1000);

  // Exposer les fonctions pour le debug
  window.EmergencyFix = {
    init: initEmergencyFix,
    forceZIndex: forceZIndex,
    fixOverflow: fixOverflow,
    fixLayouts: fixLayouts,
    handleResponsive: handleResponsive
  };

  console.log('🚨 Correction d\'urgence chargée. Utilisez window.EmergencyFix pour déboguer.');

})();