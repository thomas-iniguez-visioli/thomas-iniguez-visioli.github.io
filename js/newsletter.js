/**
 * Newsletter Manager
 * Handles newsletter subscription form functionality and Discord webhook integration
 */

class NewsletterManager {
    constructor(config = null) {
        this.config = config || window.newsletterConfig;
        this.form = null;
        this.emailInput = null;
        this.submitButton = null;
        this.messageContainer = null;
        this.isLoading = false;
        this.lastSubmissionTime = 0;
        
        // Bind methods to preserve context
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    /**
     * Initialize the newsletter manager
     */
    init() {
        if (!this.config || !this.config.isEnabled()) {
            console.warn('Newsletter is disabled or not properly configured');
            this.hideForm();
            return false;
        }

        if (!this.config.isEnabledForCurrentPage()) {
            console.log('Newsletter not enabled for current page type');
            this.hideForm();
            return false;
        }

        this.initializeDOM();
        this.attachEventListeners();
        this.showForm();
        
        console.log('Newsletter manager initialized successfully');
        return true;
    }

    /**
     * Initialize DOM elements
     */
    initializeDOM() {
        // Get form elements
        this.form = document.getElementById(this.config.get('formId'));
        this.emailInput = document.getElementById(this.config.get('emailInputId'));
        this.submitButton = document.getElementById(this.config.get('submitButtonId'));

        if (!this.form || !this.emailInput || !this.submitButton) {
            console.error('Newsletter form elements not found in DOM');
            return false;
        }

        // Create or find message container
        this.messageContainer = this.form.querySelector('.newsletter-message') || 
                               this.createMessageContainer();

        // Set initial form attributes
        this.emailInput.setAttribute('placeholder', this.config.get('placeholderText'));
        this.submitButton.textContent = this.config.get('submitText');
        
        // Set accessibility attributes
        this.emailInput.setAttribute('aria-label', 'Adresse email pour newsletter');
        this.emailInput.setAttribute('aria-describedby', 'newsletter-message');
        this.submitButton.setAttribute('aria-label', 'S\'inscrire à la newsletter');
        
        return true;
    }

    /**
     * Create message container for feedback
     */
    createMessageContainer() {
        const container = document.createElement('div');
        container.className = 'newsletter-message';
        container.id = 'newsletter-message';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        
        // Insert after the form or as last child
        if (this.form.nextSibling) {
            this.form.parentNode.insertBefore(container, this.form.nextSibling);
        } else {
            this.form.parentNode.appendChild(container);
        }
        
        return container;
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        if (!this.form) return;

        this.form.addEventListener('submit', this.handleSubmit);
        this.emailInput.addEventListener('input', this.handleInputChange);
        this.emailInput.addEventListener('keypress', this.handleKeyPress);
        
        // Clear messages when user starts typing
        this.emailInput.addEventListener('focus', () => {
            this.clearMessage();
        });
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.isLoading) {
            return;
        }

        const email = this.emailInput.value.trim();
        
        // Validate email
        if (!this.validateEmail(email)) {
            this.showMessage(this.config.get('messages').invalidEmail, 'error');
            this.emailInput.focus();
            return;
        }

        // Check rate limiting
        if (!this.checkRateLimit()) {
            this.showMessage('Veuillez patienter avant de soumettre à nouveau', 'error');
            return;
        }

        try {
            this.setLoading(true);
            await this.sendToDiscord(email);
            this.handleSuccess();
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle input change events
     */
    handleInputChange(event) {
        const email = event.target.value.trim();
        
        // Clear previous error messages when user starts typing
        if (this.messageContainer.classList.contains('error')) {
            this.clearMessage();
        }
        
        // Real-time validation feedback (optional)
        if (email.length > 0 && !this.validateEmail(email)) {
            event.target.classList.add('invalid');
        } else {
            event.target.classList.remove('invalid');
        }
    }

    /**
     * Handle key press events
     */
    handleKeyPress(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSubmit(event);
        }
    }

    /**
     * Validate email address
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            return false;
        }

        // Check length
        if (email.length > this.config.get('maxEmailLength')) {
            return false;
        }

        // Check format using regex
        return this.config.get('emailRegex').test(email);
    }

    /**
     * Check rate limiting
     */
    checkRateLimit() {
        const now = Date.now();
        const rateLimitMs = this.config.get('rateLimitMs');
        
        if (now - this.lastSubmissionTime < rateLimitMs) {
            return false;
        }
        
        this.lastSubmissionTime = now;
        return true;
    }

    /**
     * Send email to Discord webhook with comprehensive error handling
     */
    async sendToDiscord(email) {
        const webhookUrl = this.config.get('webhookUrl');
        if (!webhookUrl) {
            throw new Error('Webhook URL not configured');
        }

        // Validate webhook URL format
        if (!this.config.isValidDiscordWebhookUrl(webhookUrl)) {
            throw new Error('Invalid Discord webhook URL format');
        }

        // Create payload with comprehensive metadata
        const payload = this.createEnhancedDiscordPayload(email);

        // Log the attempt (without sensitive data)
        console.log('Sending newsletter subscription to Discord webhook');

        const response = await this.makeRequest(webhookUrl, payload);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`Discord webhook failed: HTTP ${response.status} - ${errorText}`);
        }

