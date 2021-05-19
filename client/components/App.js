import React, { Component } from 'react';
import Canvas from './Canvas';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div id="textCanvas">
          <p>Test drop it like it's hot all the time text</p>
        </div>
        <div>
          <Canvas />
        </div>
      </div>
    );
  }
}
export default App;