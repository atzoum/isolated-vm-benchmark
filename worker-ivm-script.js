
function fn(event) {
    const email = event.email;
    for (let i of Array(1)) { // simulate a heavy operation
        if (email) event.email = sha256(email);
    }
    return event;
}

transform = async (body) => {
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