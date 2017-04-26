'use strict';

export const host = (() => {

  if (location.hostname.indexOf(`localhost`) > - 1 || location.hostname.indexOf(`127.0.0.1`) > - 1) {
    return `http://localhost:3020`;
  } else {
    return `https://districtmusic.herokuapp.com`;
  }

})();

export const api = (() => {

  if (location.hostname.indexOf(`localhost`) > - 1 || location.hostname.indexOf(`127.0.0.1`) > - 1) {
    return `http://localhost:3020`;
  } else {
    return `https://districtmusic.herokuapp.com`;
  }

})();
