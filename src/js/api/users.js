import fetch from 'isomorphic-fetch';
import {checkStatus/*, buildBody*/} from '../util/';
import {api} from '../helpers/globals.js';

//console.log(`[API:Users] using:`, api);
const base = api;

const getOptions = {
  method: `get`,
  headers: new Headers({
    Accept: `application/json, application/xml, text/plain, text/html, *.*`
  }),
  credentials: `same-origin`,
  withCredentials: true
};

const postOptions = {
  method: `post`,
  headers: {
    Accept: `application/json`,
    'Content-Type': `application/json`
  },
  credentials: `same-origin`,
  withCredentials: true
};

export const authenticateUser = () => {

  return fetch(`${base}/auth/user/google`)
    .then(checkStatus)
  ;

};

export const setSpeaker = (asSpeaker, socketId) => {

  const postRequest = {body: JSON.stringify({setAsSpeaker: asSpeaker, socketId: socketId}), ...postOptions};

  return fetch(`${base}/auth/speaker`, postRequest)
    .then(checkStatus)
  ;

};

export const getSessionProfile = () => {

  return fetch(`${base}/api/sess/profile`, getOptions)
    .then(checkStatus)
  ;

};

export const updateSessionSocketId = socketId => {

  const postRequest = {body: JSON.stringify({socketId: socketId}), ...postOptions};

  return fetch(`${base}/api/sess/profile/socketid`, postRequest)
    .then(checkStatus)
  ;

};

export const logout = () => {

  return fetch(`${base}/auth/user/logout`, getOptions)
    .then(checkStatus)
  ;

};

export default {
  authenticateUser,
  setSpeaker,
  getSessionProfile,
  updateSessionSocketId,
  logout
};
