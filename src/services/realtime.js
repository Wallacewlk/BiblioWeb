
const { WebSocketServer, WebSocket } = require('ws');
const http = require('http');

const wss = new WebSocketServer({
  noServer: true,
  maxPayload: 1024
});

wss.on('connection', (socket) => {
  socket.on('error', () => {});
});

exports.attach = (server, sessionMiddleware, allowedOrigins) => {
  server.on('upgrade', (req, socket, head) => {
    socket.on('error', () => {});

    if (req.url !== '/ws') {
      socket.destroy();
      return;
    }

    const origin = req.headers.origin;
    const sameOrigin =
      origin === `http://${req.headers.host}` ||
      origin === `https://${req.headers.host}`;

    if (!origin || (!sameOrigin && !allowedOrigins.includes(origin))) {
      socket.destroy();
      return;
    }

    sessionMiddleware(req, new http.ServerResponse(req), (err) => {
      if (err || !req.session?.userId || socket.destroyed) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(req, socket, head, (client) => {
        wss.emit('connection', client, req);
      });
    });
  });
};

exports.broadcast = () => {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'catalog-changed'
      }), () => {});
    }
  }
};
