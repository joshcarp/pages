// Pearson College Reunion Chatbot
// Shared chatbot functionality for all pages

class ReunionChatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.backendUrl = 'https://reunion-chatbot-backend-9161453686.us-central1.run.app';
        this.initializeChatbot();
    }

    initializeChatbot() {
        // Only initialize if not already present
        if (!document.querySelector('.chatbot-container')) {
            this.createChatbotHTML();
            this.bindEvents();
            this.addWelcomeMessage();
        }
    }

    createChatbotHTML() {
        const chatbotContainer = document.createElement('div');
        chatbotContainer.className = 'chatbot-container';
        chatbotContainer.innerHTML = `
            <button class="chatbot-toggle" onclick="reunionChatbot.toggleChat()">
                💬
            </button>
            <div class="chatbot-window">
                <div class="chatbot-header">
                    <h3 class="chatbot-title">Reunion Assistant</h3>
                    <p class="chatbot-subtitle">Ask me about the reunion!</p>
                    <button class="chatbot-close" onclick="reunionChatbot.closeChat()">×</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="chatbot-welcome">
                        👋 Hi! I'm your Pearson College reunion assistant powered by AI. Ask me anything about the August 12-15, 2025 reunion!
                    </div>
                </div>
                <div class="chatbot-typing" id="chatbot-typing">
                    <span>Assistant is typing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
                <div class="chatbot-input-container">
                    <input type="text" class="chatbot-input" id="chatbot-input" 
                           placeholder="Ask about schedules, accommodation, activities..." 
                           onkeypress="if(event.key==='Enter') reunionChatbot.sendMessage()">
                    <button class="chatbot-send" id="chatbot-send" onclick="reunionChatbot.sendMessage()">
                        ➤
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(chatbotContainer);
    }

    bindEvents() {
        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            const chatbotContainer = document.querySelector('.chatbot-container');
            if (this.isOpen && !chatbotContainer.contains(e.target)) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const window = document.querySelector('.chatbot-window');
        window.classList.add('active');
        this.isOpen = true;
        
        // Focus input
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 300);
    }

    closeChat() {
        const window = document.querySelector('.chatbot-window');
        window.classList.remove('active');
        this.isOpen = false;
    }



    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addUserMessage(message);
        input.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            const response = await this.getAIResponse(message);
            this.hideTyping();
            this.addBotMessage(response);
        } catch (error) {
            this.hideTyping();
            // Try fallback response if backend fails
            const fallbackResponse = this.getStaticResponse(message);
            this.addBotMessage(fallbackResponse);
            console.error('Chatbot error:', error);
        }
    }

    async getAIResponse(message) {
        const response = await fetch(`${this.backendUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`Backend API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data.response || 'Sorry, I could not generate a response.';
    }

    getStaticResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('schedule') || lowerMessage.includes('agenda')) {
            return 'Check out our interactive schedule at schedule.html or add the events to your Google Calendar! The reunion runs August 12-15, 2025.';
        }
        
        if (lowerMessage.includes('accommodation') || lowerMessage.includes('room') || lowerMessage.includes('stay')) {
            return 'Accommodation is in student rooms with 4-5 single beds each. Check-in is after 12pm on August 12th at the Dining Hall Registration Desk.';
        }
        
        if (lowerMessage.includes('transport') || lowerMessage.includes('shuttle') || lowerMessage.includes('airport')) {
            return 'Free shuttles available (register by June 28): 12pm Swartz Bay, 1pm YYJ Airport, 2pm Royal BC Museum. Contact alumni@pearsoncollege.ca to register.';
        }
        
        if (lowerMessage.includes('cost') || lowerMessage.includes('price') || lowerMessage.includes('fee')) {
            return 'Single day rates: $151.20 off-site, $188.10 on-site. Child rates: $125.38 off-site, $159.62 on-site. Contact alumni@pearsoncollege.ca for registration.';
        }
        
        if (lowerMessage.includes('kids') || lowerMessage.includes('children') || lowerMessage.includes('family')) {
            return 'Yes! Kids are welcome. We have a dedicated Kids Camp with activities. Check kids-camp.html for the full schedule.';
        }
        
        if (lowerMessage.includes('weather') || lowerMessage.includes('clothes') || lowerMessage.includes('pack')) {
            return 'August in Victoria: 15-25°C days, 10-15°C evenings. Bring layers, rain gear, walking shoes, and something dressy for the gala dinner.';
        }
        
        if (lowerMessage.includes('contact') || lowerMessage.includes('help') || lowerMessage.includes('phone')) {
            return 'Main contact: alumni@pearsoncollege.ca. For urgent matters: Phoebe Mason +1 778 769 3745, Ruba Elfurjani +1 778 401 1493. Join our WhatsApp group for live updates!';
        }
        
        return 'I can help with questions about the reunion schedule, accommodation, transportation, costs, kids activities, weather, and contacts. For detailed information, check our FAQ section or contact alumni@pearsoncollege.ca.';
    }



    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message user';
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chatbot-message bot';
        messageDiv.textContent = message;
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addWelcomeMessage() {
        // Welcome message is already in HTML
    }

    showTyping() {
        document.getElementById('chatbot-typing').classList.add('active');
        this.scrollToBottom();
    }

    hideTyping() {
        document.getElementById('chatbot-typing').classList.remove('active');
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Initialize chatbot when page loads
let reunionChatbot;
document.addEventListener('DOMContentLoaded', function() {
    reunionChatbot = new ReunionChatbot();
});
