import fs from 'fs';

console.log('🚀 Starting Model List script...');

let apiKey = '';
try {
    if (fs.existsSync('./.env.local')) {
        const envContent = fs.readFileSync('./.env.local', 'utf-8');
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
        if (match) apiKey = match[1].trim();
    }
} catch (e) {
    console.error('Error reading env file:', e);
}

if (!apiKey) {
    console.error('❌ No API Key found.');
    process.exit(1);
}

async function listModels() {
    try {
        console.log('📡 querying https://generativelanguage.googleapis.com/v1beta/models...');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

        if (!response.ok) {
            console.error(`❌ API Request Failed: ${response.status} ${response.statusText}`);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        if (data.models) {
            console.log('\n✅ Available Models:');
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                    console.log(`  Supported: ${m.supportedGenerationMethods.join(', ')}`);
                }
            });
        } else {
            console.log('❌ No models found in response.');
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (e) {
        console.error('Script error:', e);
    }
}

listModels();
