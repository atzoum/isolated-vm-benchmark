import { createHash } from 'crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'path';
import ivm from 'isolated-vm';
const __dirname = import.meta.dirname;

const isolate = new ivm.Isolate({ memoryLimit: 512 }); // thread-local isolate
const script = await isolate.compileScript(await readFile(resolve(__dirname, 'worker-ivm-script.js'), 'utf8'));
const context = await isolate.createContext(); // thread-local context
await context.global.set("sha256", function (input) { return createHash('sha256').update(input).digest('base64') });
const transformScript = await script.run(context, { reference: true }); // thread-local script

// caching the isolate, the context and the script
export async function transformIvm({ body }) {
    return await transformScript.apply(undefined, [body], {
        result: {
            promise: true,
        }
    });
};

// caching the isolate but not the context
export async function transformIvmNoCtxCache({ body }) {
    const context = await isolate.createContext();
    await context.global.set("sha256", function (input) { return createHash('sha256').update(input).digest('base64') });
    const transformScript = await script.run(context, { reference: true });
    const res = await transformScript.apply(undefined, [body], {
        result: {
            promise: true,
        }
    });
    transformScript.release();
    context.release();
    return res
};

// not caching the isolate nor the context
export async function transformIvmNoCache({ body }) {
    const isolate = new ivm.Isolate({ memoryLimit: 512 });
    const script = await isolate.compileScript(await readFile(resolve(__dirname, 'worker-ivm-script.js'), 'utf8'));
    const context = await isolate.createContext();
    await context.global.set("sha256", function (input) { return createHash('sha256').update(input).digest('base64') });
    const transformScript = await script.run(context, { reference: true });
    const res = await transformScript.apply(undefined, [body], {
        result: {
            promise: true,
        }
    });
    transformScript.release();
    context.release();
    script.release();
    isolate.dispose();
    return res
};

// direct without isolates
export async function transformDirect({ body }) {
    body = JSON.parse(body);
    let out = [];
    await Promise.all(
        body.map(async (event) => {
            try {
                let transformed = await fn(event);
                if (transformed === null || transformed === undefined)
                    return;
                out.push(transformed);
                return;
            } catch (error) {
                return out.push({
                    error: error.message || error.toString(),
                    event: event,
                });
            }
        })
    );
    return JSON.stringify(out);
};

function fn(event) {
    const email = event.email;
    if (email) event.email = createHash('sha256').update(email).digest('base64');
    return event;
}

export default transformDirect;
