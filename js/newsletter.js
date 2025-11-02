/**
 * Enhanced Newsletter Subscription Component
 * Creates GitHub issues for newsletter subscriptions with advanced validation and analytics
 */

class NewsletterManager {
  constructor() {
    this.form = document.getElementById('newsletter-form');
    this.submitButton = document.getElementById('newsletter-submit');
    this.messageContainer = document.getElementById('newsletter-message');
    this.successContainer = document.getElementById('newsletter-success');
    
    // Configuration with fallbacks
    this.config = {
      github: {
        owner: window.NEWSLETTER_CONFIG?.github_owner || 'your-username',
        repo: window.NEWSLETTER_CONFIG?.github_repo || 'your-repo',
        token: window.NEWSLETTER_CONFIG?.github_token || null
      },
      analytics: {
        enabled: window.NEWSLETTER_CONFIG?.analytics_enabled || false,
        gtag: window.gtag || null,
        customTracker: window.NEWSLETTER_CONFIG?.custom_tracker || null
      },
      validation: {
        realTimeValidation: window.NEWSLETTER_CONFIG?.real_time_validation !== false,
        debounceDelay: window.NEWSLETTER_CONFIG?.debounce_delay || 300
      },
      ui: {
        animationsEnabled: !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        progressiveEnhancement: true
      }
    };
    
    // State management
    this.state = {
      isSubmitting: false,
      validationErrors: new Map(),
      lastSubmissionTime: 0,
      retryCount: 0
    };
    
    // Debounced validation functions
    this.debouncedValidateEmail = this.debounce(this.validateEmail.bind(this), this.config.validation.debounceDelay);
    
    this.init();
  }
  
  init() {
    if (!this.form) {
      console.warn('Newsletter form not found');
      return;
    }
    
    // Progressive enhancement check
    if (!this.config.ui.progressiveEnhancement) {
      this.form.setAttribute('method', 'post');
      this.form.setAttribute('action', '/newsletter/subscribe');
      return;
    }
    
    this.setupEventListeners();
    this.setupValidation();
    this.setupAccessibility();
    this.trackEvent('newsletter_widget_loaded');
    
    // Initialize form state
    this.updateSubmitButtonState();
  }
  
  setupEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Prevent double submission
    this.form.addEventListener('submit', (e) => {
      if (this.state.isSubmitting) {
        e.preventDefault();
        return false;
      }
    });
    
