const { image_search } = require('duckduckgo-images-api');
const fs = require('fs');
const https = require('https');
const http = require('http');

const parks = [
  {"id": "botanika", "q": "Botanika bog'i Toshkent darvoza"},
  {"id": "islamic-center", "q": "Islom Sivilizatsiyasi Markazi Toshkent loyiha"},
  {"id": "ecopark", "q": "Ecopark Toshkent darvoza"},
  {"id": "central-park", "q": "Central Park Telman Tashkent"},
  {"id": "milliy-bog", "q": "Alisher Navoi National Park Tashkent"},
  {"id": "magic-city", "q": "Magic City Tashkent qal'a"},
  {"id": "tashkent-city-park", "q": "Tashkent City Park"},
  {"id": "anhor-lokomotiv", "q": "Anhor Lokomotiv park Tashkent"},
  {"id": "yapon-bogi", "q": "Yapon Bog'i Tashkent Japanese Garden"},
  {"id": "ashxobod", "q": "Ashxobod sayilgohi Tashkent"},
  {"id": "gafur-gulom", "q": "Gafur Gulom park Tashkent"},
  {"id": "navroz", "q": "Navroz Etnografik Bog'i Tashkent tegirmon"},
  {"id": "lokomotiv-mirzo", "q": "Lokomotiv park Mirzo Ulugbek Tashkent"},
  {"id": "dostlik", "q": "Dostlik bogi Bobur Tashkent"},
  {"id": "abdulla-qodiriy", "q": "Abdulla Qodiriy bogi Tashkent"},
  {"id": "galaba-bogi", "q": "Galaba bogi Victory park Tashkent"},
  {"id": "yangi-ozbekiston", "q": "Yangi O'zbekiston bog'i Tashkent stela"},
  {"id": "seoul-park", "q": "Seoul park Tashkent"},
  {"id": "furqat-bogi", "q": "Furqat bogi Tashkent"},
  {"id": "bogishamol", "q": "Bogishamol park Tashkent"}
];

if (!fs.existsSync('./public/parks')) {
    fs.mkdirSync('./public/parks', { recursive: true });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, { timeout: 8000, headers: {'User-Agent': 'Mozilla/5.0'} }, (res) => {
            if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
                if (res.statusCode !== 200) {
                    return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                }
                res.pipe(fs.createWriteStream(filepath))
                   .on('error', reject)
                   .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Status: ${res.statusCode}`));
            }
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

async function run() {
    for (let p of parks) {
        console.log(`Searching for ${p.id}...`);
        try {
            const results = await image_search({ query: p.q, moderate: true });
            if (results && results.length > 0) {
                let success = false;
                for (let i=0; i<Math.min(5, results.length); i++) {
                    try {
                        console.log(` Downloading ${results[i].image}`);
                        await downloadImage(results[i].image, `./public/parks/${p.id}.jpg`);
                        console.log(` Success: ${p.id}`);
                        success = true;
                        break;
                    } catch(e) {
                        console.log(` Failed: ${e.message}`);
                    }
                }
                if (!success) console.log(` Could not download any image for ${p.id}`);
            } else {
                console.log(`No results for ${p.id}`);
            }
        } catch (err) {
            console.error(`Error searching ${p.id}:`, err.message);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}
run();
