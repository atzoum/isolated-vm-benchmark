# Run http server

```bash
# run http server on port 3333
node http.js --port 3333
```

# Run benchmark

```bash
# benchmark ivm without caching 
./wrk.sh http://localhost:3333/ivm-no-cache

# benchmark ivm without script caching (only isolate caching)
./wrk.sh http://localhost:3333/ivm-no-script-cache

# benchmark ivm without context caching (only isolate and script caching) 
./wrk.sh http://localhost:3333/ivm-no-ctx-cache

# benchmark ivm with caching (isolate, script, caching & function caching)
./wrk.sh http://localhost:3333/ivm

# benchmark direct without ivm
./wrk.sh http://localhost:3333/direct

```

# Benchmark results on my machine

```bash
# ivm without caching
# Requests/sec:   1858.34
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
```
