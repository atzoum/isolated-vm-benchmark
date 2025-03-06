
import Fastify from 'fastify'
import * as piscina from 'fastify-piscina'
import { resolve } from 'path';
const __dirname = import.meta.dirname;
const fastify = Fastify({ logger: { level: 'warn' } });
fastify.register(piscina, {
    maxThreads: process.argv.includes('--threads') ? process.argv[process.argv.indexOf('--threads') + 1] : 10,
    minThreads: process.argv.includes('--threads') ? process.argv[process.argv.indexOf('--threads') + 1] : 10,
    concurrentTasksPerWorker: process.argv.includes('--concurrentTasksPerWorker') ? process.argv[process.argv.indexOf('--concurrentTasksPerWorker') + 1] : 10,
    filename: resolve('worker.js'),
    argv: process.argv,
});
fastify.addContentTypeParser('application/json', { parseAs: 'string' }, function (request, body, done) {
    done(null, body); // no JSON.parse
})
fastify.post('/', async (request, reply) => {
    reply.send(await fastify.piscina.run({ body: request.body}, {name: 'default' }));
});
fastify.post('/ivm', async (request, reply) => { // caching both the isolate and the context
    reply.send(await fastify.piscina.run({ body: request.body}, {name: 'transformIvm' }));
});
fastify.post('/ivm-no-ctx-cache', async (request, reply) => { // caching the isolate but not the context
    reply.send(await fastify.piscina.run({ body: request.body}, {name: 'transformIvmNoCtxCache' }));
});
fastify.post('/ivm-no-cache', async (request, reply) => { // not caching the isolate nor the context
    reply.send(await fastify.piscina.run({ body: request.body}, {name: 'transformIvmNoCache' }));
});
fastify.post('/direct', async (request, reply) => {
    reply.send(await fastify.piscina.run({ body: request.body}, {name: 'transformDirect' }));
});

const port = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 3333;
fastify.listen({ port: port, }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.warn(`server listening on ${address}`);
});