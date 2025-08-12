const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: [
        'https://your-reunion-website.com', // Replace with your actual domain
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:8080',
        'http://localhost:8088',
        'http://localhost:5000',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:8088',
        'http://127.0.0.1:5000',
        /\.netlify\.app$/,
        /\.vercel\.app$/,
        /\.github\.io$/,
        /\.pages\.dev$/,
        /file:\/\/.*/ // Allow file:// protocol for local testing
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'reunion-chatbot-backend'
    });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Message is required and must be a non-empty string'
            });
        }

        // Validate message length
        if (message.length > 1000) {
            return res.status(400).json({
                error: 'Message too long. Maximum 1000 characters allowed.'
            });
        }

        const response = await getChatResponse(message);
        
        res.json({
            response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        
        // Don't expose internal errors to client
        res.status(500).json({
            error: 'An error occurred processing your request. Please try again.',
            timestamp: new Date().toISOString()
        });
    }
});

async function getChatResponse(message) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    const context = getReunionContext();
    
    const prompt = `You are a helpful assistant for the Pearson College UWC 20th Reunion (August 12-15, 2025). 

REUNION CONTEXT:
${context}

USER QUESTION: ${message}

Please provide a helpful, accurate response based on the reunion information. Keep responses concise but informative (under 300 words). If you don't have specific information, guide users to contact alumni@pearsoncollege.ca or check the FAQ section.`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.8,
            topK: 40
        }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error:', response.status, errorText);
        throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Unexpected Gemini API response:', data);
        throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text || 'Sorry, I could not generate a response.';
}

