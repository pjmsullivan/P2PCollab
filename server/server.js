const express = require('express');
const { ExpressPeerServer } = require('peer');
const app = express();
const path = require('path');
const PORT = 3000;
const PEER_SERVER_PORT = 9000;

//peer server
const server = app.listen(PEER_SERVER_PORT, () => {
  console.log(`Peer server listening on port: ${PEER_SERVER_PORT}`);
});
const peerServer = ExpressPeerServer(server, {path: '/peer'});
app.use('/connect', peerServer)

// peerServer.on('connection', (client) => { ... });

//http server and routing
if (process.env.NODE_ENV === 'production') {
  //when webpack builds bundle.js, statically serve it on the ./build route
  app.use('/build', express.static(path.join(__dirname, '../build')));
  // serve index.html on root route
  app.get('/', (req, res) => {
    return res.status(200).sendFile(path.join(__dirname, '../index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`HTTP server listening on port: ${PORT}`);
}); //localhost:3000

