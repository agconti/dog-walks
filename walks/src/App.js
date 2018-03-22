import React, { Component } from 'react';
import './App.css';

const Detail = ({value}) => <span className='detail_item'>{value}</span>
const Details = ({children}) => <div className='details'>{children}</div>
const HeaderImage = () => {
  const gif_ids = ['xULW8LkCv9QJMhyT7O', '3og0INJHs40dal3F0A', '26hlRAfYGFhM88uDm', 'sMaW02wUllmFi', '3oFzm6qEyneSv768Ny', 'WaDRFTy80J8u4', 'tdWsWGFHlW6as'
  ]
  const random_gif = gif_ids[~~(gif_ids.length * Math.random())]

  return <img className='card__header__image'
       src={`https://media1.giphy.com/media/${random_gif}/giphy.webp`} />
}
const Title = ({timeStamp, weekDay, address}) => {
  const date = new Date(timeStamp)
  const time  = date.getHours() > 12 ? 'afternoon': 'morning'
  return (
    <div className='card__title'>
      <header className='card__header'>
          <HeaderImage />
          <h2 className='time'>{date.toLocaleTimeString()}</h2>
          <h3 className='address'>{address}</h3>
      </header>
      <h1 className='title'>Your {weekDay} {time} walk.</h1>
    </div>
  )
}

const WalkCard = ({timeStamp, distance, duration, week_day, address}) => (
  <div className={'card'}>
    <Title timeStamp={timeStamp} weekDay={week_day} address={address} />
    <Details>
      <Detail value={duration} />
      <Detail value={distance} />
    </Details>
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
      <div className='walks'>
          {this.state.walks.map(walk => <WalkCard {...walk} key={walk.id}/>)}
      </div>
    );
  }
}

export default App;
