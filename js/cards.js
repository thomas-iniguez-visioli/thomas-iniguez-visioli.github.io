/**
 * Modern Cards Component
 * Handles loading states, animations, and interactions
 */

class ModernCards {
  constructor() {
    this.cards = document.querySelectorAll('.card');
    this.loadingTemplate = document.getElementById('card-loading-template');
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '50px 0px'
    };
    
    this.init();
  }
  
  init() {
    this.setupIntersectionObserver();
    this.setupCardInteractions();
    this.setupLazyLoading();
  }
  
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      this.cards.forEach(card => {
        card.classList.add('card-visible');
      });
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('card-visible');
          // Add staggered animation delay
          const index = Array.from(this.cards).indexOf(entry.target);
          entry.target.style.animationDelay = `${index * 0.1}s`;
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);
    
    this.cards.forEach(card => {
      observer.observe(card);
    });
  }
  
  setupCardInteractions() {
    this.cards.forEach(card => {
      // Add keyboard navigation
      const cardLink = card.querySelector('.card-title a');
      if (cardLink) {
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            cardLink.click();
          }
        });
        
        // Make card focusable
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'article');
      }
      
      // Add hover sound effect (optional)
      card.addEventListener('mouseenter', () => {
        this.playHoverSound();
      });
      
      // Track card interactions
      card.addEventListener('click', (e) => {
        const cardTitle = card.querySelector('.card-title')?.textContent?.trim();
        this.trackCardClick(cardTitle);
      });
    });
  }
  
  setupLazyLoading() {
    const images = document.querySelectorAll('.card-image[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      });
      
      images.forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback: load all images immediately
      images.forEach(img => {
        this.loadImage(img);
      });
    }
  }
  
  loadImage(img) {
    const placeholder = this.createImagePlaceholder();
    img.parentNode.insertBefore(placeholder, img);
    
    img.addEventListener('load', () => {
      img.classList.add('loaded');
      placeholder.remove();
    });
    
    img.addEventListener('error', () => {
      img.style.display = 'none';
      placeholder.innerHTML = `
        <div class="image-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
          <p>Image non disponible</p>
        </div>
      `;
    });
  }
  
  createImagePlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'card-image-placeholder';
    placeholder.innerHTML = `
      <div class="placeholder-shimmer"></div>
    `;
    return placeholder;
  }
  
  playHoverSound() {
    // Optional: Add subtle hover sound
    if ('AudioContext' in window) {
      try {
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Ignore audio errors
      }
    }
  }
  
  trackCardClick(cardTitle) {
    // Optional: Track card interactions for analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'card_click', {
        'card_title': cardTitle,
        'event_category': 'engagement'
      });
    }
    
    // Or use other analytics services
    if (typeof umami !== 'undefined') {
      umami.track('card-click', { title: cardTitle });
    }
  }
  
  // Public method to add loading cards
  addLoadingCards(count = 3) {
    if (!this.loadingTemplate) return;
    
    const container = document.querySelector('.cards-grid');
    if (!container) return;
    
    for (let i = 0; i < count; i++) {
      const loadingCard = this.loadingTemplate.content.cloneNode(true);
      container.appendChild(loadingCard);
    }
  }
  
  // Public method to remove loading cards
  removeLoadingCards() {
    const loadingCards = document.querySelectorAll('.card-loading');
    loadingCards.forEach(card => {
      card.remove();
    });
  }
  
  // Public method to load more cards (for infinite scroll)
  async loadMoreCards(url) {
    this.addLoadingCards();
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const newCards = doc.querySelectorAll('.card:not(.card-loading)');
      
      this.removeLoadingCards();
      
      const container = document.querySelector('.cards-grid');
      newCards.forEach(card => {
        container.appendChild(card);
      });
      
      // Reinitialize for new cards
      this.cards = document.querySelectorAll('.card');
      this.setupCardInteractions();
      
    } catch (error) {
      console.error('Error loading more cards:', error);
      this.removeLoadingCards();
    }
  }
}

// Card entrance animation CSS
const cardAnimationCSS = `
  .card {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  }
  
  .card-visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .card-image-placeholder {
    width: 100%;
    height: 200px;
    background-color: var(--color-background-secondary);
    border-radius: var(--border-radius-base);
    position: relative;
    overflow: hidden;
  }
  
  .placeholder-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent 0%, 
      rgba(255, 255, 255, 0.4) 50%, 
      transparent 100%);
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .image-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--color-text-tertiary);
    background-color: var(--color-background-secondary);
    border-radius: var(--border-radius-base);
  }
  
  .image-error p {
    margin-top: var(--space-2);
    font-size: var(--font-size-sm);
  }
  
  .card-image.loaded {
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
  }
`;

// Inject animation CSS
const style = document.createElement('style');
style.textContent = cardAnimationCSS;
document.head.appendChild(style);

// Initialize cards when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ModernCards();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ModernCards;
}