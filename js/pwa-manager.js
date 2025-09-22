/**
 * PWA Manager - Handles installation, updates, and offline functionality
 */
class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.updateAvailable = false;
    
    this.init();
  }

  init() {
    this.setupInstallPrompt();
    this.setupUpdateDetection();
    this.setupOnlineStatus();
    this.setupServiceWorker();
    this.checkInstallationStatus();
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA install prompt triggered');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.isInstalled = true;
      this.hideInstallButton();
      this.deferredPrompt = null;
      this.showNotification('App installed successfully!', 'success');
    });
  }

  setupUpdateDetection() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        this.updateAvailable = true;
        this.showUpdateNotification();
      });
    }
  }

  setupOnlineStatus() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.hideOfflineIndicator();
      this.showNotification('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineIndicator();
      this.showNotification('You are now offline', 'warning');
    });
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./js/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.updateAvailable = true;
                this.showUpdateNotification();
              }
            });
          });
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }

  checkInstallationStatus() {
    // Check if app is running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      this.isInstalled = true;
      this.hideInstallButton();
    }
  }

  async installApp() {
    if (!this.deferredPrompt) {
      this.showNotification('App installation not available', 'error');
      return;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('Error during app installation:', error);
      this.showNotification('Installation failed', 'error');
    }
  }

  async updateApp() {
    if (!this.updateAvailable) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ action: 'skipWaiting' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating app:', error);
      this.showNotification('Update failed', 'error');
    }
  }

  showInstallButton() {
    let installButton = document.getElementById('pwa-install-btn');
    if (!installButton) {
      installButton = this.createInstallButton();
      document.body.appendChild(installButton);
    }
    installButton.style.display = 'block';
  }

  hideInstallButton() {
    const installButton = document.getElementById('pwa-install-btn');
    if (installButton) {
      installButton.style.display = 'none';
    }
  }

  createInstallButton() {
    const button = document.createElement('button');
    button.id = 'pwa-install-btn';
    button.className = 'pwa-install-button';
    button.innerHTML = `
      <i class="fas fa-download"></i>
      <span>Install App</span>
    `;
    button.addEventListener('click', () => this.installApp());
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .pwa-install-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white;
        border: none;
        border-radius: 50px;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        transition: all 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .pwa-install-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
      }
      
      .pwa-install-button:active {
        transform: translateY(0);
      }
      
      @media (max-width: 768px) {
        .pwa-install-button {
          bottom: 80px;
          right: 15px;
          padding: 10px 16px;
          font-size: 13px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return button;
  }

  showUpdateNotification() {
    const notification = this.createNotification(
      'Update Available',
      'A new version of the app is available. Click to update.',
      'info',
      () => this.updateApp()
    );
    document.body.appendChild(notification);
  }

  showOfflineIndicator() {
    let indicator = document.getElementById('offline-indicator');
    if (!indicator) {
      indicator = this.createOfflineIndicator();
      document.body.appendChild(indicator);
    }
    indicator.style.display = 'block';
  }

  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.display = 'none';
    }
  }

  createOfflineIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'offline-indicator';
    indicator.className = 'offline-indicator';
    indicator.innerHTML = `
      <i class="fas fa-wifi"></i>
      <span>You are offline</span>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .offline-indicator {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f59e0b;
        color: white;
        padding: 8px 16px;
        text-align: center;
        font-size: 14px;
        font-weight: 500;
        z-index: 1001;
        display: none;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      
      .offline-indicator i {
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
    
    return indicator;
  }

  showNotification(message, type = 'info', action = null) {
    const notification = this.createNotification(
      type === 'success' ? 'Success' : 
      type === 'error' ? 'Error' : 
      type === 'warning' ? 'Warning' : 'Info',
      message,
      type,
      action
    );
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  createNotification(title, message, type, action = null) {
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">
          <i class="fas fa-${type === 'success' ? 'check-circle' : 
                        type === 'error' ? 'exclamation-circle' : 
                        type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
          <span class="notification-title">${title}</span>
          <button class="notification-close" onclick="this.parentNode.parentNode.parentNode.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="notification-message">${message}</div>
        ${action ? `<button class="notification-action" onclick="(${action.toString()})()">Update</button>` : ''}
      </div>
    `;
    
    // Add styles if not already added
    if (!document.getElementById('pwa-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'pwa-notification-styles';
      style.textContent = `
        .pwa-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1002;
          min-width: 300px;
          max-width: 400px;
          animation: slideIn 0.3s ease;
        }
        
        .pwa-notification-success {
          border-left: 4px solid #10b981;
        }
        
        .pwa-notification-error {
          border-left: 4px solid #ef4444;
        }
        
        .pwa-notification-warning {
          border-left: 4px solid #f59e0b;
        }
        
        .pwa-notification-info {
          border-left: 4px solid #3b82f6;
        }
        
        .notification-content {
          padding: 16px;
        }
        
        .notification-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .notification-title {
          font-weight: 600;
          flex: 1;
        }
        
        .notification-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
        }
        
        .notification-message {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
        }
        
        .notification-action {
          margin-top: 12px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
          font-size: 14px;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 768px) {
          .pwa-notification {
            right: 10px;
            left: 10px;
            min-width: auto;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    return notification;
  }

  // Utility methods
  isPWAInstalled() {
    return this.isInstalled;
  }

  isOnline() {
    return this.isOnline;
  }

  hasUpdateAvailable() {
    return this.updateAvailable;
  }
}

// Initialize PWA Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pwaManager = new PWAManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAManager;
}
