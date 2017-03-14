import fetch from 'isomorphic-fetch';
import {checkStatus} from '../util/';

const base = `http://localhost:3020`;

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

export const addToQueue = song => {

  const postRequest = {body: JSON.stringify({...song}), ...postOptions};

  return fetch(`${base}/api/songs/queue/`, postRequest)
    .then(checkStatus)
  ;

};

export default {
  youtubeSearch,
  addToQueue
};
