
import Fastify from 'fastify'
import * as piscina from 'fastify-piscina'
import { resolve } from 'path';
const __dirname = import.meta.dirname;
const fastify = Fastify({ logger: { level: 'warn' } });
import * as mainWorker from './worker.js';
fastify.register(piscina, {
    maxThreads: parseInt(process.argv.includes('--threads') ? process.argv[process.argv.indexOf('--threads') + 1] : "10"),
    minThreads: parseInt(process.argv.includes('--threads') ? process.argv[process.argv.indexOf('--threads') + 1] : "10"),
    concurrentTasksPerWorker: parseInt(process.argv.includes('--concurrentTasksPerWorker') ? process.argv[process.argv.indexOf('--concurrentTasksPerWorker') + 1] : "10"),
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
const port = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : 3333;
fastify.listen({ port: port, }, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.warn(`server listening on ${address}`);
});