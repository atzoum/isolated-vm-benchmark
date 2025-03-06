#!/bin/bash
ulimit -n 10240
wrk -t20 -c400 -d10s -s post.lua ${1:-http://127.0.0.1:3333/ivm}