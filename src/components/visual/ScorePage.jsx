import React, { PureComponent } from 'react';
import Swal from 'sweetalert2';
import * as Sentry from '@sentry/browser';

import connectToRedux from '../ReduxConnector';

import '../../styles/score.scss';

/**
 * @class GamePage
 */
class ScorePage extends PureComponent {
  constructor(props) {
    super(props);
    window.onbeforeunload = () => this.manuallyLeave();
  }

  componentWillUnmount() {
    window.onbeforeunload = () => {};
  }

  manuallyLeave = () => {
    try {
      // remove user from room.
      this.props.leaveRoom();
      this.props.updatePage('HOME');

      // remove localstoarage
      localStorage.removeItem('labowless_token');
    } catch (err) {
      Sentry.captureException(err);
      Swal.fire({
        type: 'error',
        title: 'woops',
        text: err.message,
      });
    }
  }

  formatData({ team, totalScore}) {
    return (
      <div className="team-row">
        <p>{team.teamName}</p>
        <p>{totalScore}</p>
      </div>
    )
  }
  
  render() {
    const { content } = this.props.game;
    let { host = { id: null } } = this.props.room.settings;
    const result = content.sort((a, b) => b.totalScore - a.totalScore).map(this.formatData);
    const isAdmin = this.props.user.id === host.id;

    return (
      
        <div className="page-container">
          <div className="title">
            Game Over
          </div>
          <div>
            <div className="score-page__content">
              <div className="score-page__results">
                {result}
              </div>
            </div>
            <div className="score-page__actionable">
              <button onClick={() => this.manuallyLeave()}>Leave Session</button>
              {isAdmin && <button onClick={() => this.props.resetGame()}>Play again</button>}
            </div>
          </div>
        </div>
    
    );
  }
}

const connectObject = {
  states: ['user','game', 'room'],
  actions: ['resetGame','leaveRoom'],
}

export default connectToRedux(ScorePage, connectObject);
