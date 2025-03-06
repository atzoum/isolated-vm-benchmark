
import Fastify from 'fastify'
import * as piscina from 'fastify-piscina'
import { resolve } from 'path';
import { cpus } from 'os';
import cluster from 'node:cluster';
import * as mainWorker from './worker.js';

// process.env.UV_THREADPOOL_SIZE = cpus().length

const processes = parseInt(process.argv.includes('-procs') ? process.argv[process.argv.indexOf('-procs') + 1] : "10")

const run = async () => {
    if (cluster.isPrimary && processes > 1) {
        for (let i = 0; i < processes; i++) {
            cluster.fork();
        }
        cluster.on("exit", (worker, code, signal) => console.log(`worker ${worker.process.pid} died`));
        return;
    }

    const fastify = Fastify({ logger: { level: 'warn' } });

    fastify.register(piscina, {
        maxThreads: parseInt(process.argv.includes('-t') ? process.argv[process.argv.indexOf('-t') + 1] : "10"),
        minThreads: parseInt(process.argv.includes('-t') ? process.argv[process.argv.indexOf('-t') + 1] : "10"),
        concurrentTasksPerWorker: parseInt(process.argv.includes('-c') ? process.argv[process.argv.indexOf('-c') + 1] : "1"),
        filename: resolve('worker.js'),
        argv: process.argv,
    });
    fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (request, body, done) {
        done(null, body); // no JSON.parse
    })
    // endpoints for skipping pooling
    fastify.register(function (fastify, opts, done) {
        fastify.post('/:name', async (request, reply) => { // caching both the isolate and the context
            const { name } = request.params;
            reply.send(await mainWorker[name]({ body: request.body }, { name: name }));
        });
        done()
    }, { prefix: '/no-pool' });
    fastify.post('/', async (request, reply) => {
        reply.send(await fastify.piscina.run({ body: request.body }, { name: 'default' }));
    });
    // endpoints with pooling
    fastify.post('/:name', async (request, reply) => { // caching both the isolate and the context
        const { name } = request.params;
        reply.send(await fastify.piscina.run({ body: request.body }, { name: name }));
    });
    const port = parseInt(process.argv.includes('-p') ? process.argv[process.argv.indexOf('-p') + 1] : "3333");
    fastify.listen({ port: port, }, (err, address) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        fastify.log.warn(`server listening on ${address}`);
    });
};
await run();