/**
 * Health Check Script
 * ===================
 * Runs periodically to check server status.
 * Usage: node scripts/health-check.js
 * Add to crontab: *\/5 * * * * node /path/to/scripts/health-check.js
 */

const http = require('http');
const nodemailer = require('nodemailer'); // Requires installation if used

const HEALTH_ENDPOINT = 'http://localhost:3000/health';
const ALERT_EMAIL = 'admin@fotofachada.com';

const checkHealth = () => {
    const req = http.get(HEALTH_ENDPOINT, (res) => {
        if (res.statusCode === 200) {
            console.log(`[${new Date().toISOString()}] Health Check: OK`);
        } else {
            console.error(`[${new Date().toISOString()}] Health Check: FAILED (Status ${res.statusCode})`);
            sendAlert(`Server responded with status code ${res.statusCode}`);
        }
    });

    req.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] Health Check: ERROR (${err.message})`);
        sendAlert(`Connection refused: ${err.message}`);
    });

    req.end();
};

const sendAlert = (message) => {
    // Simulated Alert - In production, use nodemailer, Slack webhook, or SMS
    console.error('!!! ALERT !!! ' + message);

    // Example NodeMailer (commented out)
    /*
    const transporter = nodemailer.createTransport({ ... });
    transporter.sendMail({
        from: 'monitor@fotofachada.com',
        to: ALERT_EMAIL,
        subject: 'URGENT: Server Down',
        text: message
    });
    */
};

checkHealth();
