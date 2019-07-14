import React, { PureComponent } from 'react';

import connectToRedux from '../ReduxConnector';

import '../../styles/game.scss';

const Actor = (props) => {

  return (
    <div className="game-container__content">
      <div className="game-word">
        <h3>
          {props.word}
        </h3>
      </div>
      <div className="game-selection">
        <button></button>
        {/* {this._renderButton(status)} */}
      </div>
    </div>
  )
}

/**
 * @class GamePage
 */
class GamePage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      canSkip: true,
      word: 'YOYO',
      animation: 'entry',
    }
    this.gotIt = this.gotIt.bind(this);
    this.skipWord = this.skipWord.bind(this);
  }
  
  /**
   * Successfully guessed word
   */
  gotIt() {
    // Add points
  }

  skipWord() {
    // Skip word
    this.setState({
      animation: 'entry',
      word: 'WTF',
    })
  }

  /**
   * @function _renderButton
   * @description Depending on user's status player/guesser they will either see a skip button or pass
   * @param {boolean} playerStatus 
   */
  _renderButton(playerStatus){
    switch(playerStatus) {
      case 'ACTOR':
        return (<button disable={this.state.canSkip} className="player-btn" onClick={this.skipWord}>Skip</button>);
      case 'GUESSER':
        return (<button className="player-btn" onClick={this.gotIt}>Correct</button>);
      case 'SPECTATOR':
        return "Sit back and relax :) But pay attention!";
      default:
        return '';
    }
  }

  render() {
    const s = {
      status: 'ACTOR',
      gameType: 'Describe!'
    }
    const { status, gameType } = s;//this.props.game;
    const classWord = this.state.animation;//"enter";

    return (
      <div className="game">
        <div className="page-container">
          <div className="game-type">
            {gameType}
          </div>
          <div className="game-timer">
            <h2>
              <span className="game-time-seconds">{50}</span>
              s
            </h2>
          </div>
          <div>
            You are {status}
          </div>
        </div>
      </div>
    );
  }
}

const connectObject = {
  states: ['game'],
  actions: [''],
}

export default connectToRedux(GamePage, connectObject);