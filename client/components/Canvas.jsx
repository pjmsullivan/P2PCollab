import React, { Component } from 'react';
import Peer from 'peerjs';
// import { object } from 'prop-types';

// Connects peer to peer broker server and obtains peer id
const peer = new Peer({
  host: 'localhost',
  port: 9000,
  path: '/connect/peer',
  debug: 3,
});
console.log('Peer: ', peer);

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      peerId: 'Not Connected',
      remoteId: 'Not Connected',
      connectionStatus: 'Not Connected',
      sharedText: '',
      localCaret: null,
      remoteCaret: null,
    };
    this.connection = {};
    this.handleConnectedToServer = this.handleConnectedToServer.bind(this);
    this.handleConnectToPeer = this.handleConnectToPeer.bind(this);
    // this.handleServerConnectionError = this.handleServerConnectionError.bind(this);
    this.handleSharedTextChange = this.handleSharedTextChange.bind(this);
    this.handleLocalCaretChange = this.handleLocalCaretChange.bind(this);
  }

  // When this component mounts, adds event listeners for peer events,
  // importantly, a connection from a remote peer
  componentDidMount() {
    peer.on('open', this.handleConnectedToServer);
    // peer.on('error', this.handleServerConnectionError);
    peer.on('connection', (conn) => {
      this.connection = conn;
      console.log('Incoming connection attempt initiating.');
      this.connection.on('open', () => {
        console.log('Successful incoming connection!', this.connection);
        console.log('You are now connected with peer: ', this.connection.peer);
        this.setState({ remoteId: this.connection.peer, connectionStatus: 'Connected' });

        this.connection.on('data', (data) => {
          console.log('Received: ', data);
          if (Object.prototype.hasOwnProperty.call(data, 'sharedText')) {
            this.setState({ sharedText: this.insertCaretIntoString(data.sharedText) });
          }

          // if data contains caret location, add indicator at caret location to shared text and update state
          if (Object.prototype.hasOwnProperty.call(data, 'remoteCaret')) {
            this.setState({
              remoteCaret: data.remoteCaret,
              sharedText: this.updateCaretPosition(data.remoteCaret),
            });
          }
        });

        this.connection.send({ sharedText: 'Test message from receiving peer. ✔️' });
      });
      this.connection.on('close', () => {
        this.setState({ remoteId: 'Not Connected', connectionStatus: 'Not Connected' });
      });
    });

    // Event listeners for events that change the caret position in the text box
    const textbox = document.getElementById('sharedTextArea');
    textbox.addEventListener('keyup', (event) => this.handleLocalCaretChange(event)); // Every character written
    textbox.addEventListener('mouseup', (event) => this.handleLocalCaretChange(event)); // Click down
    textbox.addEventListener('paste', (event) => this.handleLocalCaretChange(event)); // Clipboard actions
    textbox.addEventListener('cut', (event) => this.handleLocalCaretChange(event));
  }

  // Destroys the connection and the peer on unmount
  componentWillUnmount() {
    this.connection.close();
    peer.destroy();
  }

  // handleServerConnectionError(error) {
  //   console.log('Error when this peer attempted to connect to peer server: ', error);
  // }

  // When text is entered in the shared textbox, sets the component's state, triggering render
  // Also sends the new text to the remote peer, where the components state changes, also triggering render
  handleSharedTextChange(event) {
    const newText = event.target.value;
    this.connection.send({ sharedText: newText });
    this.setState({ sharedText: newText });
  }

  handleLocalCaretChange(event) {
    let caret = null;
    if (event.target.selectionDirection === 'forward') caret = event.target.selectionEnd;
    else if (event.target.selectionDirection === 'backward') caret = event.target.selectionStart;
    console.log('local caret location: ', caret);
    this.connection.send({ remoteCaret: caret });
    this.setState({ localCaret: caret });
  }

  // Handles connection to peer when peer ID is entered into the text box
  handleConnectToPeer(event) {
    console.log('Connecting to peer: ', event);

    this.connection = peer.connect(event.target.value);
    this.connection.on('open', () => {
      console.log('Connection with peer successful!', this.connection);
      console.log('You are now connected with peer: ', this.connection.peer);
      this.setState({ remoteId: this.connection.peer, connectionStatus: 'Connected' });

      // listener - emits event when incoming data is received
      // Parses incoming data and updates state appropriately
      this.connection.on('data', (data) => {
        console.log('Received: ', data);
        if (Object.prototype.hasOwnProperty.call(data, 'sharedText')) {
          this.setState({ sharedText: this.insertCaretIntoString(data.sharedText) });
        }

        if (Object.prototype.hasOwnProperty.call(data, 'remoteCaret')) {
          this.setState({
            remoteCaret: data.remoteCaret,
            sharedText: this.updateCaretPosition(data.remoteCaret),
          });
        }
      });
      this.connection.send({ sharedText: 'Test message from initilizing peer. ✔️' });
    });

    this.connection.on('close', () => {
      this.setState({ remoteId: 'Not Connected', connectionStatus: 'Not Connected' });
    });
  }

  // Stores peerId in state once peer obtains id from connection broker server
  handleConnectedToServer(id) {
    console.log('Peer connected to peer server and obtained id: ', id);
    console.log('old state: ', this.state);
    this.setState({ peerId: id });
    console.log('new state: ', this.state);
  }

  // Must return string removing old caret and inserting new one
  updateCaretPosition(newCaretLocation) {
    const { remoteCaret, sharedText } = this.state;
    console.log('Old caret location: ', remoteCaret, 'New caret location: ', newCaretLocation);
    const strippedCaret = sharedText.replaceAll('🙃', '');
    return `${strippedCaret.slice(0, newCaretLocation)}🙃${strippedCaret.slice(newCaretLocation)}`;
  }

  // Takes a string and returns a new string with the caret inserted
  insertCaretIntoString(oldString) {
    const { remoteCaret } = this.state;
    if (remoteCaret === null) return oldString;
    const strippedCaret = oldString.replaceAll('🙃', '');
    return `${strippedCaret.slice(0, remoteCaret)}🙃${strippedCaret.slice(remoteCaret)}`;
  }

  render() {
    const { peerId } = this.state;
    const { remoteId } = this.state;
    const { connectionStatus } = this.state;
    const { sharedText } = this.state;

    return (
      <div>
        <p>My Peer ID: {peerId}</p>
        <p>Connected to: {remoteId}</p>
        <p>Connection status: {connectionStatus}</p>
        <fieldset>
          <legend>To connect with peer, enter their Peer ID</legend>
          <input size="40" placeholder={remoteId} onChange={this.handleConnectToPeer} />
        </fieldset>
        <fieldset>
          <legend>Shared Text Area</legend>
          <textarea
            id="sharedTextArea"
            name="sharedTextArea"
            rows="30"
            cols="83"
            value={sharedText}
            onChange={this.handleSharedTextChange}
          />
        </fieldset>
      </div>
    );
  }
}
export default Canvas;
