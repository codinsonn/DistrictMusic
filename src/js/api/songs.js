import fetch from 'isomorphic-fetch';
import {checkStatus/*, buildBody*/} from '../util/';

const base = `http://localhost:3020`;

const getOptions = {
  method: `get`,
  headers: new Headers({
    Accept: `application/json, application/xml, text/plain, text/html, *.*`
  }),
  credentials: `same-origin`,
  withCredentials: true
};

export const youtubeSearch = query => {

  return fetch(`${base}/api/youtube/search/${query}`, getOptions)
    .then(checkStatus)
  ;

};

export default {
  youtubeSearch
};
