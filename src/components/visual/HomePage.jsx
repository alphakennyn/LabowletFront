import React, { PureComponent } from 'react';

import connectToRedux from '../ReduxConnector';
import '../../styles/home.scss';

class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
    }
  }

  /**
   * Handles name change
   * @private
   * @param {Event} e 
   */
  _handleNameChange(e) {
    this.setState({ name: e.target.value });
  }

  /**
   * Function is called when user enter's name and navigates to either Create or Join page.
   * This will trigger redux function updateUserName and UpdatePage.
   * @param {String} page 
   */
  navigatePage(page) {
    this.props.updateUserName(this.state.name);
    this.props.updatePage(page);
  }

  render() {
    const buttonClass = this.state.name !== '' ? 'visible' : 'invisible';
    return (
      <div className="page home">
        <div className='navbar'>
          <h2>Labowlet</h2>
        </div>
        <div className="page-container">
          <input className="name-input" onChange={(e) => this._handleNameChange(e)} placeholder="Enter your name" />
          <div className='button-group'>
            <button
              className={`generic-button create-btn ${buttonClass}`}
              onClick={() => this.navigatePage('CREATE')}
            >
              <p>Create</p>
            </button>
            <button
              className={`generic-button join-btn ${buttonClass}`}
              onClick={() => this.navigatePage('JOIN')}
            >
              <p>Join</p>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const connectObject = {
  states: [],
  actions: ['updateUserName'],
}

export default connectToRedux(Home, connectObject);