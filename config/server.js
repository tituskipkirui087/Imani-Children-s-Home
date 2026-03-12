const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Determine root path - works both locally and on Render
const basePath = path.resolve(__dirname);
const rootPath = path.join(basePath, '..');

// Check if we're in config folder or root
const publicPath = fs.existsSync(path.join(rootPath, 'public')) 
    ? path.join(rootPath, 'public') 
    : path.join(basePath, 'public');
const configPath = fs.existsSync(path.join(rootPath, 'config')) 
    ? path.join(rootPath, 'config') 
    : basePath;

console.log('Server paths:', { basePath, rootPath, publicPath, configPath });
console.log('Public exists:', fs.existsSync(publicPath));
console.log('Config exists:', fs.existsSync(configPath));

app.use(express.static(publicPath));
app.use('/public', express.static(publicPath));
app.use('/config', express.static(configPath));

// CORS headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Paystack-Signature');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Health check endpoint for Render (must be before static files)
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Also support /api/health for compatibility
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Paystack keys from environment
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'YOUR_PAYSTACK_SECRET_KEY';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || 'YOUR_PAYSTACK_PUBLIC_KEY';

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Function to send Telegram notification with APPROVE button
async function sendTelegramNotification(message, reference) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.log('Telegram bot not configured. Message:', message);
        return;
    }
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '✅ APPROVED',
                            callback_data: `approve_${reference}`
                        },
                        {
                            text: '❌ REJECTED',
                            callback_data: `reject_${reference}`
                        }
                    ]
                ]
            }
        });
        console.log('Telegram notification sent successfully');
    } catch (error) {
        console.error('Error sending Telegram notification:', error.message);
    }
}

// API route to get Paystack public key
app.get('/api/paystack-key', (req, res) => {
    res.json({ key: PAYSTACK_PUBLIC_KEY });
});

// Webhook endpoint
app.post('/api/webhook', async (req, res) => {
    const payload = JSON.stringify(req.body);
    const signature = req.headers['paystack-signature'];
    
    // Verify signature (optional in production)
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(payload).digest('hex');
    
    const isValid = hash === signature;
    
    console.log('Webhook received:', {
        event: req.body.event,
        valid: isValid
    });
    
    try {
        if (req.body.event === 'charge.success') {
            const data = req.body.data;
            const reference = data.reference;
            const amount = data.amount / 100; // Paystack sends in kobo
            const email = data.customer?.email;
            
            console.log('Payment successful:', { reference, amount, email });
            
            // Send Telegram notification
            const telegramMessage = `🎉 <b>New Donation Received!</b>\n\n💰 Amount: KSh ${amount.toLocaleString()}\n📧 Email: ${email || 'N/A'}\n🔖 Reference: ${reference}\n\nThank you for supporting Imani Children's Home!`;
            await sendTelegramNotification(telegramMessage, reference);
            
            // In production: Update database, send confirmation email, etc.
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Card payment verification endpoint
app.post('/api/verify-payment', async (req, res) => {
    const { reference } = req.body;
    
    if (!reference) {
        return res.json({ success: false, message: 'Payment reference is required' });
    }
    
    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const data = response.data;
        
        if (data.status === true && data.data.status === 'success') {
            res.json({
                success: true,
                status: 'success',
                message: 'Payment verified successfully',
                data: {
                    reference: data.data.reference,
                    amount: data.data.amount / 100,
                    email: data.data.customer?.email,
                    transaction_id: data.data.id
                }
            });
        } else {
            res.json({
                success: false,
                status: 'failed',
                message: 'Payment was not successful'
            });
        }
    } catch (error) {
        console.error('Verification error:', error.response?.data || error.message);
        res.json({
            success: false,
            status: 'error',
            message: error.response?.data?.message || 'Failed to verify payment'
        });
    }
});

// NOWPayment API endpoints
const NOWPAYMENT_API_KEY = '6XQDG6M-WK54TG4-GWA8712-VA25NZW';

// Create payment
app.post('/api/nowpayment', async (req, res) => {
    const { price_amount, pay_currency } = req.body;
    
    if (!price_amount) {
        return res.json({ error: 'Amount is required' });
    }
    
    try {
        const response = await axios.post(
            'https://api.nowpayments.io/v1/payment',
            {
                price_amount: price_amount,
                price_currency: 'usd',
                pay_currency: pay_currency || 'btc',
                order_description: 'Donation to Imani Children Home',
                order_id: 'IMANI_' + Date.now()
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': NOWPAYMENT_API_KEY
                }
            }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('NOWPayment error:', error.response?.data || error.message);
        res.json({ error: error.response?.data?.message || 'Failed to create payment' });
    }
});

// Check payment status
app.get('/api/nowpayment', async (req, res) => {
    const { payment_id } = req.query;
    
    if (!payment_id) {
        return res.json({ error: 'Payment ID is required' });
    }
    
    try {
        const response = await axios.get(
            `https://api.nowpayments.io/v1/payment/${payment_id}`,
            {
                headers: { 'x-api-key': NOWPAYMENT_API_KEY }
            }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('NOWPayment status error:', error.response?.data || error.message);
        res.json({ error: error.response?.data?.message || 'Failed to get payment status' });
    }
});

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'about.html'));
});

