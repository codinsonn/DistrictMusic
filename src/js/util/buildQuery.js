import {isEmpty, pick} from 'lodash';

export default (query, whitelist) => {

  query = pick(query, whitelist);
  if (isEmpty(query)) return ``;

  const keys = Object.keys(query);

  let qs = ``;

  keys.forEach((key, i) => {
    qs += `${key}=${query[key]}`;
    if (i !== keys.length - 1) qs += `&`;
  });

  return qs;

};
