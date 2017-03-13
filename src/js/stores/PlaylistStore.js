import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
//import {songs} from '../api/';
import UserStore from '../stores/UserStore';

class PlaylistStore extends EventEmitter {

  constructor() {

    super();

    this.showSearchModal = false;
    this.showSuggestionDetail = false;

    this.currentSuggestion = {};
    this.defaultSuggestion = {id: ``, title: ``}; // { id: '', title: '', channel: '', thumbs: {}, duration: '' };

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

  setCurrentSuggestion(suggestion) {

    this.currentSuggestion = suggestion;
    console.log(`Suggestion`, this.currentSuggestion);
    this.setShowSuggestionDetail(true);

  }

  setShowSuggestionDetail(visible) {

    this.showSuggestionDetail = visible;

    if (!visible) {
      this.currentSuggestion = this.defaultSuggestion;
    }

    this.emit(`SHOW_SUGGESTION_DETAIL_CHANGED`);

  }

  getCurrentSuggestion() {

    return this.currentSuggestion;

  }

  getShowSuggestionDetail() {

    return this.showSuggestionDetail;

  }

  getShowSearchModal() {

    return this.showSearchModal;

  }

  handleActions(action) {

    switch (action.type) {

    case `SHOW_SEARCH_MODAL`:
      this.setShowSearchModal(true);
      break;

    case `HIDE_SEARCH_MODAL`:
      this.setShowSearchModal(false);
      break;

    case `SHOW_SUGGESTION_DETAIL`:
      this.setCurrentSuggestion(action.data);
      break;

    case `HIDE_SUGGESTION_DETAIL`:
      this.setShowSuggestionDetail();
      break;

    }
  }

}

const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
window.dispatcher = dispatcher;

export default playlistStore;
