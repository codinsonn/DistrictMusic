import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
import {songs} from '../api/';
import UserStore from '../stores/UserStore';

class PlaylistStore extends EventEmitter {

  constructor() {

    super();

    this.showSearchModal = false;
    this.showSuggestionDetail = false;

    this.showYoutubeVideo = false;
    this.videoLayoutMode = `side`;

    this.currentSuggestion = {};
    this.defaultSuggestion = {id: ``, title: ``}; // { id: '', title: '', channel: '', thumbs: {}, duration: '' };

    this.queue = [];
    this.defaultSong = {general: ``};
    this.currentSong = this.defaultSong;
    this.userChosenSong = this.defaultSong;

  }

  updateQueue() {

    //console.log(`Fetching queue from server`);

    songs.getAllQueued()
      .then(res => {

        this.queue = res;

        this.emit(`QUEUE_CHANGED`);

        if (UserStore.getSynched() && this.queue[0] !== this.currentSong) {
          this.currentSong = this.queue[0];
          this.emit(`SONG_CHANGED`);
        }

      }, failData => {

        console.log(`-!- Update queue error -!- \n`, failData, `\n-!-`);

        if (failData.errors && failData.errors.length > 0) {
          failData.errors.forEach(error => {
            console.log(`Error Msg:`, error);
          });
        }

      })
    ;

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

  setUserChosenSong(song) {

    this.userChosenSong = song;

    this.emit(`SONG_CHANGED`);

    UserStore.setSynched(false);

  }

  setShowSuggestionDetail(visible) {

    this.showSuggestionDetail = visible;

    if (!visible) {
      this.currentSuggestion = this.defaultSuggestion;
    }

    this.emit(`SHOW_SUGGESTION_DETAIL_CHANGED`);

  }

  resetSearchbar() {

    this.currentSuggestion = this.defaultSuggestion;

    this.emit(`RESET_SEARCH_BAR`);

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

  getShowYoutubeVideo() {

    return this.showYoutubeVideo;

  }

  getVideoLayoutMode() {

    return this.videoLayoutMode;

  }

  getCurrentQueue() {

    return this.queue;

  }

  getSong(synched) {

    if (synched && this.queue[0]) {
      console.log(`Returning first song`);
      return this.currentSong;
    } else {
      console.log(`Returning user chosen song`);
      return this.userChosenSong;
    }

  }

  handleActions(action) {

    switch (action.type) {

    case `SHOW_SEARCH_MODAL`:
      this.setShowSearchModal(true);
      break;

    case `HIDE_SEARCH_MODAL`:
      this.setShowSearchModal(false);
      break;

    case `RESET_SEARCH_BAR`:
      this.resetSearchbar();
      break;

    case `SHOW_SUGGESTION_DETAIL`:
      this.setCurrentSuggestion(action.data);
      break;

    case `HIDE_SUGGESTION_DETAIL`:
      this.setShowSuggestionDetail();
      break;

    case `UPDATE_QUEUE`:
      this.updateQueue();
      break;

    case `SET_USER_CHOSEN_SONG`:
      this.setUserChosenSong(action.data);
      break;

    }
  }

}

const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
window.dispatcher = dispatcher;

export default playlistStore;