function getReunionContext() {
    return `PEARSON COLLEGE UWC 20TH REUNION - COMPREHENSIVE INFORMATION
Date: August 12-15, 2025
Location: Pearson College UWC Campus, Metchosin, BC, Canada

=== KEY CONTACTS ===
- General Inquiries: alumni@pearsoncollege.ca
- Phoebe Mason (Alumni Engagement Manager): pmason@pearsoncollege.ca, +1 778 769 3745
- Ruba Elfurjani (Alumni and Community Engagement Coordinator): relfurjani@pearsoncollege.ca, +1 778 401 1493  
- Joshua Carpeggiani (Volunteer): +1 416 829 3973

=== ARRIVAL & CHECK-IN ===
- Check-in: After 12:00pm August 12 at Dining Hall Registration Desk
- Late arrival: Notify if arriving after 6:00 PM for room assignment and food planning
- Check-out: By 10:00am on last day

FREE SHUTTLES (register by June 28):
- 12:00pm - Swartz Bay Ferry Terminal  
- 1:00pm - Victoria International Airport (YYJ)
- 2:00pm - Royal BC Museum, Downtown Victoria

DEPARTURE SHUTTLES:
- 8:00am - To Swartz Bay Ferry Terminal and YYJ Airport
- 10:00am - To Royal BC Museum Downtown Victoria

=== ACCOMMODATION ===
- Student rooms with 4-5 single beds, easily rearranged
- Shared bathrooms per floor with multiple toilets, sinks, showers
- Day rooms with sofas, fireplace, kitchenette with tea/coffee
- Accessibility: Room 6 in Stoki House (wheelchair accessible)
- Accessible washrooms in Dining Hall, Stoki House, Max Bell, Ondaajte

=== PRICING ===
Individual Day Registration:
- 20-Year single day off-site: $151.20
- 20-Year full day onsite: $188.10  
- Child off-site: $125.38
- Child on-site: $159.62

=== COMPLETE SCHEDULE ===

MONDAY, AUGUST 12, 2025:
12:00-12:30 - Ferry pickup (transportation)
13:00-13:30 - Airport pickup (transportation)  
14:00-14:30 - Downtown pickup (transportation)
14:00-17:00 - Check-in opens, Sign up for waterfront activities, Light refreshments (Dining Hall)
14:00-17:30 - Race Rocks trips (Waterfront Dock)
17:30-18:00 - Welcome and Land Acknowledgment (Dining Hall)
18:00-20:00 - Welcome BBQ (Dining Hall)
20:30-00:00 - Party (Student Common Room)

TUESDAY, AUGUST 13, 2025:
08:00-09:00 - Breakfast (Dining Hall)
09:00-10:30 - Village Meeting and Update from Head of College (Max Bell) 
  Zoom: https://us02web.zoom.us/j/82140169321?pwd=GgbONaaMvysXBYYNLj01lbfbroLdyo.1
10:30-11:00 - End of Village Gathering: Group Photo (Max Bell Steps)
10:30-11:00 - Cookie Break (Dining Hall)
11:00-12:30 - Race Rocks trip (Waterfront Dock)
11:00-12:00 - Infrastructure Tour (meet in Dining Hall)
12:00-13:00 - Lunch (Dining Hall)
13:00-17:45 - Waterfront activities: Race Rocks, Kayaking, Canoeing (Waterfront Dock)
14:00-15:00 - Alumni Talk - Tim & Naja: Indigenous language revitalization
15:00-16:00 - Giving Impact Reception - all welcome (Student Common Room)
16:00-17:00 - Alumni Talk - Erik: From Pearson to NASA
17:45-18:00 - Get ready for dinner (Residence)
18:00-19:00 - Dinner (Dining Hall)
19:30-21:00 - Musical performances by Alumni (Max Bell)
21:00-00:00 - DJ Party (Student Common Room)

WEDNESDAY, AUGUST 14, 2025:
08:00-09:00 - Breakfast (Dining Hall)
09:00-12:00 - Campus wide clean-up (Campus wide)
09:00-12:00 - Free time / Wellness activities (Campus wide)
12:00-13:00 - Lunch (Dining Hall)
13:00-17:30 - Afternoon activities: Hiking, Tennis, Basketball, Victoria day trips
15:00-17:30 - Race Rocks trips (Waterfront Dock)
18:00-19:00 - Reception drinks (Student Common Room)
19:00-22:30 - Gala Dinner (Dining Hall)
22:30-01:00 - DJ Party (Student Common Room)

THURSDAY, AUGUST 15, 2025:
08:00-09:00 - Breakfast (Dining Hall)
09:00-10:00 - Packing and Check-out (Residence)
10:00-11:00 - Closing Ceremony and Farewell (Max Bell)
11:00-12:00 - Final goodbyes and departures

=== KIDS CAMP DETAILED SCHEDULE ===

TUESDAY, AUGUST 13 - Kids Camp:
09:30-10:30 - Sign-in and Free-play (Library) - All Groups A, B, C
10:30-11:00 - Ice-breaker Game (Qol'ew Lawn) - All Groups A, B, C  
11:00-12:00 - Rock Painting (Qol'ew Lawn) - All Groups A, B, C
12:00-13:00 - Lunch (Dining Hall) - All Groups A, B, C
13:00-14:00 - Scavenger Hunt (Campus) - All Groups A, B, C
14:00-15:00 - Arts and Crafts (Library) - All Groups A, B, C
15:00-16:00 - Nature Walk (Campus trails) - All Groups A, B, C
16:00-17:00 - Free play and games (Qol'ew Lawn) - All Groups A, B, C
17:00-17:30 - Clean-up and Pick-up (Library) - All Groups A, B, C

WEDNESDAY, AUGUST 14 - Kids Camp:
09:30-10:30 - Sign-in and Free-play (Library) - All Groups A, B, C
10:30-11:30 - Team Building Games (Qol'ew Lawn) - All Groups A, B, C
11:30-12:30 - Science Experiments (Library) - All Groups A, B, C
12:30-13:30 - Lunch (Dining Hall) - All Groups A, B, C
13:30-14:30 - Storytelling Circle (Library) - All Groups A, B, C
14:30-15:30 - Outdoor Games (Qol'ew Lawn) - All Groups A, B, C
15:30-16:30 - Creative Writing/Drawing (Library) - All Groups A, B, C
16:30-17:30 - Final presentations and celebration (Library) - All Groups A, B, C

=== ACTIVITIES & AMENITIES ===

WATERFRONT ACTIVITIES (sign up onsite, first come first served):
- Race Rocks tours - ecological protection in mind, August sensitive for nesting birds
- Kayaking with college kayaks - scheduled time slots, waiver required
- Canoeing with large canoes - scheduled time slots, waiver required
- Waiver forms sent via email before reunion

RECREATIONAL FACILITIES:
- Tennis courts (open for use)
- Basketball courts (open for use)  
- Hiking trails on and near campus
- Cycling opportunities (no bikes provided, helmets mandatory in BC)
- Victoria day trips (alumni can organize to Royal BC Museum, Inner Harbour, downtown shopping)

PROHIBITED ACTIVITIES:
- No scuba diving during reunion
- No campfires available during reunion
- Mary Hill military training facility is off-limits

=== FOOD & DINING ===
- All meals provided as per schedule
- Alert of food allergies early via registration or email alumni@pearsoncollege.ca
- Bar available evenings from dinner until midnight (Dining Hall, Max Bell, or Common Room)
- Bar accepts cash (Canadian dollars only) and card payments
- College merchandise available at Dining Hall during lunch and dinner (cash or card)
- NO CASH MACHINES ON CAMPUS - bring money for alcohol/auction if no cards

=== WEATHER & PACKING ===
Victoria August weather: 15-25°C days, 10-15°C evenings

RECOMMENDED ITEMS:
- Sweater or light jacket for evenings
- Something dressy for Gala Dinner (comfort over fashion)
- Good walking shoes or boots for trails  
- Rain gear and extra shoes
- Sunscreen, sunglasses, hat
- Insect repellent (mosquitoes near wooded areas)
- Personal toiletries (towels and linens provided)

=== IMPORTANT DEADLINES ===
- Shuttle registration: June 28
- Travel Fund applications: May 15 (pay upfront, reimbursed in cash at check-in)
- Cancellation for full refund (minus $25 fee): July 15
- Electronic Travel Authorization: Required for many countries entering Canada

=== FAMILY & CHILDREN ===
- Kids Camp with dedicated counselors and structured activities
- Parents/caregivers primarily responsible for children supervision
- Campus safe but reunion programming not for unsupervised minors
- Notify college of specific requirements: car seats, life jackets, highchairs (rental costs to registrant)
- Many walking trails and parks for quiet time

=== VOLUNTEERING & INVOLVEMENT ===
- Alumni encouraged to volunteer: contact alumni@pearsoncollege.ca
- Self-directed activities: organize walks, soccer games, store runs
- Partner activities: alumni can organize orientation sessions for spouses/partners
- Reunions primarily designed and carried out by alumni

=== RESOURCES & LINKS ===
- WhatsApp group for live updates: https://chat.whatsapp.com/Fwjx6oQm6VCBI7FNMyMq5O
- Google Drive folder: https://drive.google.com/drive/folders/1vrDb9o7IfQhWZOE_ixKNao0dgOvSpud8
- Main calendar: https://calendar.google.com/calendar/u/0?cid=OWYwNmYwYzliYmY3ZDc3ZmUzZTBjMzdlYTNhOWExNjU4NzQ2OTg4ODNkOTlmY2ZjNzIzMDZmN2M1YjIwMWNiOUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t
- Kids camp calendar: https://calendar.google.com/calendar/u/0?cid=MjYxNjRhMmVhNDA4MTkyNTUwNjc0NzM4OTJiYWQyZmY4NmQzZmNhZDU3MWYzMDU3MmVmMDg3ZTlhNjIyMmQ2MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t

=== TRAVEL FUND ===
- Available for alumni who need travel cost assistance
- Deadline to apply: May 15
- Apply at: https://www.pearsoncollege.ca/alumni/reunions/travel-fund/
- Reimbursement: Pay upfront, get reimbursed in cash at check-in
- Guests and dependents not eligible for funding`;
}

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: 'The requested endpoint does not exist.'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred.'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Reunion Chatbot Backend running on port ${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
    console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔴 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🔴 SIGINT received, shutting down gracefully');
    process.exit(0);
});
