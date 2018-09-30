import React, { PureComponent } from 'react';

import connectToRedux from '../ReduxConnector';

import TeamCard from './common/TeamCard';
import PlayerIcon from './common/PlayerIcon';

import '../../styles/lobby.scss';


/**
 * @class LobbyPage
 */
class LobbyPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  /**
   * Create Team cards per max team
   * @private
   */
  _renderTeam(maxTeams) {
    const TeamCardArray = [];
    for(let i = 0; i< maxTeams; i++) {
      TeamCardArray.push(<TeamCard />)
    }
  }

  render() {
    const roomCode = this.props.room.code || 'UH OH';
    const settings = {...this.props.room.settings}
    const benchPlayers = [...settings.benchPlayers].map((player) => <PlayerIcon key={player.id} name={player.name}/>);
    return (
      <div className="page home">
        <div className='navbar'>
          <h2>Lobby Room</h2>
        </div>
        <div className="page-container">
          <p>Code is</p>
          <h1>{roomCode}</h1>

        </div>
        <div className="page-footer">
          <div className="foot-header">
            <h3>Players waiting: </h3>
          </div>
          {benchPlayers}
        </div>
      </div>
    );
  }
}

const connectObject = {
  states: ['room'],
  actions: [],
}

export default connectToRedux(LobbyPage, connectObject);