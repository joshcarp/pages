/**
 * QR Code Component - Generates QR codes for current page URL
 * This script creates a floating QR code button that displays the current page URL as a QR code
 */

// QR Code generation using qrcode.js library
// We'll use the CDN version for simplicity
function loadQRCodeLibrary() {
    return new Promise((resolve, reject) => {
        if (window.QRCode) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// QR Code Button Component
class QRCodeButton {
    constructor() {
        this.isVisible = false;
        this.button = null;
        this.modal = null;
        this.init();
    }

    async init() {
        try {
            await loadQRCodeLibrary();
            this.createButton();
            this.createModal();
            this.attachEventListeners();
        } catch (error) {
            console.error('Failed to load QR Code library:', error);
        }
    }

    createButton() {
        this.button = document.createElement('button');
        this.button.id = 'qr-code-button';
        this.button.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2"/>
                <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
                <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
                <rect x="14" y="14" width="2" height="2" fill="currentColor"/>
                <rect x="18" y="14" width="2" height="2" fill="currentColor"/>
                <rect x="16" y="16" width="2" height="2" fill="currentColor"/>
                <rect x="14" y="18" width="2" height="2" fill="currentColor"/>
                <rect x="18" y="18" width="2" height="2" fill="currentColor"/>
            </svg>
            <span>QR Code</span>
        `;
        this.button.title = 'Show QR Code for this page';
        document.body.appendChild(this.button);
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
                    <div id="qr-code-container"></div>
                    <p class="qr-url"></p>
                    <div class="qr-actions">
                        <button class="qr-download-btn">Download QR Code</button>
                        <button class="qr-copy-btn">Copy URL</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
    }

    attachEventListeners() {
        // Open modal
        this.button.addEventListener('click', () => this.showModal());
        
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

    async showModal() {
        const currentURL = window.location.href;
        const qrContainer = this.modal.querySelector('#qr-code-container');
        const urlDisplay = this.modal.querySelector('.qr-url');
        
        // Clear previous content
        qrContainer.innerHTML = '';
        urlDisplay.textContent = currentURL;
        
        try {
            // Generate QR code
            const canvas = document.createElement('canvas');
            await QRCode.toCanvas(canvas, currentURL, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            qrContainer.appendChild(canvas);
            
            this.modal.style.display = 'flex';
            this.isVisible = true;
            
            // Focus management for accessibility
            this.modal.querySelector('.qr-modal-close').focus();
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            qrContainer.innerHTML = '<p style="color: #ff4444;">Failed to generate QR code</p>';
            this.modal.style.display = 'flex';
            this.isVisible = true;
        }
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.isVisible = false;
        this.button.focus(); // Return focus to button
    }

    downloadQRCode() {
        const canvas = this.modal.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `qr-code-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    }

    async copyURL() {
        const url = window.location.href;
        try {
            await navigator.clipboard.writeText(url);
            const button = this.modal.querySelector('.qr-copy-btn');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.background = '#28a745';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
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
        }
    }
}

// CSS Styles for QR Code Button and Modal
function injectQRCodeStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* QR Code Button */
        #qr-code-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            font-family: inherit;
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            min-width: 120px;
            justify-content: center;
        }

        #qr-code-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
        }

        #qr-code-button:active {
            transform: translateY(0);
        }

        #qr-code-button svg {
            width: 20px;
            height: 20px;
        }

        /* QR Code Modal */
        #qr-code-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        }

        .qr-modal-content {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            max-width: 400px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-30px) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .qr-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px 16px;
            border-bottom: 1px solid #eee;
        }

        .qr-modal-header h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }

        .qr-modal-close {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
        }

        .qr-modal-close:hover {
            background: #f5f5f5;
            color: #333;
        }

        .qr-modal-body {
            padding: 24px;
            text-align: center;
        }

        #qr-code-container {
            margin-bottom: 16px;
            display: flex;
            justify-content: center;
        }

        #qr-code-container canvas {
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .qr-url {
            font-size: 12px;
            color: #666;
            word-break: break-all;
            margin: 16px 0;
            padding: 8px 12px;
            background: #f8f9fa;
            border-radius: 6px;
            border: 1px solid #e9ecef;
        }

        .qr-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .qr-download-btn,
        .qr-copy-btn {
            padding: 10px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s ease;
            font-size: 14px;
        }

        .qr-download-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .qr-download-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .qr-copy-btn {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #dee2e6;
        }

        .qr-copy-btn:hover {
            background: #e9ecef;
            border-color: #adb5bd;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            #qr-code-button {
                bottom: 16px;
                right: 16px;
                padding: 10px 16px;
                font-size: 13px;
                min-width: 100px;
            }

            #qr-code-button svg {
                width: 18px;
                height: 18px;
            }

            .qr-modal-content {
                margin: 20px;
                width: calc(100% - 40px);
            }

            .qr-modal-header,
            .qr-modal-body {
                padding: 16px 20px;
            }

            .qr-actions {
                flex-direction: column;
                align-items: stretch;
            }

            #qr-code-container canvas {
                max-width: 100%;
                height: auto;
            }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
            #qr-code-button {
                background: #0066cc;
                border: 2px solid #004499;
            }

            .qr-modal-content {
                border: 2px solid #333;
            }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            #qr-code-button,
            .qr-modal-content,
            .qr-download-btn,
            .qr-copy-btn,
            .qr-modal-close {
                transition: none;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize QR Code Component when DOM is loaded
function initQRCodeComponent() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectQRCodeStyles();
            new QRCodeButton();
        });
    } else {
        injectQRCodeStyles();
        new QRCodeButton();
    }
}

// Auto-initialize
initQRCodeComponent();
