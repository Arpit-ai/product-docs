#!/usr/bin/env node

// Simple Yjs WebSocket server for development
// Minimal in-memory sync without persistence
const WebSocket = require('ws');
const http = require('http');

const port = process.env.YJS_WS_PORT || 1234;
const rooms = new Map(); // room name -> Set of connections

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const room = url.pathname.slice(1) || 'default'; // room is path after /

  console.log(`[${new Date().toISOString()}] Client connected to room: ${room}`);

  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  rooms.get(room).add(ws);

  // Broadcast to all clients in room
  const broadcast = (message, exclude) => {
    rooms.get(room).forEach(client => {
      if (client !== exclude && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  ws.on('message', (message) => {
    try {
      // Forward all messages to other clients in room
      broadcast(message, ws);
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected from room: ${room}`);
    rooms.get(room).delete(ws);
    if (rooms.get(room).size === 0) {
      rooms.delete(room);
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

server.listen(port, () => {
  console.log(`🚀 Yjs WebSocket server running on ws://localhost:${port}`);
  console.log(`   Rooms created on first connection, destroyed when empty`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  wss.close();
  server.close();
  process.exit(0);
});
