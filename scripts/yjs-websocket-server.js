// Minimal Yjs WebSocket server for dev/testing
const http = require('http');
const WebSocket = require('ws');
const setupWSConnection = require('y-websocket/bin/utils.js').setupWSConnection;

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
  setupWSConnection(conn, req, { gc: true });
});

const port = process.env.YJS_WS_PORT || 1234;
server.listen(port, () => {
  console.log(`Yjs WebSocket server running on ws://localhost:${port}`);
});
