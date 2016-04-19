rauricoste-websocket-room-server
===============
A messaging serve. See https://github.com/remy-auricoste/websocket-room-client for the client
features :
* create a one-way socket between 2 peers using either websocket or http.

Installation
===============
```npm install --save-dev rauricoste-websocket-room-server```

Usage
===============
```
var server = require("rauricoste-websocket-room-server");
var port = 8001;
new server.SocketServer(port); // for a websocket server
new server.XhrServer(port); // for a http server
```
