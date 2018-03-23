import React, { Component } from 'react'
import { dogGifsFactory } from './gifs'
import './App.css'

const Detail = ({value}) => <span className='detail_item'>{value}</span>
const Details = ({children}) => <div className='details'>{children}</div>

const Title = ({timeStamp, weekDay, address}) => {
  const date = new Date(timeStamp)
  const time  = date.getHours() > 12 ? 'afternoon': 'morning'
  return (
    <div className='card__title'>
      <header className='card__header'>
        <img className='card__header__image' src={dogGifsFactory()} alt='Dog Gif'/>
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
    )
  }
}

export default App
