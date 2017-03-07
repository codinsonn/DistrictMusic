import fetch from 'isomorphic-fetch';
import {checkStatus/*, buildBody*/} from '../util/';

const base = `http://localhost:3020`;

export const authenticateUser = data => {

  console.log(`Loggin in user:`, data);

  return fetch(`${base}/auth/user/google`)
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
  authenticateUser
};
