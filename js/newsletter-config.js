/**
 * Newsletter Configuration Module
 * Manages configuration for Discord webhook newsletter integration
 */

class NewsletterConfig {
    constructor() {
        this.config = this.loadConfiguration();
        this.validateConfiguration();
    }

    /**
     * Load configuration from multiple sources with priority:
     * 1. Environment variables
     * 2. Hexo site configuration
     * 3. Theme configuration
     * 4. Default values
     */
    loadConfiguration() {
        // Get Hexo configurations (available in browser via window.hexoConfig if injected)
        const hexoSiteConfig = window.hexoConfig?.newsletter || {};
        const hexoThemeConfig = window.hexoThemeConfig?.newsletter || {};

        return {
            // Discord webhook configuration
            webhookUrl: this.getWebhookUrl(hexoSiteConfig),
            
            // Request configuration
            retryAttempts: hexoSiteConfig.retry_attempts || 3,
            timeoutMs: hexoSiteConfig.timeout_ms || 5000,
            rateLimitMs: hexoSiteConfig.rate_limit_ms || 1000,
            
            // UI configuration from theme
            formId: hexoThemeConfig.form_id || 'newsletter-form',
            emailInputId: hexoThemeConfig.email_input_id || 'newsletter-email',
            submitButtonId: hexoThemeConfig.submit_button_id || 'newsletter-submit',
            
            // Messages configuration
            messages: {
                success: hexoThemeConfig.success_message || 'Merci pour votre inscription !',
                error: hexoThemeConfig.error_message || 'Erreur lors de l\'inscription',
                loading: hexoThemeConfig.loading_message || 'Inscription en cours...',
                invalidEmail: 'Veuillez saisir une adresse email valide',
                networkError: 'Erreur de connexion. Veuillez réessayer.',
                configError: 'Configuration manquante. Contactez l\'administrateur.'
            },
            
            // Form configuration
            placeholderText: hexoThemeConfig.placeholder_text || 'Votre adresse email',
            submitText: hexoThemeConfig.submit_text || 'S\'inscrire',
            
            // Feature flags
            enabled: hexoSiteConfig.enabled !== false, // Default to true
            enabledPages: hexoThemeConfig.enabled_pages || ['index', 'post', 'page'],
            
            // Validation configuration
            emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            maxEmailLength: 254,
            
            // Discord embed configuration
            discord: {
                embedColor: 0x5865F2, // Discord blurple
                embedTitle: '📧 Nouvelle inscription newsletter',
                embedFooter: 'Newsletter Subscription',
                embedDescription: 'Un nouvel utilisateur s\'est inscrit à la newsletter'
            }
        };
    }

    /**
     * Get webhook URL with environment variable support
     */
    getWebhookUrl(siteConfig) {
        // Try environment variable pattern first
        let webhookUrl = siteConfig.discord_webhook;
        
        // Handle environment variable substitution pattern ${VAR_NAME}
        if (webhookUrl && webhookUrl.includes('${') && webhookUrl.includes('}')) {
            // In browser context, we can't access process.env directly
            // The webhook URL should be injected server-side or configured directly
            console.warn('Environment variable pattern detected in webhook URL. Ensure server-side substitution.');
            return null;
        }
        
        return webhookUrl;
    }

    /**
     * Validate the loaded configuration
     */
    validateConfiguration() {
        const errors = [];

        // Validate webhook URL
        if (!this.config.webhookUrl) {
            errors.push('Discord webhook URL is not configured');
            this.config.enabled = false;
        } else if (!this.isValidDiscordWebhookUrl(this.config.webhookUrl)) {
            errors.push('Invalid Discord webhook URL format');
            this.config.enabled = false;
        }

        // Validate numeric values
        if (this.config.retryAttempts < 0 || this.config.retryAttempts > 10) {
            errors.push('Retry attempts must be between 0 and 10');
        }

        if (this.config.timeoutMs < 1000 || this.config.timeoutMs > 30000) {
            errors.push('Timeout must be between 1000ms and 30000ms');
        }

        if (this.config.rateLimitMs < 0) {
            errors.push('Rate limit must be non-negative');
        }

        // Validate required DOM element IDs
        const requiredIds = ['formId', 'emailInputId', 'submitButtonId'];
        requiredIds.forEach(id => {
            if (!this.config[id] || typeof this.config[id] !== 'string') {
                errors.push(`Invalid or missing ${id} configuration`);
            }
        });

        // Log validation results
        if (errors.length > 0) {
            console.warn('Newsletter configuration validation errors:', errors);
            this.config.validationErrors = errors;
        } else {
            console.log('Newsletter configuration validated successfully');
        }

        return errors.length === 0;
    }

