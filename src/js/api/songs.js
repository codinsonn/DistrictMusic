import fetch from 'isomorphic-fetch';
import {checkStatus} from '../util/';
import {api} from '../helpers/globals.js';

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

export const saveAudioVisualisation = (songId, progressData, imageData, type) => {

  const data = {
    imageData: imageData,
    progressData: progressData
  };

  const postRequest = {body: JSON.stringify({...data}), ...postOptions};

  return fetch(`${base}/api/songs/${songId}/${type}/`, postRequest)
    .then(checkStatus)
  ;

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
  saveAudioVisualisation,
  youtubeSearch,
  getAllQueued,
  addToQueue,
  voteSong,
  endSongAndPlayNext
};
