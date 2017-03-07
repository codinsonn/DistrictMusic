'use strict';

export const host = (() => {

  if (location.hostname === `localhost` || location.hostname === `127.0.0.1`) {
    return `http://localhost:3000`;
  } else {
    return `https://districtmusic.herokuapp.com`;
  }

})();
