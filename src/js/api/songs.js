import fetch from 'isomorphic-fetch';
import {checkStatus} from '../util/';
import {api} from '../helpers/globals.js';

//const base = `http://localhost:3020`;
console.log(`[API:Songs] using:`, api);
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

export const youtubeSearch = query => {

  return fetch(`${base}/api/youtube/search/${query}`, getOptions)
    .then(checkStatus)
  ;

};

export const getAllQueued = () => {

  return fetch(`${base}/api/songs/queue/`, getOptions)
    .then(checkStatus)
  ;

};

export const addToQueue = song => {

  const postRequest = {body: JSON.stringify({...song}), ...postOptions};

  return fetch(`${base}/api/songs/queue/`, postRequest)
    .then(checkStatus)
  ;

};

export const voteSong = (songId, songTitle, voteType) => {

  const uservote = {
    songId: songId,
    songTitle: songTitle,
    voteType: voteType
  };

  const postRequest = {body: JSON.stringify({...uservote}), ...postOptions};

  return fetch(`${base}/api/songs/queue/vote`, postRequest)
    .then(checkStatus)
  ;

};

export const endSongAndPlayNext = song => {

  const postRequest = {body: JSON.stringify({...song}), ...postOptions};

  return fetch(`${base}/api/songs/queue/next`, postRequest)
    .then(checkStatus)
  ;

};

export default {
  youtubeSearch,
  getAllQueued,
  addToQueue,
  voteSong,
  endSongAndPlayNext
};
