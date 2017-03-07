//import fetch from 'isomorphic-fetch';
//import {checkStatus, buildBody} from '../util/';

/*const base = `https://www.motorshop.be/api`;

/*const whitelist = {
  POST: [`file`]
};

/*export const getNewQuote = current => {

  return fetch(`${base}/quote/reason/${current}`)
    .then(checkStatus);
};

export const selectRandom = () => {

  return fetch(`${base}/quotes/rand`)
    .then(checkStatus);
};

export const getImage = imgId => {

  return fetch(`${base}/quotes/image/${imgId}`)
    .then(checkStatus);
};

export const insert = data => {

  const method = `POST`;
  const body = buildBody(data, whitelist.POST);

  return fetch(`${base}/quotes/generated`, {method, body})
    .then(checkStatus);
};*/

export default {
  /*getNewQuote,
  selectRandom,
  getImage,
  insert*/
};
