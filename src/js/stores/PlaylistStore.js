import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
//import {songs} from '../api/';
import UserStore from '../stores/UserStore';

class PlaylistStore extends EventEmitter {

  constructor() {

    super();

    this.showSearchModal = false;

    this.queue = [];

  }

  setShowSearchModal(visible) {

    let blnShowModal = false;
    if (UserStore.getLoggedIn()) {
      blnShowModal = visible;
    }
    this.showSearchModal = blnShowModal;

    this.emit(`SHOW_SEARCH_MODAL_CHANGED`);

  }

  getShowSearchModal() {

    return this.showSearchModal;

  }

  handleActions(action) {

    switch (action.type) {

    case `SHOW_LOGIN_MODAL`:
      this.setShowSearchModal(true);
      break;

    case `HIDE_LOGIN_MODAL`:
      this.setShowSearchModal(false);
      break;

    }
  }

}

const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
window.dispatcher = dispatcher;

export default playlistStore;
