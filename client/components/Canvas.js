import React, { Component } from 'react';
import Peer from 'peerjs';

const peer = new Peer({
  host: 'localhost',
  port: 9000,
  path: '/connect/peer',
  debug: 3
});
console.log("peer: ", peer);
let id = peer.id;

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peerId: 'Uninitialized',
    };
    // this.handleConnectedToServer = this.handleConnectedToServer.bind(this);
  }
  
  handleConnectedToServer(id) {
    console.log('Peer connected to peer server and obtained id', id);
    console.log("old state: ", this.state);
    this.setState({ peerId: id });
    console.log("new state: ", this.state);
  };
  
  render() {
    peer.on('open', (id) => {
      // this.setState({ peerId: id });
      this.handleConnectedToServer(id);
    });
    return (
      <div>
        <p>Peer ID: {this.state.peerId}</p>
      </div>
    );
  }
}
export default Canvas;