/**
 * Simple QR Code Component - No external dependencies
 * Creates a floating QR code button that displays the current page URL as a QR code
 */

// Simple QR Code generation using QR Server API
class SimpleQRCodeButton {
    constructor() {
        this.isVisible = false;
        this.button = null;
        this.modal = null;
        this.init();
    }

    init() {
        this.createButton();
        this.createModal();
        this.attachEventListeners();
        console.log('QR Code button initialized');
    }

    createButton() {
        this.button = document.createElement('button');
        this.button.id = 'qr-code-button';
        this.button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" fill="none"/>
                <rect x="5" y="5" width="3" height="3"/>
                <rect x="16" y="5" width="3" height="3"/>
                <rect x="5" y="16" width="3" height="3"/>
                <rect x="14" y="14" width="2" height="2"/>
                <rect x="18" y="14" width="2" height="2"/>
                <rect x="16" y="16" width="2" height="2"/>
                <rect x="14" y="18" width="2" height="2"/>
                <rect x="18" y="18" width="2" height="2"/>
            </svg>
            <span>QR Code</span>
        `;
        this.button.title = 'Show QR Code for this page';
        
        // Apply styles directly
        Object.assign(this.button.style, {
            position: 'fixed',
            bottom: '20px',
            right: '140px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            fontFamily: 'inherit',
            fontSize: '14px',
            fontWeight: '600',
            zIndex: '1000',
            minWidth: '120px',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
        });
        
        // Responsive positioning for mobile
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleMediaQuery = (e) => {
            if (e.matches) {
                // Mobile: stack the QR button above the chatbot
                this.button.style.bottom = '90px';
                this.button.style.right = '20px';
            } else {
                // Desktop: place QR button to the left of chatbot
                this.button.style.bottom = '20px';
                this.button.style.right = '140px';
            }
        };
        
        mediaQuery.addListener(handleMediaQuery);
        handleMediaQuery(mediaQuery);
        
        document.body.appendChild(this.button);
        console.log('QR button created and added to page');
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'qr-code-modal';
        this.modal.innerHTML = `
            <div class="qr-modal-content">
                <div class="qr-modal-header">
                    <h3>QR Code for this page</h3>
                    <button class="qr-modal-close">&times;</button>
                </div>
                <div class="qr-modal-body">
                    <div id="qr-code-container">
                        <img id="qr-image" alt="QR Code" style="max-width: 100%; border-radius: 8px;">
                    </div>
                    <p class="qr-url"></p>
                    <div class="qr-actions">
                        <button class="qr-download-btn">Download QR Code</button>
                        <button class="qr-copy-btn">Copy URL</button>
                    </div>
                </div>
            </div>
        `;
        
        // Apply modal styles
        Object.assign(this.modal.style, {
            display: 'none',
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: '10000',
            alignItems: 'center',
            justifyContent: 'center'
        });
        
        // Style modal content
        const modalContent = this.modal.querySelector('.qr-modal-content');
        Object.assign(modalContent.style, {
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            maxWidth: '400px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
        });
        
        // Style header
        const header = this.modal.querySelector('.qr-modal-header');
        Object.assign(header.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #eee'
        });
        
        // Style close button
        const closeBtn = this.modal.querySelector('.qr-modal-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666',
            padding: '4px',
            borderRadius: '4px'
        });
        
        // Style body
        const body = this.modal.querySelector('.qr-modal-body');
        Object.assign(body.style, {
            padding: '24px',
            textAlign: 'center'
        });
        
        // Style URL display
        const urlDisplay = this.modal.querySelector('.qr-url');
        Object.assign(urlDisplay.style, {
            fontSize: '12px',
            color: '#666',
            wordBreak: 'break-all',
            margin: '16px 0',
            padding: '8px 12px',
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
        });
        
        // Style actions
        const actions = this.modal.querySelector('.qr-actions');
        Object.assign(actions.style, {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
        });
        
        // Style buttons
        const downloadBtn = this.modal.querySelector('.qr-download-btn');
        const copyBtn = this.modal.querySelector('.qr-copy-btn');
        
        [downloadBtn, copyBtn].forEach(btn => {
            Object.assign(btn.style, {
                padding: '10px 16px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
            });
        });
        
        Object.assign(downloadBtn.style, {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
        });
        
        Object.assign(copyBtn.style, {
            background: '#f8f9fa',
            color: '#333',
            border: '1px solid #dee2e6'
        });
        
        document.body.appendChild(this.modal);
    }

    attachEventListeners() {
        // Open modal
        this.button.addEventListener('click', () => this.showModal());
        
        // Hover effects
        this.button.addEventListener('mouseenter', () => {
            this.button.style.transform = 'translateY(-2px)';
            this.button.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.4)';
        });
        
        this.button.addEventListener('mouseleave', () => {
            this.button.style.transform = 'translateY(0)';
            this.button.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.3)';
        });
        
        // Close modal
        this.modal.querySelector('.qr-modal-close').addEventListener('click', () => this.hideModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
        
        // Download QR code
        this.modal.querySelector('.qr-download-btn').addEventListener('click', () => this.downloadQRCode());
        
        // Copy URL
        this.modal.querySelector('.qr-copy-btn').addEventListener('click', () => this.copyURL());
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) this.hideModal();
        });
    }

    showModal() {
        // Remove index.html from URL if present
        let currentURL = window.location.href;
        if (currentURL.endsWith('/index.html')) {
            currentURL = currentURL.replace('/index.html', '/');
        }
        
        const qrImage = this.modal.querySelector('#qr-image');
        const urlDisplay = this.modal.querySelector('.qr-url');
        
        urlDisplay.textContent = currentURL;
        
        // Use QR Server API to generate QR code
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(currentURL)}`;
        qrImage.src = qrApiUrl;
        qrImage.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        
        this.modal.style.display = 'flex';
        this.isVisible = true;
        
        // Focus management for accessibility
        this.modal.querySelector('.qr-modal-close').focus();
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.isVisible = false;
        this.button.focus(); // Return focus to button
    }

    downloadQRCode() {
        const qrImage = this.modal.querySelector('#qr-image');
        if (qrImage && qrImage.src) {
            const link = document.createElement('a');
            link.download = `qr-code-${new Date().getTime()}.png`;
            link.href = qrImage.src;
            link.click();
        }
    }

    async copyURL() {
        // Remove index.html from URL if present
        let url = window.location.href;
        if (url.endsWith('/index.html')) {
            url = url.replace('/index.html', '/');
        }
        try {
            await navigator.clipboard.writeText(url);
            const button = this.modal.querySelector('.qr-copy-btn');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = '#28a745';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '#f8f9fa';
            }, 2000);
        } catch (error) {
            console.error('Failed to copy URL:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const button = this.modal.querySelector('.qr-copy-btn');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        }
    }
}

// Initialize immediately when script loads
console.log('QR Code script loading...');

function initQRCode() {
    console.log('Initializing QR Code component');
    new SimpleQRCodeButton();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQRCode);
} else {
    initQRCode();
}