        // Log success
        console.log('Newsletter subscription sent successfully to Discord');
        return response;
    }

    /**
     * Create enhanced Discord payload with comprehensive information
     */
    createEnhancedDiscordPayload(email) {
        const now = new Date();
        const source = window.location.href;
        const referrer = document.referrer || 'Direct';
        const userAgent = navigator.userAgent;
        const language = navigator.language || 'Unknown';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        
        // Get page metadata
        const pageTitle = document.title || 'Unknown Page';
        const pageDescription = this.getMetaContent('description') || 'No description';
        
        return {
            embeds: [{
                title: this.config.get('discord').embedTitle,
                description: this.config.get('discord').embedDescription,
                color: this.config.get('discord').embedColor,
                fields: [
                    {
                        name: '📧 Email',
                        value: `\`${email}\``,
                        inline: true
                    },
                    {
                        name: '📅 Date & Heure',
                        value: now.toLocaleString('fr-FR', {
                            timeZone: 'Europe/Paris',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }),
                        inline: true
                    },
                    {
                        name: '🌍 Timezone',
                        value: timezone,
                        inline: true
                    },
                    {
                        name: '🔗 Page Source',
                        value: `[${pageTitle}](${source})`,
                        inline: false
                    },
                    {
                        name: '📄 Description',
                        value: pageDescription.length > 100 ? 
                               pageDescription.substring(0, 100) + '...' : 
                               pageDescription,
                        inline: false
                    },
                    {
                        name: '🔙 Référent',
                        value: referrer === 'Direct' ? 'Accès direct' : referrer,
                        inline: true
                    },
                    {
                        name: '🌐 Navigateur',
                        value: this.getBrowserInfo(userAgent),
                        inline: true
                    },
                    {
                        name: '🗣️ Langue',
                        value: language,
                        inline: true
                    },
                    {
                        name: '📱 Appareil',
                        value: this.getDeviceInfo(userAgent),
                        inline: true
                    },
                    {
                        name: '🖥️ OS',
                        value: this.getOSInfo(userAgent),
                        inline: true
                    },
                    {
                        name: '📊 Résolution',
                        value: `${screen.width}x${screen.height}`,
                        inline: true
                    }
                ],
                timestamp: now.toISOString(),
                footer: {
                    text: this.config.get('discord').embedFooter,
                    icon_url: 'https://cdn.discordapp.com/emojis/📧.png'
                },
                thumbnail: {
                    url: this.getFaviconUrl()
                }
            }]
        };
    }

    /**
     * Get meta content by name
     */
    getMetaContent(name) {
        const meta = document.querySelector(`meta[name="${name}"]`) || 
                    document.querySelector(`meta[property="og:${name}"]`);
        return meta ? meta.getAttribute('content') : null;
    }

    /**
     * Get enhanced browser information
     */
    getBrowserInfo(userAgent) {
        const browsers = [
            { name: 'Chrome', pattern: /Chrome\/(\d+\.\d+)/ },
            { name: 'Firefox', pattern: /Firefox\/(\d+\.\d+)/ },
            { name: 'Safari', pattern: /Version\/(\d+\.\d+).*Safari/ },
            { name: 'Edge', pattern: /Edg\/(\d+\.\d+)/ },
            { name: 'Opera', pattern: /OPR\/(\d+\.\d+)/ }
        ];

        for (const browser of browsers) {
            const match = userAgent.match(browser.pattern);
            if (match) {
                return `${browser.name} ${match[1]}`;
            }
        }

        return 'Navigateur inconnu';
    }

    /**
     * Get device information
     */
    getDeviceInfo(userAgent) {
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
            if (/iPhone/.test(userAgent)) return 'iPhone';
            if (/iPad/.test(userAgent)) return 'iPad';
            if (/Android/.test(userAgent)) return 'Android';
            return 'Mobile';
        }
        
        if (/Tablet/.test(userAgent)) return 'Tablette';
        
        return 'Desktop';
    }

    /**
     * Get operating system information
     */
    getOSInfo(userAgent) {
        const systems = [
            { name: 'Windows 11', pattern: /Windows NT 10\.0.*rv:/ },
            { name: 'Windows 10', pattern: /Windows NT 10\.0/ },
            { name: 'Windows 8.1', pattern: /Windows NT 6\.3/ },
            { name: 'Windows 8', pattern: /Windows NT 6\.2/ },
            { name: 'Windows 7', pattern: /Windows NT 6\.1/ },
            { name: 'macOS', pattern: /Mac OS X|macOS/ },
            { name: 'Linux', pattern: /Linux/ },
            { name: 'iOS', pattern: /iPhone OS|iOS/ },
            { name: 'Android', pattern: /Android/ }
        ];

        for (const system of systems) {
            if (system.pattern.test(userAgent)) {
                return system.name;
            }
        }

        return 'OS inconnu';
    }

    /**
     * Get favicon URL for thumbnail
     */
    getFaviconUrl() {
        const favicon = document.querySelector('link[rel="icon"]') ||
                       document.querySelector('link[rel="shortcut icon"]') ||
                       document.querySelector('link[rel="apple-touch-icon"]');
        
        if (favicon) {
            const href = favicon.getAttribute('href');
            if (href.startsWith('http')) {
                return href;
            } else if (href.startsWith('/')) {
                return window.location.origin + href;
            } else {
                return window.location.origin + '/' + href;
            }
        }
        
        return window.location.origin + '/favicon.ico';
    }

    /**
     * Make HTTP request with comprehensive retry logic and error handling
     */
    async makeRequest(url, payload, attempt = 1) {
        const maxAttempts = this.config.get('retryAttempts') + 1;
        const timeoutMs = this.config.get('timeoutMs');

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            console.log(`Discord webhook request attempt ${attempt}/${maxAttempts}`);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Newsletter-Bot/1.0'
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // Log response details
            console.log(`Discord webhook response: ${response.status} ${response.statusText}`);

            // Check for rate limiting
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 5000;
                
                if (attempt < maxAttempts) {
                    console.warn(`Rate limited, waiting ${waitTime}ms before retry`);
                    await this.delay(waitTime);
                    return this.makeRequest(url, payload, attempt + 1);
                }
            }

            // Check for server errors that might be retryable
            if (response.status >= 500 && attempt < maxAttempts) {
                console.warn(`Server error ${response.status}, retrying...`);
                await this.delay(this.calculateBackoffDelay(attempt));
                return this.makeRequest(url, payload, attempt + 1);
            }

            return response;

        } catch (error) {
            console.error(`Request attempt ${attempt} failed:`, error.message);

            // Determine if error is retryable
            const isRetryable = this.isRetryableError(error);
            
            if (attempt < maxAttempts && isRetryable) {
                const delay = this.calculateBackoffDelay(attempt);
                console.warn(`Retrying in ${delay}ms...`);
                await this.delay(delay);
                return this.makeRequest(url, payload, attempt + 1);
            }

            // Enhance error message for better debugging
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${timeoutMs}ms`);
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Discord webhook');
            }

            throw error;
        }
    }

    /**
     * Determine if an error is retryable
     */
    isRetryableError(error) {
        // Don't retry on abort (timeout) errors
        if (error.name === 'AbortError') {
            return false;
        }

        // Retry on network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return true;
        }

        // Retry on DNS errors, connection refused, etc.
        if (error.message.includes('ENOTFOUND') || 
            error.message.includes('ECONNREFUSED') ||
            error.message.includes('ETIMEDOUT')) {
            return true;
        }

        return false;
    }

    /**
     * Calculate exponential backoff delay with jitter
     */
    calculateBackoffDelay(attempt) {
        const baseDelay = 1000; // 1 second
        const maxDelay = 10000; // 10 seconds
        
        // Exponential backoff: 1s, 2s, 4s, 8s...
        const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
        
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 1000;
        
        return Math.min(exponentialDelay + jitter, maxDelay);
    }

    /**
     * Handle successful submission
     */
    handleSuccess() {
        this.showMessage(this.config.get('messages').success, 'success');
        this.emailInput.value = '';
        this.emailInput.classList.remove('invalid');
        
        // Optional: Track success event
        this.trackEvent('newsletter_subscription_success');
    }

    /**
     * Handle submission error with comprehensive error categorization
     */
    handleError(error) {
        console.error('Newsletter submission error:', error);
        
        let message = this.config.get('messages').error;
        let errorCategory = 'unknown';
        
        // Categorize errors for better user feedback
        if (error.message.includes('timeout')) {
            message = 'La requête a pris trop de temps. Vérifiez votre connexion et réessayez.';
            errorCategory = 'timeout';
        } else if (error.message.includes('Network error') || error.message.includes('fetch')) {
            message = this.config.get('messages').networkError;
            errorCategory = 'network';
        } else if (error.message.includes('Webhook URL not configured')) {
            message = this.config.get('messages').configError;
            errorCategory = 'configuration';
        } else if (error.message.includes('Invalid Discord webhook URL')) {
            message = 'Configuration invalide. Contactez l\'administrateur.';
            errorCategory = 'configuration';
        } else if (error.message.includes('HTTP 400')) {
            message = 'Données invalides. Veuillez réessayer.';
            errorCategory = 'validation';
        } else if (error.message.includes('HTTP 401') || error.message.includes('HTTP 403')) {
            message = 'Accès non autorisé. Contactez l\'administrateur.';
            errorCategory = 'authorization';
        } else if (error.message.includes('HTTP 404')) {
            message = 'Service non trouvé. Contactez l\'administrateur.';
            errorCategory = 'configuration';
        } else if (error.message.includes('HTTP 429')) {
            message = 'Trop de tentatives. Veuillez patienter avant de réessayer.';
            errorCategory = 'rate_limit';
        } else if (error.message.includes('HTTP 5')) {
            message = 'Service temporairement indisponible. Réessayez plus tard.';
            errorCategory = 'server_error';
        }
        
        this.showMessage(message, 'error');
        
        // Track error event with detailed information
        this.trackEvent('newsletter_subscription_error', { 
            error: error.message,
            category: errorCategory,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });

        // Log detailed error for debugging (in development)
        if (this.isDevelopment()) {
            console.group('Newsletter Error Details');
            console.error('Error object:', error);
            console.error('Error category:', errorCategory);
            console.error('User message:', message);
            console.error('Stack trace:', error.stack);
            console.groupEnd();
        }
    }

    /**
     * Check if running in development mode
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev') ||
               window.location.protocol === 'file:';
    }

    /**
     * Set loading state
     */
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.submitButton.disabled = true;
            this.emailInput.disabled = true;
            this.submitButton.textContent = this.config.get('messages').loading;
            this.submitButton.classList.add('loading');
            this.showMessage(this.config.get('messages').loading, 'loading');
        } else {
            this.submitButton.disabled = false;
            this.emailInput.disabled = false;
            this.submitButton.textContent = this.config.get('submitText');
            this.submitButton.classList.remove('loading');
        }
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        if (!this.messageContainer) return;

        this.messageContainer.textContent = message;
        this.messageContainer.className = `newsletter-message ${type}`;
        this.messageContainer.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.clearMessage();
            }, 5000);
        }
    }

    /**
     * Clear message
     */
    clearMessage() {
        if (!this.messageContainer) return;
        
        this.messageContainer.textContent = '';
        this.messageContainer.className = 'newsletter-message';
        this.messageContainer.style.display = 'none';
    }

    /**
     * Show form
     */
    showForm() {
        if (this.form) {
            this.form.style.display = 'block';
            this.form.classList.remove('hidden');
        }
    }

    /**
     * Hide form
     */
    hideForm() {
        if (this.form) {
            this.form.style.display = 'none';
            this.form.classList.add('hidden');
        }
    }

    /**
     * Utility: Delay function for retry logic
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Optional: Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        // Integration with analytics services (Google Analytics, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }
        
        // Custom tracking logic can be added here
        console.log('Newsletter event:', eventName, data);
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.form) {
            this.form.removeEventListener('submit', this.handleSubmit);
        }
        if (this.emailInput) {
            this.emailInput.removeEventListener('input', this.handleInputChange);
            this.emailInput.removeEventListener('keypress', this.handleKeyPress);
        }
        
        this.form = null;
        this.emailInput = null;
        this.submitButton = null;
        this.messageContainer = null;
    }
}

// Export for use in other modules
window.NewsletterManager = NewsletterManager;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if configuration is available and form exists
    if (window.newsletterConfig && document.getElementById(window.newsletterConfig.get('formId'))) {
        window.newsletterManager = new NewsletterManager();
        window.newsletterManager.init();
    }
});