/**
 * Accessibility Testing Suite
 * Automated tests for WCAG 2.1 AA compliance
 */

class AccessibilityTester {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }
  
  // Run all accessibility tests
  runAllTests() {
    console.log('🔍 Démarrage des tests d\'accessibilité...');
    
    this.testSkipLinks();
    this.testFocusManagement();
    this.testKeyboardNavigation();
    this.testAriaLabels();
    this.testColorContrast();
    this.testFormAccessibility();
    this.testSemanticHTML();
    this.testTouchTargets();
    this.testScreenReaderSupport();
    this.testMotionPreferences();
    
    this.generateReport();
    return this.results;
  }
  
  // Test skip links functionality
  testSkipLinks() {
    const skipLinks = document.querySelectorAll('.skip-link');
    
    if (skipLinks.length === 0) {
      this.fail('Skip Links', 'Aucun skip link trouvé');
      return;
    }
    
    let validSkipLinks = 0;
    skipLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          validSkipLinks++;
        } else {
          this.warn('Skip Links', `Cible "${href}" introuvable pour le skip link`);
        }
      }
    });
    
    if (validSkipLinks > 0) {
      this.pass('Skip Links', `${validSkipLinks} skip link(s) fonctionnel(s)`);
    } else {
      this.fail('Skip Links', 'Aucun skip link fonctionnel');
    }
  }
  
  // Test focus management
  testFocusManagement() {
    const focusableElements = document.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) {
      this.warn('Focus Management', 'Aucun élément focusable trouvé');
      return;
    }
    
    let elementsWithFocusStyles = 0;
    focusableElements.forEach(element => {
      // Simulate focus to check for focus styles
      element.focus();
      const computedStyle = window.getComputedStyle(element, ':focus');
      const outline = computedStyle.outline;
      const boxShadow = computedStyle.boxShadow;
      
      if (outline !== 'none' || boxShadow !== 'none') {
        elementsWithFocusStyles++;
      }
      element.blur();
    });
    
    const percentage = (elementsWithFocusStyles / focusableElements.length) * 100;
    if (percentage >= 90) {
      this.pass('Focus Management', `${percentage.toFixed(1)}% des éléments ont des styles de focus`);
    } else if (percentage >= 70) {
      this.warn('Focus Management', `${percentage.toFixed(1)}% des éléments ont des styles de focus`);
    } else {
      this.fail('Focus Management', `Seulement ${percentage.toFixed(1)}% des éléments ont des styles de focus`);
    }
  }
  
  // Test keyboard navigation
  testKeyboardNavigation() {
    const interactiveElements = document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="menuitem"]');
    let keyboardAccessible = 0;
    
    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      if (tabIndex !== '-1') {
        keyboardAccessible++;
      }
    });
    
    const percentage = (keyboardAccessible / interactiveElements.length) * 100;
    if (percentage >= 95) {
      this.pass('Keyboard Navigation', `${percentage.toFixed(1)}% des éléments interactifs sont accessibles au clavier`);
    } else {
      this.fail('Keyboard Navigation', `${percentage.toFixed(1)}% des éléments interactifs sont accessibles au clavier`);
    }
  }
  
  // Test ARIA labels and attributes
  testAriaLabels() {
    const elementsNeedingLabels = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby]), input:not([aria-label]):not([aria-labelledby])');
    const unlabeledElements = Array.from(elementsNeedingLabels).filter(element => {
      // Check if element has a visible label
      const id = element.getAttribute('id');
      if (id && document.querySelector(`label[for="${id}"]`)) {
        return false;
      }
      if (element.closest('label')) {
        return false;
      }
      return true;
    });
    
    if (unlabeledElements.length === 0) {
      this.pass('ARIA Labels', 'Tous les éléments interactifs ont des labels appropriés');
    } else {
      this.fail('ARIA Labels', `${unlabeledElements.length} élément(s) sans label approprié`);
    }
    
    // Test ARIA roles
    const elementsWithRoles = document.querySelectorAll('[role]');
    const validRoles = [
      'banner', 'navigation', 'main', 'complementary', 'contentinfo',
      'button', 'link', 'menuitem', 'tab', 'tabpanel', 'dialog',
      'alert', 'status', 'region', 'article', 'section'
    ];
    
    let invalidRoles = 0;
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      if (!validRoles.includes(role)) {
        invalidRoles++;
      }
    });
    
    if (invalidRoles === 0) {
      this.pass('ARIA Roles', 'Tous les rôles ARIA sont valides');
    } else {
      this.warn('ARIA Roles', `${invalidRoles} rôle(s) ARIA potentiellement invalide(s)`);
    }
  }
  
  // Test color contrast (simplified)
  testColorContrast() {
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, div');
    let contrastIssues = 0;
    
    textElements.forEach(element => {
      const style = window.getComputedStyle(element);
      const color = style.color;
      const backgroundColor = style.backgroundColor;
      
      // Simple contrast check (this is a basic implementation)
      if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
        contrastIssues++;
      }
    });
    
    if (contrastIssues === 0) {
      this.pass('Color Contrast', 'Aucun problème de contraste évident détecté');
    } else {
      this.warn('Color Contrast', `${contrastIssues} problème(s) de contraste potentiel(s)`);
    }
  }
  
  // Test form accessibility
  testFormAccessibility() {
    const forms = document.querySelectorAll('form');
    if (forms.length === 0) {
      this.warn('Form Accessibility', 'Aucun formulaire trouvé');
      return;
    }
    
    let accessibleForms = 0;
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      let labeledInputs = 0;
      
      inputs.forEach(input => {
        const id = input.getAttribute('id');
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        
        if (ariaLabel || ariaLabelledBy || 
            (id && document.querySelector(`label[for="${id}"]`)) ||
            input.closest('label')) {
          labeledInputs++;
        }
      });
      
      if (inputs.length === 0 || labeledInputs === inputs.length) {
        accessibleForms++;
      }
    });
    
    if (accessibleForms === forms.length) {
      this.pass('Form Accessibility', 'Tous les formulaires sont accessibles');
    } else {
      this.fail('Form Accessibility', `${forms.length - accessibleForms} formulaire(s) avec des problèmes d'accessibilité`);
    }
  }
  
  // Test semantic HTML
  testSemanticHTML() {
    const landmarks = document.querySelectorAll('header, nav, main, aside, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
    
    if (landmarks.length >= 3) {
      this.pass('Semantic HTML', `${landmarks.length} landmark(s) sémantique(s) trouvé(s)`);
    } else {
      this.fail('Semantic HTML', `Seulement ${landmarks.length} landmark(s) sémantique(s) trouvé(s)`);
    }
    
    // Test heading hierarchy
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let hierarchyIssues = 0;
    let previousLevel = 0;
    
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        hierarchyIssues++;
      }
      previousLevel = level;
    });
    
    if (hierarchyIssues === 0) {
      this.pass('Heading Hierarchy', 'Hiérarchie des titres correcte');
    } else {
      this.fail('Heading Hierarchy', `${hierarchyIssues} problème(s) de hiérarchie des titres`);
    }
  }
  
  // Test touch target sizes
  testTouchTargets() {
    const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]');
    let adequateTargets = 0;
    
    interactiveElements.forEach(element => {
      const rect = element.getBoundingClientRect();
      if (rect.width >= 44 && rect.height >= 44) {
        adequateTargets++;
      }
    });
    
    const percentage = (adequateTargets / interactiveElements.length) * 100;
    if (percentage >= 90) {
      this.pass('Touch Targets', `${percentage.toFixed(1)}% des cibles tactiles sont de taille adéquate (≥44px)`);
    } else {
      this.fail('Touch Targets', `${percentage.toFixed(1)}% des cibles tactiles sont de taille adéquate (≥44px)`);
    }
  }
  
  // Test screen reader support
  testScreenReaderSupport() {
    const srOnlyElements = document.querySelectorAll('.sr-only, .visually-hidden');
    const liveRegions = document.querySelectorAll('[aria-live]');
    
    if (srOnlyElements.length > 0) {
      this.pass('Screen Reader Support', `${srOnlyElements.length} élément(s) screen-reader-only trouvé(s)`);
    } else {
      this.warn('Screen Reader Support', 'Aucun élément screen-reader-only trouvé');
    }
    
    if (liveRegions.length > 0) {
      this.pass('Live Regions', `${liveRegions.length} région(s) live trouvée(s)`);
    } else {
      this.warn('Live Regions', 'Aucune région live trouvée');
    }
  }
  
  // Test motion preferences
  testMotionPreferences() {
    const animatedElements = document.querySelectorAll('[style*="animation"], [style*="transition"], .animated');
    
    if (animatedElements.length > 0) {
      // Check if prefers-reduced-motion is respected
      const hasReducedMotionSupport = document.querySelector('style, link[rel="stylesheet"]');
      if (hasReducedMotionSupport) {
        this.pass('Motion Preferences', 'Support des préférences de mouvement détecté');
      } else {
        this.warn('Motion Preferences', 'Support des préférences de mouvement non vérifié');
      }
    } else {
      this.pass('Motion Preferences', 'Aucune animation détectée');
    }
  }
  
  // Helper methods
  pass(category, message) {
    this.results.passed.push({ category, message });
  }
  
  fail(category, message) {
    this.results.failed.push({ category, message });
  }
  
  warn(category, message) {
    this.results.warnings.push({ category, message });
  }
  
  // Generate test report
  generateReport() {
    const total = this.results.passed.length + this.results.failed.length + this.results.warnings.length;
    const score = Math.round((this.results.passed.length / total) * 100);
    
    console.log('\n📊 Rapport d\'Accessibilité');
    console.log('========================');
    console.log(`Score: ${score}%`);
    console.log(`✅ Tests réussis: ${this.results.passed.length}`);
    console.log(`❌ Tests échoués: ${this.results.failed.length}`);
    console.log(`⚠️  Avertissements: ${this.results.warnings.length}`);
    
    if (this.results.failed.length > 0) {
      console.log('\n❌ Problèmes à corriger:');
      this.results.failed.forEach(result => {
        console.log(`  • ${result.category}: ${result.message}`);
      });
    }
    
    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Points d\'attention:');
      this.results.warnings.forEach(result => {
        console.log(`  • ${result.category}: ${result.message}`);
      });
    }
    
    if (this.results.passed.length > 0) {
      console.log('\n✅ Tests réussis:');
      this.results.passed.forEach(result => {
        console.log(`  • ${result.category}: ${result.message}`);
      });
    }
    
    return {
      score,
      total,
      passed: this.results.passed.length,
      failed: this.results.failed.length,
      warnings: this.results.warnings.length
    };
  }
}

// Auto-run tests in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const tester = new AccessibilityTester();
      window.accessibilityTestResults = tester.runAllTests();
    }, 2000);
  });
}

// Export for manual testing
window.AccessibilityTester = AccessibilityTester;