app.get('/how-to-help', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'how-to-help.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'blog.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'contact.html'));
});

app.get('/testimonials', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'testimonials.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'faq.html'));
});

// Telegram callback query handler for APPROVE/REJECT buttons
app.post('/api/telegram-callback', async (req, res) => {
    const callbackQuery = req.body.callback_query;
    if (!callbackQuery) {
        return res.json({ ok: true });
    }
    
    const data = callbackQuery.data;
    const messageId = callbackQuery.message?.message_id;
    const chatId = callbackQuery.message?.chat?.id;
    
    if (data?.startsWith('approve_') || data?.startsWith('reject_')) {
        const reference = data.split('_')[1];
        const isApproved = data.startsWith('approve_');
        
        const status = isApproved ? '✅ APPROVED' : '❌ REJECTED';
        
        // Send confirmation back to user
        try {
            const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
            await axios.post(url, {
                chat_id: chatId,
                message_id: messageId,
                text: callbackQuery.message.text + `\n\n👤 <b>Status: ${status}</b>`,
                parse_mode: 'HTML'
            });
            
            // Answer callback query to remove loading state
            await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
                callback_query_id: callbackQuery.id,
                text: `Payment ${isApproved ? 'approved' : 'rejected'}!`
            });
            
            console.log(`Payment ${reference} marked as ${status}`);
        } catch (error) {
            console.error('Error handling callback:', error.message);
        }
    }
    
    res.json({ ok: true });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Telegram webhook setup endpoint - visit this to set up the webhook
app.get('/setup-telegram-webhook', async (req, res) => {
    if (!TELEGRAM_BOT_TOKEN) {
        return res.json({ error: 'TELEGRAM_BOT_TOKEN not configured' });
    }
    
    const webhookUrl = `${req.protocol}://${req.get('host')}/api/telegram-callback`;
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
        const response = await axios.post(url, { url: webhookUrl });
        res.json({ success: true, result: response.data });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Test endpoint to check static files
app.get('/test-files', (req, res) => {
    const publicPath = path.join(__dirname, '..', 'public');
    const configPath = path.join(__dirname, '..', 'config');
    
    let result = {
        publicDir: publicPath,
        publicExists: fs.existsSync(publicPath),
        configDir: configPath,
        configExists: fs.existsSync(configPath),
        files: {}
    };
    
    if (fs.existsSync(publicPath)) {
        result.files.public = fs.readdirSync(publicPath);
    }
    if (fs.existsSync(configPath)) {
        result.files.config = fs.readdirSync(configPath);
    }
    
    res.json(result);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
