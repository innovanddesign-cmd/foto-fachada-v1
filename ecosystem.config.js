/**
 * PM2 Ecosystem Configuration
 * ============================
 * Production deployment configuration for Foto Fachada Backend
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 start ecosystem.config.js --env production
 *   pm2 reload ecosystem.config.js --env production
 */
module.exports = {
    apps: [
        {
            // ─────────────────────────────────────────────────────────────
            // MAIN APPLICATION
            // ─────────────────────────────────────────────────────────────
            name: 'foto-fachada-api',
            script: './server/index.js',
            cwd: './',

            // Instances and execution mode
            instances: 'max', // Use all available CPUs
            exec_mode: 'cluster', // Cluster mode for load balancing

            // Auto-restart configuration
            autorestart: true,
            watch: false, // Disable in production
            max_memory_restart: '1G',

            // Restart delays
            restart_delay: 5000,
            max_restarts: 10,
            min_uptime: '10s',

            // Logs
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/error.log',
            out_file: './logs/out.log',
            merge_logs: true,

            // Environment variables (default: development)
            env: {
                NODE_ENV: 'development',
                PORT: 3000
            },

            // Production environment
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,

                // These should be set via PM2 ecosystem or system env
                // GEMINI_API_KEY: '...',
                // STRIPE_SECRET_KEY: '...',
                // STRIPE_WEBHOOK_SECRET: '...',
                // FRONTEND_ORIGIN: 'https://app.fotofachada.com',
                // FRONTEND_URL: 'https://app.fotofachada.com',
            },

            // Graceful shutdown
            kill_timeout: 10000,
            listen_timeout: 10000,

            // Node.js specific
            node_args: [
                '--max-old-space-size=1024',
                '--experimental-specifier-resolution=node'
            ]
        }
    ],

    // ─────────────────────────────────────────────────────────────
    // DEPLOYMENT CONFIGURATION
    // ─────────────────────────────────────────────────────────────
    deploy: {
        production: {
            // SSH connection
            user: 'deploy',
            host: ['your-server.com'],
            ref: 'origin/main',
            repo: 'git@github.com:your-org/foto-fachada.git',
            path: '/var/www/foto-fachada',

            // Pre-deploy commands (on local)
            'pre-deploy-local': '',

            // Post-deploy commands (on server)
            'post-deploy': 'npm ci --production && pm2 reload ecosystem.config.js --env production',

            // Pre-setup commands
            'pre-setup': 'mkdir -p /var/www/foto-fachada/logs',

            // Environment
            env: {
                NODE_ENV: 'production'
            }
        },

        staging: {
            user: 'deploy',
            host: ['staging.your-server.com'],
            ref: 'origin/develop',
            repo: 'git@github.com:your-org/foto-fachada.git',
            path: '/var/www/foto-fachada-staging',
            'post-deploy': 'npm ci && pm2 reload ecosystem.config.js --env staging',
            env: {
                NODE_ENV: 'staging'
            }
        }
    }
};
