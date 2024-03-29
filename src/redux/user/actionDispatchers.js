import * as actions from './actions';
import configs from '../../config/RESTurl.json';
import SockJS from 'sockjs-client';
import STOMP from 'stompjs';
import * as Sentry from '@sentry/browser';

import {updatePage} from '../application/actions';
import {updateSetting} from '../room/actions';
import {
  resetGame,
  updateContent,
  updateCurrentTeam,
  updateGameTime,
  updateGameType,
  updateGameWord,
  updatePoints,
  updateRemainingWordCount,
  updateStatus,
  updateWordReady,
  setMaxTime,
  setScoreSummary,
} from '../game/actions'

const updateUserName = (user) => {
  return (dispatch) => dispatch(actions.updateUserName(user));
}

const updateUserId = (id, uniqueIconReference) => {
  return (dispatch) => dispatch(actions.updateUserId(id, uniqueIconReference));
}

const updateUserTeam = (user) => {
  return (dispatch) => dispatch(actions.updateUserTeam(user));
}

const updateUserWords = (user) => {
  return (dispatch) => dispatch(actions.updateUserWords(user));
}

/**
 * @description connect user to room and return the socket object. This can be called from other dispatchers
 * to add additional subscribtion
 */
const connectUser = (code) => {
  return (dispatch, getState) => {
    //const { code } = getState().room.code;
    const LABOWLET_PATH = '/socket'

    const socket = new SockJS(`${getState().application.server.url || configs.prod}${LABOWLET_PATH}`);
    const socketClient = STOMP.over(socket);

    if (!getState().application.debugMode) {
      socketClient.debug = null;
    }

    socketClient.connect({
      'x-auth-token': getState().user.token,
    }, async (frame) => {
      
      /**
       * Connect player to room page and access the payload obj.
       */
      socketClient.subscribe(`/client/room/${code}`, function (payload) {
        const { body } = payload;
        const parsedBody = JSON.parse(body);
        dispatch(updateSetting(parsedBody));
      });

      /**
       * Called when user start a game, round ends or turn ends. Return a Game object
       * which contains 
       * @param {Object} round
       * @param {Object} currentPlayer
       * @param {Object} currountActor
       */
      socketClient.subscribe(`/client/room/${code}/game`, function (payload) {
        const { body } = payload;
        const parsedBody = JSON.parse(body);
        const {
          // round
          currentActor,
          currentGuesser,
          currentRound,
          currentTeam,
          currentScores,
          teams,
        } = parsedBody;
        const { roundName } = currentRound;
        // First thing: reset time/word
        if ((getState().game.currentTime <= 0 )||(currentTeam.teamId !== getState().game.currentTeam.teamId && getState().game.currentTime < getState().game.maxTime)) {
          if(getState().game.maxTime === 0) {
            dispatch(updateGameTime(getState().room.settings.roomSettings.roundTimeInSeconds) || 0);
          } else {
            dispatch(updateGameTime(getState().game.maxTime) || 0);
          }
        } 
        dispatch(updateGameWord(''));
        dispatch(setScoreSummary([]));
        /**
         * currentActor: {name: "host", id: "8210aebc-9bef-4299-a717-a81e808e239f"}
         * currentGuesser: {name: "fast guy", id: "ee847daa-9c35-4bcc-91ff-f70690353147"}
         * currentRound: {roundName: "DESCRIBE_IT", turns: 0, randomWord: "aa"}
         */
        
        let userStatus = 'SPECTATOR';
        if(currentActor.id === getState().user.id) {
          userStatus = 'ACTOR';
        } else if (currentGuesser.id === getState().user.id) {
          userStatus = 'GUESSER';
        }
        
        // update user's status
        dispatch(updateStatus(userStatus));

        dispatch(updateCurrentTeam(currentTeam))
        
        // update game type
        dispatch(updateGameType(roundName))

        if(currentScores) {
          const { scores } = currentScores;
          dispatch(setScoreSummary(scores));
          dispatch(updatePage('SUMMARY'));
          
          // TODO update the team's score
          const { teamScore } = teams.find((element) => element.teamId === getState().user.team);
          
          dispatch(updatePoints(teamScore.totalScore));
        } else if (getState().application.page !== 'GAME') {
        // If we're not on  GAME page, go there
        // important that it must be AFTER the user has their status updated.
          dispatch(updatePage('GAME'));
        }
      });
      
      /**
       * Used to notifify user to move from `LobbyPage` to `BowlPage`
       */
      socketClient.subscribe(`/client/room/${code}/state/word`, function (payload) {
        const { body } = payload;
        const {ready, usersStatus} = JSON.parse(body);

        
        // Navigate user to BOWL page if not done already.
        if(getState().application.page !== 'BOWL') {
          dispatch(updatePage('BOWL'));
        }

        // Init/reset word readiness status here.
        if (ready) {
          return dispatch({
            type: 'UPDATE_READY_WORD',
            status: false,
          });
        }

        // Init/reset word list here 
        dispatch(updateWordReady(usersStatus));

      });

      /**
       * Message to add word
       */
      socketClient.subscribe(`/client/room/${code}/addWords`, function (payload) {
        const { body } = payload;
        const parsedBody = JSON.parse(body);

        const {ready, usersStatus} = parsedBody;

        // If everyone is ready, allow host to click ready button
        if (ready) {
          dispatch({
            type: 'UPDATE_READY_WORD',
            status: true,
          });
        }

        // Always update the wordlist progress whenever this message get called.
        // The words are NOT stored here.
        dispatch(updateWordReady(usersStatus));
      });
      
      /**
       * Subscribe to /word. Should just update the active word in redux.
       * @returns {String} word 
       */
      socketClient.subscribe(`/client/room/${code}/game/word`, (payload) => {
        try {
          const { body } = payload; 
          const parsedBody= JSON.parse(body);
          const { word, remainingWordCount } = parsedBody;
          dispatch(updateGameWord(word));
          dispatch(updateRemainingWordCount(remainingWordCount));
        } catch (err) {
          Sentry.captureException(err);
          throw new Error(`/game/word/ error: `, err.message);
        }
      })
      
      /**
       * Subscribe to /timer. SHould update the game clock
       * @returns {Integer} timer
       */
      socketClient.subscribe(`/client/room/${code}/game/timer`, (payload) => {
        const { body } = payload;
        const parsedBody = JSON.parse(body);
        if (parsedBody >= 0) {
          // store maxTime
          if (parsedBody > getState().game.maxTime) {
            dispatch(setMaxTime(parsedBody));
          }

          dispatch(updateGameTime(parsedBody));
        }
      });

      /**
       * Subscribe to /timer. SHould update the game clock
       * @returns {Integer} timer
       */
      socketClient.subscribe(`/client/room/${code}/game/over`, (payload) => {
        try {
          const { body } = payload;
          const parsedBody = JSON.parse(body);
          dispatch(updateContent(parsedBody.scores));
          dispatch(updateGameTime(0));
          dispatch(updatePage('SCOREBOARD'));
        } catch (err) {
          Sentry.captureException(err);
          throw new Error(`WTF HAPPEND ${err.message}`)
        }
      });

       /**
        * send to /startStep inorder to start Timer.
        */

      // Subscribe to error endpoint /client/errors
      /**
       * subscribe  to error message 
       */
      socketClient.subscribe(`/user/client/errors`, function (payload) {
        const { body } = payload;
        const parsedBody = JSON.parse(body);
        if (parsedBody.status === 'BAD_REQUEST') {
          const { timestamp }= parsedBody;
          console.error(timestamp, parsedBody.message);
        }
      });

      socketClient.subscribe(`/client/room/${code}/game/reset`, function () {
        dispatch(resetGame());
        dispatch(updatePage('LOBBY'));
      })
      
      dispatch(actions.connectUser(socketClient));
    });

  }
}

export default{
  connectUser,
  updateUserName,
  updateUserId,
  updateUserTeam,
  updateUserWords,
};