    // Handle browser back/forward
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        this.resetForm();
      }
    });
    
    // Handle network status changes
    window.addEventListener('online', () => {
      this.showMessage('Connexion rétablie. Vous pouvez réessayer.', 'success');
    });
    
    window.addEventListener('offline', () => {
      this.showMessage('Connexion perdue. Vérifiez votre connexion internet.', 'error');
    });
  }
  
  setupValidation() {
    const emailInput = document.getElementById('newsletter-email');
    const frequencySelect = document.getElementById('newsletter-frequency');
    const consentCheckbox = document.getElementById('newsletter-consent');
    
    if (emailInput) {
      // Real-time validation with debouncing
      if (this.config.validation.realTimeValidation) {
        emailInput.addEventListener('input', () => {
          this.clearFieldError('email-error');
          this.debouncedValidateEmail();
        });
      }
      
      emailInput.addEventListener('blur', () => this.validateEmail());
      emailInput.addEventListener('focus', () => this.trackEvent('email_field_focused'));
    }
    
    if (frequencySelect) {
      frequencySelect.addEventListener('change', () => {
        this.validateFrequency();
        this.trackEvent('frequency_selected', { frequency: frequencySelect.value });
      });
    }
    
    if (consentCheckbox) {
      consentCheckbox.addEventListener('change', () => {
        this.validateConsent();
        this.trackEvent('consent_toggled', { consented: consentCheckbox.checked });
      });
    }
    
    // Topic checkboxes
    const topicCheckboxes = document.querySelectorAll('input[name="topics"]');
    topicCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        this.trackEvent('topic_selected', { 
          topic: checkbox.value, 
          selected: checkbox.checked 
        });
      });
    });
  }
  
  setupAccessibility() {
    // Add ARIA attributes
    this.form.setAttribute('novalidate', ''); // We handle validation
    
    const emailInput = document.getElementById('newsletter-email');
    const emailError = document.getElementById('email-error');
    
    if (emailInput && emailError) {
      emailInput.setAttribute('aria-describedby', 'email-error');
      emailError.setAttribute('role', 'alert');
      emailError.setAttribute('aria-live', 'polite');
    }
    
    // Add screen reader announcements
    this.messageContainer.setAttribute('role', 'status');
    this.messageContainer.setAttribute('aria-live', 'polite');
  }
  
  validateEmail() {
    const emailInput = document.getElementById('newsletter-email');
    const errorContainer = document.getElementById('email-error');
    
    if (!emailInput || !errorContainer) return false;
    
    const email = emailInput.value.trim();
    
    // Check if empty
    if (!email) {
      this.showFieldError(errorContainer, 'L\'adresse email est requise');
      this.state.validationErrors.set('email', 'required');
      return false;
    }
    
    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      this.showFieldError(errorContainer, 'Format d\'email invalide');
      this.state.validationErrors.set('email', 'invalid_format');
      return false;
    }
    
    // Check for common typos
    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1];
    const suggestions = this.getSuggestions(domain, commonDomains);
    
    if (suggestions.length > 0) {
      this.showFieldError(errorContainer, `Vouliez-vous dire ${suggestions[0]} ?`);
      this.state.validationErrors.set('email', 'suggestion');
      return false;
    }
    
    // Check for disposable email domains (basic check)
    const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
    if (disposableDomains.includes(domain.toLowerCase())) {
      this.showFieldError(errorContainer, 'Les adresses email temporaires ne sont pas acceptées');
      this.state.validationErrors.set('email', 'disposable');
      return false;
    }
    
    this.clearFieldError(errorContainer);
    this.state.validationErrors.delete('email');
    return true;
  }
  
  validateFrequency() {
    const frequencySelect = document.getElementById('newsletter-frequency');
    if (!frequencySelect) return false;
    
    const frequency = frequencySelect.value;
    if (!frequency) {
      this.state.validationErrors.set('frequency', 'required');
      return false;
    }
    
    this.state.validationErrors.delete('frequency');
    return true;
  }
  
  validateConsent() {
    const consentCheckbox = document.getElementById('newsletter-consent');
    if (!consentCheckbox) return false;
    
    const isValid = consentCheckbox.checked;
    if (!isValid) {
      this.state.validationErrors.set('consent', 'required');
    } else {
      this.state.validationErrors.delete('consent');
    }
    
    return isValid;
  }
  
  // Utility methods
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  getSuggestions(input, domains) {
    const suggestions = [];
    const inputLower = input.toLowerCase();
    
    for (const domain of domains) {
      const distance = this.levenshteinDistance(inputLower, domain);
      if (distance <= 2 && distance > 0) {
        suggestions.push(domain);
      }
    }
    
    return suggestions.sort((a, b) => 
      this.levenshteinDistance(inputLower, a) - this.levenshteinDistance(inputLower, b)
    );
  }
  
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  showFieldError(container, message) {
    if (!container) return;
    
    container.textContent = message;
    container.classList.add('show');
    container.parentElement.classList.add('has-error');
    
    // Announce to screen readers
    container.setAttribute('aria-live', 'assertive');
    
    // Add animation if enabled
    if (this.config.ui.animationsEnabled) {
      container.style.animation = 'none';
      container.offsetHeight; // Trigger reflow
      container.style.animation = null;
    }
  }
  
  clearFieldError(container) {
    if (!container) return;
    
    container.textContent = '';
    container.classList.remove('show');
    container.parentElement.classList.remove('has-error');
    container.setAttribute('aria-live', 'polite');
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    
    // Prevent double submission
    if (this.state.isSubmitting) {
      return;
    }
    
    // Rate limiting
    const now = Date.now();
    if (now - this.state.lastSubmissionTime < 5000) { // 5 second cooldown
      this.showError('Veuillez attendre avant de soumettre à nouveau.');
      return;
    }
    
    this.trackEvent('newsletter_submit_attempted');
    
    if (!this.validateForm()) {
      this.trackEvent('newsletter_submit_validation_failed', {
        errors: Array.from(this.state.validationErrors.keys())
      });
      return;
    }
    
    this.state.isSubmitting = true;
    this.state.lastSubmissionTime = now;
    this.setLoading(true);
    this.clearMessage();
    
    try {
      const formData = this.collectFormData();
      
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('NETWORK_OFFLINE');
      }
      
      await this.createGitHubIssue(formData);
      
      this.showSuccess();
      this.trackEvent('newsletter_submit_success', {
        frequency: formData.frequency,
        topics_count: formData.topics.length,
        retry_count: this.state.retryCount
      });
      
      // Reset retry count on success
      this.state.retryCount = 0;
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      this.handleSubmissionError(error);
    } finally {
      this.state.isSubmitting = false;
      this.setLoading(false);
    }
  }
  
  handleSubmissionError(error) {
    this.state.retryCount++;
    
    let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
    let errorType = 'unknown';
    
    if (error.message === 'NETWORK_OFFLINE') {
      errorMessage = 'Connexion internet requise. Vérifiez votre connexion.';
      errorType = 'network';
    } else if (error.message === 'RATE_LIMITED') {
      errorMessage = 'Trop de tentatives. Veuillez attendre avant de réessayer.';
      errorType = 'rate_limit';
    } else if (error.message === 'VALIDATION_ERROR') {
      errorMessage = 'Données invalides. Vérifiez vos informations.';
      errorType = 'validation';
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      errorType = 'network';
    }
    
    // Add retry suggestion for certain errors
    if (this.state.retryCount < 3 && ['network', 'unknown'].includes(errorType)) {
      errorMessage += ' Veuillez réessayer.';
    }
    
    this.showError(errorMessage);
    
    this.trackEvent('newsletter_submit_failed', {
      error_type: errorType,
      error_message: error.message,
      retry_count: this.state.retryCount
    });
  }
  
  validateForm() {
    let isValid = true;
    const errors = [];
    
    // Validate email
    if (!this.validateEmail()) {
      isValid = false;
      errors.push('email');
    }
    
    // Validate frequency
    if (!this.validateFrequency()) {
      this.showError('Veuillez sélectionner une fréquence de newsletter');
      isValid = false;
      errors.push('frequency');
    }
    
    // Validate consent
    if (!this.validateConsent()) {
      this.showError('Vous devez accepter les conditions pour vous abonner');
      isValid = false;
      errors.push('consent');
    }
    
    // Update submit button state
    this.updateSubmitButtonState();
    
    return isValid;
  }
  
  updateSubmitButtonState() {
    if (!this.submitButton) return;
    
    const hasErrors = this.state.validationErrors.size > 0;
    const isFormComplete = this.isFormComplete();
    
    this.submitButton.disabled = hasErrors || !isFormComplete || this.state.isSubmitting;
    
    // Update button text based on state
    const submitText = this.submitButton.querySelector('.submit-text');
    if (submitText) {
      if (this.state.isSubmitting) {
        submitText.textContent = 'Traitement...';
      } else if (hasErrors) {
        submitText.textContent = 'Corriger les erreurs';
      } else if (!isFormComplete) {
        submitText.textContent = 'Compléter le formulaire';
      } else {
        submitText.textContent = 'S\'abonner';
      }
    }
  }
  
  isFormComplete() {
    const emailInput = document.getElementById('newsletter-email');
    const frequencySelect = document.getElementById('newsletter-frequency');
    const consentCheckbox = document.getElementById('newsletter-consent');
    
    return emailInput?.value.trim() && 
           frequencySelect?.value && 
           consentCheckbox?.checked;
  }
  
  // Analytics tracking
  trackEvent(eventName, parameters = {}) {
    if (!this.config.analytics.enabled) return;
    
    try {
      // Google Analytics 4
      if (this.config.analytics.gtag) {
        this.config.analytics.gtag('event', eventName, {
          event_category: 'newsletter',
          ...parameters
        });
      }
      
      // Custom tracker
      if (this.config.analytics.customTracker) {
        this.config.analytics.customTracker(eventName, parameters);
      }
      
      // Console logging for development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Newsletter Analytics:', eventName, parameters);
      }
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }
  
  collectFormData() {
    const email = document.getElementById('newsletter-email').value.trim();
    const frequency = document.getElementById('newsletter-frequency').value;
    
    // Collect selected topics
    const topicCheckboxes = document.querySelectorAll('input[name="topics"]:checked');
    const topics = Array.from(topicCheckboxes).map(cb => cb.value);
    
    return {
      email,
      frequency,
      topics,
      format: 'HTML (Rich formatting)', // Default to HTML
      timestamp: new Date().toISOString()
    };
  }
  
  async createGitHubIssue(formData) {
    // Since we can't use GitHub API directly from client-side without exposing tokens,
    // we'll create a GitHub issue URL and redirect the user to it
    // Alternatively, this could be sent to a backend endpoint
    
    const issueTitle = `[NEWSLETTER] Subscription Request - ${formData.email}`;
    const issueBody = this.generateIssueBody(formData);
    
    // Method 1: Redirect to GitHub issue creation (more secure)
    if (window.NEWSLETTER_CONFIG?.use_github_redirect) {
      const githubUrl = this.generateGitHubIssueUrl(issueTitle, issueBody);
      window.open(githubUrl, '_blank');
      return;
    }
    
    // Method 2: Use a backend endpoint (recommended for production)
    if (window.NEWSLETTER_CONFIG?.api_endpoint) {
      const response = await fetch(window.NEWSLETTER_CONFIG.api_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
          labels: ['newsletter-subscription', 'automated']
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    }
    
    // Method 3: Simulate success for demo purposes
    console.log('Newsletter subscription data:', formData);
    console.log('Generated issue body:', issueBody);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Subscription processed' };
  }
  
  generateIssueBody(formData) {
    const topicsList = formData.topics.length > 0 
      ? formData.topics.map(topic => `- [x] ${this.getTopicLabel(topic)}`).join('\\n')
      : '- [ ] Aucun sujet spécifique sélectionné';
    
    return `### Email Address

${formData.email}

### Newsletter Frequency

${formData.frequency}

### Topics of Interest

${topicsList}

### Email Format

${formData.format}

### Consent & Privacy

- [x] I consent to receiving newsletters at the provided email address
- [x] I understand that my email will be encrypted and stored securely
- [x] I understand I can unsubscribe at any time

### Additional Information (Optional)

Subscription automatique via le formulaire du site web.
Timestamp: ${formData.timestamp}`;
  }
  
  getTopicLabel(value) {
    const labels = {
      'development': 'Development & Programming',
      'portfolio': 'Portfolio Updates',
      'articles': 'Technical Articles',
      'projects': 'Project Announcements',
      'industry': 'Industry News & Insights'
    };
    return labels[value] || value;
  }
  
  generateGitHubIssueUrl(title, body) {
    const baseUrl = `https://github.com/${this.githubConfig.owner}/${this.githubConfig.repo}/issues/new`;
    const params = new URLSearchParams({
      template: 'newsletter_subscription.yml',
      title: title,
      body: body,
      labels: 'newsletter-subscription,automated'
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
  
  setLoading(loading) {
    const submitText = this.submitButton.querySelector('.submit-text');
    const submitLoading = this.submitButton.querySelector('.submit-loading');
    
    if (loading) {
      submitText.style.display = 'none';
      submitLoading.style.display = 'inline';
      this.submitButton.disabled = true;
      this.form.classList.add('loading');
    } else {
      submitText.style.display = 'inline';
      submitLoading.style.display = 'none';
      this.submitButton.disabled = false;
      this.form.classList.remove('loading');
    }
  }
  
  showSuccess() {
    if (!this.successContainer) return;
    
    this.form.style.display = 'none';
    this.successContainer.style.display = 'block';
    
    // Add animation class
    if (this.config.ui.animationsEnabled) {
      this.successContainer.classList.add('show');
    }
    
    // Scroll to success message with smooth behavior
    this.successContainer.scrollIntoView({ 
      behavior: this.config.ui.animationsEnabled ? 'smooth' : 'auto',
      block: 'center'
    });
    
    // Focus management for accessibility
    const successTitle = this.successContainer.querySelector('h4');
    if (successTitle) {
      successTitle.setAttribute('tabindex', '-1');
      successTitle.focus();
    }
    
    // Auto-hide after delay (optional)
    if (window.NEWSLETTER_CONFIG?.auto_hide_success) {
      setTimeout(() => {
        this.resetForm();
      }, 10000);
    }
  }
  
  showError(message) {
    this.showMessage(message, 'error');
  }
  
  showMessage(message, type = 'error') {
    if (!this.messageContainer) return;
    
    const className = type === 'error' ? 'error-message' : 'success-message';
    const icon = type === 'error' ? '❌' : '✅';
    
    this.messageContainer.innerHTML = `<div class="${className}">${icon} ${message}</div>`;
    this.messageContainer.classList.add('show');
    
    // Announce to screen readers
    this.messageContainer.setAttribute('aria-live', 'assertive');
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => {
        this.clearMessage();
      }, 5000);
    }
  }
  
  clearMessage() {
    if (!this.messageContainer) return;
    
    this.messageContainer.innerHTML = '';
    this.messageContainer.classList.remove('show');
    this.messageContainer.setAttribute('aria-live', 'polite');
  }
  
  resetForm() {
    if (!this.form) return;
    
    // Reset form state
    this.form.reset();
    this.form.style.display = 'block';
    this.successContainer.style.display = 'none';
    
    // Clear validation state
    this.state.validationErrors.clear();
    this.state.isSubmitting = false;
    this.state.retryCount = 0;
    
    // Clear all error messages
    const errorContainers = this.form.querySelectorAll('.form-error');
    errorContainers.forEach(container => this.clearFieldError(container));
    
    this.clearMessage();
    this.updateSubmitButtonState();
    
    // Remove animation classes
    this.successContainer.classList.remove('show');
  }
}

}

// Progressive enhancement initialization
function initializeNewsletter() {
  // Check if already initialized
  if (window.newsletterManagerInstance) {
    return window.newsletterManagerInstance;
  }
  
  try {
    window.newsletterManagerInstance = new NewsletterManager();
    return window.newsletterManagerInstance;
  } catch (error) {
    console.error('Failed to initialize newsletter manager:', error);
    
    // Fallback: ensure form still works without JavaScript enhancement
    const form = document.getElementById('newsletter-form');
    if (form && !form.getAttribute('action')) {
      form.setAttribute('method', 'post');
      form.setAttribute('action', '/newsletter/subscribe');
    }
    
    return null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNewsletter);
} else {
  // DOM is already ready
  initializeNewsletter();
}

// Handle dynamic content loading (SPA compatibility)
if (window.MutationObserver) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm && !window.newsletterManagerInstance) {
          initializeNewsletter();
        }
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Export for external use
window.NewsletterManager = NewsletterManager;
window.initializeNewsletter = initializeNewsletter;

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.newsletterManagerInstance) {
    // Cancel any pending requests
    window.newsletterManagerInstance.state.isSubmitting = false;
  }
});