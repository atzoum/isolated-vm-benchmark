# Run http server

```bash
# run http server on port 3333 with 10 processes
node http.js -p 3333 -procs 10

# run http server on port 3333 using a single process with 10 threads and 10 concurrent tasks per thread
node http.js -p 3333 -procs 1 -t 10 -c 10
```

# Run benchmark

```bash
# benchmark ivm without caching 
./wrk.sh http://localhost:3333/transformIvmNoCache

# benchmark ivm without script caching (only isolate caching)
./wrk.sh http://localhost:3333/transformIvmNoScriptCache

# benchmark ivm without context caching (only isolate and script caching) 
./wrk.sh http://localhost:3333/transformIvmNoCtxCache

# benchmark ivm with caching (isolate, script, caching & function caching)
./wrk.sh http://localhost:3333/transformIvm

# benchmark direct without ivm
./wrk.sh http://localhost:3333/transformDirect


# skip pooling
./wrk.sh http://localhost:3333/no-pool/transformIvmNoCache
./wrk.sh http://localhost:3333/no-pool/transformIvmNoScriptCache
./wrk.sh http://localhost:3333/no-pool/transformIvmNoCtxCache
./wrk.sh http://localhost:3333/no-pool/transformIvm
./wrk.sh http://localhost:3333/no-pool/transformDirect

```

# Benchmark results on my machine

```bash
# ivm without caching
# Requests/sec:   1858.34
# CPU: 100%

# ivm without caching no pool with 4 processes
# Requests/sec:   2426.94
# CPU: 100%

# ivm without script caching (only isolate caching)
# Requests/sec:   6673.61
# CPU: 100%

# ivm without context caching (only isolate and script caching)
# Requests/sec:   7251.43
# CPU: 100%

# ivm with caching (isolate, script, caching & function caching)
# Requests/sec:   9743.46
# CPU: 100%

# direct without ivm
# Requests/sec:  29356.93
# CPU: 70%

# direct without ivm without pooling and with 10 processes
# Requests/sec:  76986.05
# CPU: 100%
```
