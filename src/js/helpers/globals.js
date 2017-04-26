'use strict';

export const host = (() => {

  if (location.hostname === `localhost` || location.hostname === `127.0.0.1`) {
    console.log('[globals] location hostname:', location.hostname);
    return `http://localhost:3020`;
  } else {
    return `https://districtmusic.herokuapp.com`;
  }

})();

export const api = (() => {

  if (location.hostname === `localhost` || location.hostname === `127.0.0.1`) {
    console.log('[globals] location hostname:', location.hostname);
    return `http://localhost:3020`;
  } else {
    return `https://districtmusic.herokuapp.com`;
  }

})();
