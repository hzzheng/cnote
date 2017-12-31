import React, { Component } from 'react'

class Home extends Component {
  state = {
    test: 'home'
  }

  render() {
    return (
      <div>hello, {this.state.test}</div>
    )
  }
}

export default Home

