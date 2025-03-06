local t = {}
for i = 1, 20 do
    table.insert(t, '{"email": "user1@example.com", "password": "password", "name": "User 1", "role": "user", "status": "active", "created_at": "2020-01-01T00:00:00Z", "updated_at": "2020-01-01T00:00:00Z"}')
end
local j = {'[', table.concat(t, ","), ']'}
wrk.method = "POST"
wrk.body   = table.concat(j, "")
wrk.headers["Content-Type"] = "application/json"