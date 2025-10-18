/**
 * Content Components JavaScript
 * Interactive functionality for cards, buttons, navigation, and forms
 */

(function() {
    'use strict';
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        initSearchForms();
        initNavigationDropdowns();
        initButtonLoading();
        initCardInteractions();
        initFormValidation();
    }
    
    /**
     * Initialize search form functionality
     */
    function initSearchForms() {
        const searchForms = document.querySelectorAll('.form-search');
        
        searchForms.forEach(form => {
            const input = form.querySelector('.form-input');
            const clearBtn = form.querySelector('.form-search-clear');
            
            if (!input || !clearBtn) return;
            
            // Show/hide clear button based on input value
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    form.classList.add('has-value');
                } else {
                    form.classList.remove('has-value');
                }
            });
            
            // Clear input when clear button is clicked
            clearBtn.addEventListener('click', function() {
                input.value = '';
                form.classList.remove('has-value');
                input.focus();
            });
        });
    }
    
    /**
     * Initialize navigation dropdown functionality
     */
    function initNavigationDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.nav-dropdown-toggle');
            const menu = dropdown.querySelector('.nav-dropdown-menu');
            
            if (!toggle || !menu) return;
            
            // Toggle dropdown on click
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close other dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('open');
                    }
                });
                
                dropdown.classList.toggle('open');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });
            
            // Handle keyboard navigation
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    dropdown.classList.toggle('open');
                }
                
                if (e.key === 'Escape') {
                    dropdown.classList.remove('open');
                    toggle.focus();
                }
            });
        });
    }
    
    /**
     * Initialize button loading states
     */
    function initButtonLoading() {
        const buttons = document.querySelectorAll('.btn[data-loading]');
        
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                if (this.classList.contains('btn-loading')) return;
                
                this.classList.add('btn-loading');
                
                // Remove loading state after specified time or default 2 seconds
                const loadingTime = parseInt(this.dataset.loading) || 2000;
                setTimeout(() => {
                    this.classList.remove('btn-loading');
                }, loadingTime);
            });
        });
    }
    
    /**
     * Initialize card interactions
     */
    function initCardInteractions() {
        const cards = document.querySelectorAll('.card');
        
        cards.forEach(card => {
            // Add keyboard navigation for clickable cards
            const cardLink = card.querySelector('.card-title a');
            if (cardLink) {
                card.setAttribute('tabindex', '0');
                card.setAttribute('role', 'article');
                
                card.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        cardLink.click();
                    }
                });
            }
            
            // Handle card hover effects with reduced motion support
            if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-4px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                });
            }
        });
    }
    
    /**
     * Initialize form validation
     */
    function initFormValidation() {
        const forms = document.querySelectorAll('.form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('.form-input, .form-textarea, .form-select');
            
            inputs.forEach(input => {
                // Real-time validation
                input.addEventListener('blur', function() {
                    validateField(this);
                });
                
                input.addEventListener('input', function() {
                    // Clear error state when user starts typing
                    const formGroup = this.closest('.form-group');
                    if (formGroup && formGroup.classList.contains('has-error')) {
                        formGroup.classList.remove('has-error');
                        const errorMsg = formGroup.querySelector('.form-error');
                        if (errorMsg) errorMsg.remove();
                    }
                });
            });
            
            // Form submission validation
            form.addEventListener('submit', function(e) {
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!validateField(input)) {
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    // Focus first invalid field
                    const firstError = form.querySelector('.has-error .form-input, .has-error .form-textarea, .has-error .form-select');
                    if (firstError) firstError.focus();
                }
            });
        });
    }
    
    /**
     * Validate individual form field
     */
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;
        
        const label = formGroup.querySelector('.form-label');
        const isRequired = label && label.classList.contains('form-label-required');
        const value = field.value.trim();
        
        // Clear previous validation state
        formGroup.classList.remove('has-error', 'has-success');
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) existingError.remove();
        
        // Required field validation
        if (isRequired && !value) {
            showFieldError(formGroup, 'This field is required');
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(formGroup, 'Please enter a valid email address');
                return false;
            }
        }
        
        // URL validation
        if (field.type === 'url' && value) {
            try {
                new URL(value);
            } catch {
                showFieldError(formGroup, 'Please enter a valid URL');
                return false;
            }
        }
        
        // Show success state for valid fields
        if (value) {
            formGroup.classList.add('has-success');
        }
        
        return true;
    }
    
    /**
     * Show field error message
     */
    function showFieldError(formGroup, message) {
        formGroup.classList.add('has-error');
        
        const errorElement = document.createElement('p');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        
        const helpText = formGroup.querySelector('.form-help');
        if (helpText) {
            helpText.parentNode.insertBefore(errorElement, helpText.nextSibling);
        } else {
            formGroup.appendChild(errorElement);
        }
    }
    
    /**
     * Utility function to handle reduced motion preferences
     */
    function respectsReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    /**
     * Utility function for smooth scrolling with reduced motion support
     */
    function smoothScrollTo(element, options = {}) {
        if (respectsReducedMotion()) {
            element.scrollIntoView();
        } else {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                ...options
            });
        }
    }
    
    // Export utilities for use by other scripts
    window.ContentComponents = {
        respectsReducedMotion,
        smoothScrollTo,
        validateField
    };
    
})();