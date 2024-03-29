import * as action from './actions';
import * as Sentry from '@sentry/browser';

import { updatePage } from '../application/actions'; 
import { clearUser } from '../user/actions';
import { clearRoom } from '../room/actions';

const updatePoints = (points) => {
  return (dispatch) => dispatch(action.updatePoints(points));
}

const updateStatus = (status) => {
  return (dispatch) => dispatch(action.updateStatus(status));
}

const updateContent = (content) => {
  return (dispatch) => dispatch(action.updateContent(content));
}

const sendWord = (word = null) => {
  return async (dispatch, getState) => {
    try {
      if(word != null) {
        return await getState().user.socket.send(`/server/room/${getState().room.code}/game/newWord`, {}, word);
      }
      return await getState().user.socket.send(`/server/room/${getState().room.code}/game/skipWord`, {});
    } catch (err) {
      console.error(`Error while guessing word: ${err.message}`);
      return Promise.reject(err);
    }
    
  }
}

/**
 * @description used to start next turn or next round. This will ultimately start the timer.
 */
const startStep = () => {
  return async (dispatch, getState) => {
    try {
      await getState().user.socket.send(`/server/room/${getState().room.code}/game/startStep`, {});
    } catch (err) {
      Sentry.captureException(err);
      console.error(`Error while starting new turn/round: ${err.message}`);
      return Promise.reject(err);
    }
  }
}

/**
 * a socket call to reset the game. It will return
  NULL game to the socket endpoint
  NULL wordState to the socket endpoint
  and the currentRoom to the room endpoint
 */
const resetGame = () => {
  return async (dispatch, getState) => {
    try {
      await getState().user.socket.send(`/server/room/${getState().room.code}/game/resetGame`, {});
    } catch (err) {
      Sentry.captureException(err);
      console.error(`Error while starting new turn/round: ${err.message}`);
      return Promise.reject(err);
    }
  }
}

/**
 * sock call to disconnect user from room session.
 */
const leaveRoom = () => {
  return async (dispatch, getState) => {
    try {
      dispatch(updatePage('HOME'));

      if (getState().user.socket) {
        getState().user.socket.send(`/server/room/${getState().room.code}/leaveRoom`, {});
        getState().user.socket.disconnect(() => {
          dispatch(clearUser());
          dispatch(clearRoom({}));
        });
      }
    } catch (err) {
      Sentry.captureException(err);
      console.error(`Error: leaving room error: ${err.message}`);
      return Promise.reject(err);
    }
  }
}

const giveUpRound = () => {
  return async (dispatch, getState) => {
    try {
      return await getState().user.socket.send(`/server/room/${getState().room.code}/game/endTurn`, {});
    } catch (err) {
      Sentry.captureException(err);
      console.error(`Error while starting giving up: ${err.message}`);
      return Promise.reject(err);
    }
  }
}

/**
 * to be used by host when users are on `SUMMARY` page. This will trigger the `/game/` call with currentPoints: null 
 * which will ultimately redirect user to `GAME`
 */
const nextRound = () => {
  return async (dispatch, getState) => {
    try {
      await getState().user.socket.send(`/server/room/${getState().room.code}/game/nextRound`, {});
    } catch (err) {
      Sentry.captureException(err);
      console.error(`Error while going to next round: ${err.message}`);
      return Promise.reject(err);
    }
  }
}

export default { 
  updatePoints,
  updateStatus,
  updateContent,

  // game socket calls
  sendWord,
  startStep,
  resetGame,
  leaveRoom,
  giveUpRound,
  nextRound
};