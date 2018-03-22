import React, { Component } from 'react';
import './App.css';

const WalkCard = ({timestamp, distance, duration, week_day}) => (
  <div>
    <header>
      <h1>{week_day} Walk {timestamp}</h1>
    </header>
    <p>{distance}</p>
    <p>{duration}</p>
  </div>
)

class App extends Component {
  state = {
    'walks': []
  }
  constructor(props) {
    super(props)
    this.setState = this.setState.bind(this)
  }

  componentDidMount() {
    fetch('/walks.json')
      .then(res => res.json())
      .then(walks => this.setState({walks}))
  }
  render() {
    return (
      <div className="App">
          {this.state.walks.map(walk => <WalkCard {...walk} key={walk.id}/>)}
      </div>
    );
  }
}

export default App;
