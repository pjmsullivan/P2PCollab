import React, { Component } from 'react';
import Peer from 'peerjs';

const peer = new Peer({
  host: 'localhost',
  port: 9000,
  path: '/connect/peer',
  debug: 3
});
console.log("peer: ", peer);
// let id = peer.id;
// let connection = {};


class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peerId: 'Not Connected',
      remoteId: 'Not Connected',
      connectionStatus: 'Not Connected',
      sharedText: ''
    };
    this.connection = {};
    this.handleConnectedToServer = this.handleConnectedToServer.bind(this);
    this.handleConnectToPeer = this.handleConnectToPeer.bind(this);
    this.handleServerConnectionError = this.handleServerConnectionError.bind(this);
    this.handleSharedTextChange = this.handleSharedTextChange.bind(this);
    // this.handleNewConnection = this.handleNewConnection.bind(this);
  };
  
  handleConnectedToServer(id) {
    console.log('Peer connected to peer server and obtained id: ', id);
    console.log("old state: ", this.state);
    this.setState({ peerId: id });
    console.log("new state: ", this.state);
  };

  handleServerConnectionError(error) {
    console.log("Error when this peer attempted to connect to peer server: ", error);
  };

  handleSharedTextChange(event) {
    const newText = event.target.value;
    this.connection.send(newText);
    this.setState({sharedText: newText});
  };

  handleConnectToPeer(event) {
    console.log('Connecting to peer: ', event);
    this.setState({ remoteId: event.target.value});
    
    this.connection = peer.connect(event.target.value);
    this.connection.on('open', () => {
      console.log("Connection with peer successful!", this.connection);
      console.log('You are now connected with peer: ', this.connection.peer);
      this.setState({remoteId: this.connection.peer, connectionStatus: 'Connected'});
      
      //listener - emits event when incoming data is received
      this.connection.on('data', (data) => {
        console.log('Received: ', data);
        this.setState({sharedText: data});
      })
      this.connection.send('Test message from initilizing peer.');
    })
    
    this.connection.on('close', () => {
      this.setState({remoteId: 'Not Connected', connectionStatus: 'Not Connected'})
    })

    // this.connection.on('open', () => {
    //   console.log("CONNECTION OPEN!!!");
    // })
    console.log('remoteId: ', this.state.remoteId);
    console.log('connection: ', this.connection);
  }

  // handleNewConnection() {
  //   console.log('NEW CONNECTION');
  // }

  componentDidMount() {
    peer.on('open', this.handleConnectedToServer);
    peer.on('error', this.handleServerConnectionError);
    peer.on('connection', (conn) => {
      this.connection = conn;
      console.log("Incoming connection attempt initiating.");
      this.connection.on('open', () => {
        console.log('Successful incoming connection!', this.connection);
        console.log('You are now connected with peer: ', this.connection.peer);
        this.setState({remoteId: this.connection.peer, connectionStatus: 'Connected'});
        
        this.connection.on('data', (data) => {
          console.log('Received: ', data);
          this.setState({sharedText: data});
        })

        this.connection.send('Test message from receiving peer.');
      })
      this.connection.on('close', () => {
        this.setState({remoteId: 'Not Connected', connectionStatus: 'Not Connected'})
      })
    })
    // peer.on('disconnected', () =>{
    //   this.setState({remoteId: 'Not Connected'})
    // })
    // console.log("Connection: ", this.state.connection);
    // this.state.connection.on('open', this.handleNewConnection);
    
  }

  componentWillUnmount() {
    this.connection.close();
    peer.destroy();
    // this.setState({connection: 'Not connected'})
  }
  
  render() {
    const peerId = this.state.peerId;
    const remoteId = this.state.remoteId;
    const connectionStatus = this.state.connectionStatus;
    const sharedText = this.state.sharedText;

    return (
      <div>
        <p>My Peer ID: {peerId}</p>
        <p>Connected to: {remoteId}</p>
        <p>Connection status: {connectionStatus}</p>
        <fieldset>
          <legend>To connect with peer, enter their Peer ID</legend>
          <input value={remoteId} onChange={this.handleConnectToPeer}/>
        </fieldset>
        <fieldset>
          <legend>Shared Text Area</legend>
          <textarea id='sharedTextArea' name='sharedTextArea' rows='30' cols='83' value={sharedText} onChange={this.handleSharedTextChange}></textarea>
        </fieldset>
      </div>
    );
  }
}
export default Canvas;