    /**
     * Validate Discord webhook URL format
     */
    isValidDiscordWebhookUrl(url) {
        if (!url || typeof url !== 'string') return false;
        
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'discord.com' || 
                   urlObj.hostname === 'discordapp.com' ||
                   urlObj.hostname.endsWith('.discord.com');
        } catch {
            return false;
        }
    }

    /**
     * Check if newsletter is enabled and properly configured
     */
    isEnabled() {
        return this.config.enabled && !this.config.validationErrors;
    }

    /**
     * Check if newsletter should be shown on current page
     */
    isEnabledForCurrentPage() {
        if (!this.isEnabled()) return false;
        
        // Get current page type from body class or meta tag
        const bodyClasses = document.body.className;
        const pageType = this.getCurrentPageType(bodyClasses);
        
        return this.config.enabledPages.includes(pageType);
    }

    /**
     * Determine current page type from body classes or URL
     */
    getCurrentPageType(bodyClasses) {
        if (bodyClasses.includes('home') || window.location.pathname === '/') {
            return 'index';
        } else if (bodyClasses.includes('post')) {
            return 'post';
        } else if (bodyClasses.includes('page')) {
            return 'page';
        } else if (bodyClasses.includes('archive')) {
            return 'archive';
        } else if (bodyClasses.includes('category')) {
            return 'category';
        } else if (bodyClasses.includes('tag')) {
            return 'tag';
        }
        
        return 'page'; // Default fallback
    }

    /**
     * Get configuration value
     */
    get(key) {
        return this.config[key];
    }

    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }

    /**
     * Get validation errors
     */
    getValidationErrors() {
        return this.config.validationErrors || [];
    }

    /**
     * Create Discord webhook payload
     */
    createDiscordPayload(email, metadata = {}) {
        const now = new Date();
        const source = metadata.source || window.location.href;
        const userAgent = metadata.userAgent || navigator.userAgent;
        
        return {
            embeds: [{
                title: this.config.discord.embedTitle,
                description: this.config.discord.embedDescription,
                color: this.config.discord.embedColor,
                fields: [
                    {
                        name: '📧 Email',
                        value: email,
                        inline: true
                    },
                    {
                        name: '📅 Date',
                        value: now.toLocaleString('fr-FR', {
                            timeZone: 'Europe/Paris',
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        inline: true
                    },
                    {
                        name: '🔗 Source',
                        value: source,
                        inline: false
                    },
                    {
                        name: '🌐 Navigateur',
                        value: this.getBrowserInfo(userAgent),
                        inline: true
                    }
                ],
                timestamp: now.toISOString(),
                footer: {
                    text: this.config.discord.embedFooter
                }
            }]
        };
    }

    /**
     * Extract browser information from user agent
     */
    getBrowserInfo(userAgent) {
        const browsers = [
            { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
            { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
            { name: 'Safari', pattern: /Safari\/(\d+)/ },
            { name: 'Edge', pattern: /Edg\/(\d+)/ },
            { name: 'Opera', pattern: /OPR\/(\d+)/ }
        ];

        for (const browser of browsers) {
            const match = userAgent.match(browser.pattern);
            if (match) {
                return `${browser.name} ${match[1]}`;
            }
        }

        return 'Navigateur inconnu';
    }
}

// Export for use in other modules
window.NewsletterConfig = NewsletterConfig;

// Create global instance if not exists
if (!window.newsletterConfig) {
    window.newsletterConfig = new NewsletterConfig();
}