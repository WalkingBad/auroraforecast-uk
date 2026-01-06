// Service Worker Registration
// Handles PWA functionality and offline caching

class ServiceWorkerManager {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    
    this.init();
    this.bindEvents();
  }
  
  async init() {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        // Service Worker registered successfully
        
        // Handle updates
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleUpdate();
        });
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleSWMessage(event);
        });
        
        // Check for updates periodically
        setInterval(() => {
          this.checkForUpdates();
        }, 30 * 60 * 1000); // 30 minutes
        
      } catch (error) {
        console.warn('Service Worker registration failed:', error);
      }
    }
    
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      this.registerBackgroundSync();
    }
  }
  
  bindEvents() {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });
    
    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.checkForUpdates();
      }
    });
  }
  
  handleUpdate() {
    const newWorker = this.swRegistration.installing;
    if (!newWorker) return;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New version available
        this.showUpdateNotification();
      }
    });
  }
  
  showUpdateNotification() {
    // Create update notification
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span>🔄 New version available</span>
        <button class="update-btn">Update</button>
        <button class="dismiss-btn">×</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #111214;
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 16px;
      z-index: 9999;
      color: white;
      font-family: Inter, sans-serif;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
      }
      .update-btn {
        background: #F59E0B;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        font-weight: 500;
      }
      .dismiss-btn {
        background: transparent;
        color: #A1A1AA;
        border: none;
        font-size: 16px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
      }
      .update-btn:hover { background: #D97706; }
      .dismiss-btn:hover { color: white; }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Event listeners
    notification.querySelector('.update-btn').addEventListener('click', () => {
      this.applyUpdate();
      this.removeNotification(notification);
    });
    
    notification.querySelector('.dismiss-btn').addEventListener('click', () => {
      this.removeNotification(notification);
    });
    
    // Auto dismiss after 30 seconds
    setTimeout(() => {
      if (document.contains(notification)) {
        this.removeNotification(notification);
      }
    }, 30000);
  }
  
  removeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.contains(notification)) {
        notification.remove();
      }
    }, 300);
  }
  
  applyUpdate() {
    if (this.swRegistration && this.swRegistration.waiting) {
      this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
  
  async checkForUpdates() {
    if (this.swRegistration) {
      try {
        await this.swRegistration.update();
      } catch (error) {
        console.warn('Update check failed:', error);
      }
    }
  }
  
  handleSWMessage(event) {
    const { type, url } = event.data;
    
    switch (type) {
      case 'DATA_UPDATED':
        // Refresh aurora data when updated in background
        if (window.auroraFactorsManager) {
          // Data updated, refreshing display
          window.auroraFactorsManager.refresh();
        }
        break;
        
      default:
        // Unknown service worker message
    }
  }
  
  handleOnline() {
    // Connection restored
    
    // Show online indicator briefly
    this.showConnectionStatus('🌐 Back online', 'success');
    
    // Trigger background sync
    this.triggerBackgroundSync();
    
    // Refresh aurora data
    if (window.auroraFactorsManager) {
      setTimeout(() => {
        window.auroraFactorsManager.refresh();
      }, 1000);
    }
  }
  
  handleOffline() {
    // Connection lost
    
    // Show offline indicator
    this.showConnectionStatus('📱 Offline mode', 'warning');
  }
  
  showConnectionStatus(message, type) {
    const existing = document.querySelector('.connection-status');
    if (existing) existing.remove();
    
    const status = document.createElement('div');
    status.className = 'connection-status';
    status.textContent = message;
    
    const bgColor = type === 'success' ? '#10B981' : '#F59E0B';
    status.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100%);
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 24px;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999;
      transition: transform 0.3s ease;
      font-family: Inter, sans-serif;
    `;
    
    document.body.appendChild(status);
    
    // Animate in
    setTimeout(() => {
      status.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    
    // Auto hide
    setTimeout(() => {
      status.style.transform = 'translateX(-50%) translateY(-100%)';
      setTimeout(() => status.remove(), 300);
    }, 3000);
  }
  
  async registerBackgroundSync() {
    if (this.swRegistration && this.swRegistration.sync) {
      try {
        await this.swRegistration.sync.register('aurora-data-sync');
        // Background sync enabled
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }
  }
  
  async triggerBackgroundSync() {
    if (this.swRegistration && this.swRegistration.sync) {
      try {
        await this.swRegistration.sync.register('aurora-data-sync');
      } catch (error) {
        console.warn('Background sync trigger failed:', error);
      }
    }
  }
  
  // Public methods
  async clearCache() {
    if (this.swRegistration && this.swRegistration.active) {
      this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
      // Cache clearing requested
    }
  }
  
  getConnectionStatus() {
    return {
      online: this.isOnline,
      serviceWorker: !!this.swRegistration,
      scope: this.swRegistration?.scope
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.swManager = new ServiceWorkerManager();
});

// Export for debugging
window.ServiceWorkerManager = ServiceWorkerManager;