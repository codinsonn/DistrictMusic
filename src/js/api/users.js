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

export const authenticateUser = () => {

  return fetch(`${base}/auth/user/google`)
    .then(checkStatus)
  ;

};

export const getSessionProfile = () => {

  return fetch(`${base}/api/sess/profile`, getOptions)
    .then(checkStatus)
  ;

};

export const logout = () => {

  return fetch(`${base}/auth/user/logout`, getOptions)
    .then(checkStatus)
  ;

};

/*export const authenticateUser = data => {

  const method = `POST`;
  const options = {
    mode: `no-cors`,
    headers: {
      'Access-Control-Allow-Origin': `http://localhost:3020`,
      'Content-Type': `x-www-form-urlencoded`,
      token: data.googleToken
    }
  };
  const body = buildBody(data, options);

  return fetch(`${base}/auth/user/google`, {method, body})
    .then(checkStatus)
  ;

};*/

export default {
  authenticateUser,
  getSessionProfile,
  logout
};
