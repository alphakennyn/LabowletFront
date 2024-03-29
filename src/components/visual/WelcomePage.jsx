import React, { useState } from 'react';
import Swal from 'sweetalert2'

import '../../styles/splash.scss';
import Logo from '../../assets/images/labowless_logo.png';
import connectToRedux from '../ReduxConnector';

const WELCOME_TEXTS = {
  logged: [
    '⭐ You have an active session ⭐',
    'click `Reconnect` to re-join',
    'click `Cancel` to start new game'
  ],
  new: [
    'Welcome to Labowless! Click `Play` to start!'
  ],
  error: [
    '💀 Uh oh 💀',
    'something went wrong on our end 😢',
    'You can try again in a sec!'
  ]
}

const WelcomePage = (props) => {
  const [isLogged] = useState(!!props.id)
  const [canNavigate, setNavigate] = useState(true)
  const [hasError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleClick = async () => {
    if (isLogged) {
      try {
        await props.reconnect(props.id);
      } catch (err) {
        setNavigate(false);
        setError(true);
        setErrorMessage(err.message);

        // display error for 1.5s
        setTimeout(() => {
          setError(false);
          // This is used for known errors i.e. token expired.
          if (errorMessage !== '') {
            props.leave();
          }
          setErrorMessage('');
          setNavigate(true);
        }, 1500 );
        console.error('Welcome page error. If you\'re this, that means an error occured -> ', err.message);
      }
    }
  }

  const determineStatus = () => {
    let texts = [];

    if(hasError) {
      // This is used for known errors i.e. token expired.
      if (errorMessage !== '') {
        texts = [errorMessage];
      } else {
        texts = WELCOME_TEXTS.error;
      }
    } else {
      texts = isLogged ? WELCOME_TEXTS.logged : WELCOME_TEXTS.new;
    }

    return texts.map((text) => <p>{text}</p>)
  }

  const showCredit = () => {
    Swal.fire({
      title: 'credits',
      animation: false,
      customClass: {
        popup: 'animated lightSpeedIn'
      },
      background: '#EEEEEE',
      html:'<b>Developer</b></br>' 
        + '<p>Kenny Nguyen</p>'
        + '<p>Danny Le Kim</p>'
        + '<b>Graphic Designer</b>'
        + '<p>Melisa Tran</p>',
    });
  }
  return (
    <div className="splash__page">
      <div>
        <img className="splash__img" src={Logo} alt="logo" />
        <div className={`splash__inputs ${!canNavigate ? 'splash__disabled' : ''}`}>
          {isLogged ?
            <React.Fragment>
              <button disabled={ !canNavigate } onClick={props.leave}>Cancel</button>
              <button disabled={ !canNavigate } onClick={handleClick}>Reconnect</button>
            </React.Fragment>
            :
            <button
              onClick={() => props.updatePage('HOME')}
              disabled={!canNavigate}
            >
              Play
            </button>
          }
        </div>
        { determineStatus() }
        <div className="splash__footer">
          <p style={{ alignSelf: 'end' }}>{process.env.REACT_APP_VERSION}</p>
          <button onClick={showCredit}><p>credits</p></button>
        </div>
      </div>
    </div>
  )
}

const connectObject = {
  actions: ['reconnect'],
}

export default connectToRedux(WelcomePage, connectObject);