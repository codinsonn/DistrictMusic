import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
import {songs} from '../api/';
import UserStore from '../stores/UserStore';
import SocketStore from '../stores/SocketStore';

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
    this.speakerSong = this.defaultSong;
    this.userChosenSong = this.defaultSong;
    this.hasFetchedQueue = false;

    this.audioPos = 0;
    this.videoPos = 0;

    this.speakerConnected = false;
    this.hasSynchedToSpeaker = false;
    this.speakerPos = 0;
    this.lastSpeakerPosUpdate = 0;

  }

  updateQueue() {

    songs.getAllQueued()
      .then(res => {

        this.queue = res;

        this.emit(`QUEUE_CHANGED`);

        if (this.queue[0] !== this.speakerSong) {

          console.log(`[PlaylistStore] About to update speakersong`);

          if (this.userChosenSong.general === ``) {
            this.userChosenSong = this.queue[0];
            this.hasFetchedQueue = true;
            this.emit(`SONG_CHANGED`);
          }

          this.updateSpeakerSong();

        } else if (!UserStore.getSynched() && this.queue[0] && !this.hasFetchedQueue) {

          console.log(`[PlaylistStore] About to update user chosen song`);

          this.userChosenSong = this.queue[0];
          this.hasFetchedQueue = true;
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

  endSongAndPlayNext(song) {

    songs.endSongAndPlayNext(song)
      .then(res => {

        console.log(`[Speaker] Ending song and playing next one`, res);

      }, failData => {

        console.log(`[Speaker] Failed to end song and play next:`, failData);

      })
    ;

  }

  updateSpeakerConnected(speakerConnected) {

    if (speakerConnected !== this.speakerConnected) {

      this.speakerConnected = speakerConnected;

      if (this.speakerConnected) {
        console.log(`[SPEAKER] Updated connected speaker`, this.speakerConnected);
        this.emit(`SPEAKER_RESET`);
      } else {
        console.log(`[SPEAKER] Speaker disconnected`, this.speakerConnected);
        this.emit(`SPEAKER_UNSET`);
      }

    }

  }

  updateSpeakerSong(asSynched = false) {

    console.log(`[PlaylistStore] Updating speakersong`);

    this.speakerSong = this.queue[0];

    if (asSynched || UserStore.getSynched()) {
      this.emit(`SPEAKER_SONG_CHANGED`);
    }

    //setTimeout(() => this.emit(`SONG_CHANGED`), 10);

  }

  synchPosToSpeaker(speakerPos) {

    this.speakerConnected = true;
    this.lastSpeakerPosUpdate = speakerPos.posUpdatedDate;
    this.speakerPos = speakerPos.speakerPos;

    const waitingToSynch = UserStore.getWaitingForPosChange();
    if (waitingToSynch) {
      console.log(`[SYNCH] waiting to synch:`, waitingToSynch);
      UserStore.confirmSynched();
    }

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

  }

  setAudioPos(audioPos, sendSocketEvent, posUpdatedDate) {

    this.audioPos = audioPos;

    if (sendSocketEvent && UserStore.getIsSpeaker()) {
      const posData = {speakerPos: this.audioPos, posUpdatedDate: posUpdatedDate};
      SocketStore.emitSpeakerPos(posData);
    }

    this.emit(`AUDIO_POS_CHANGED`);

  }

  setVideoPos(videoPos) {

    this.videoPos = videoPos;

    this.emit(`VIDEO_POS_CHANGED`);

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

  getSpeakerConnected() {

    return this.speakerConnected;

  }

  getSpeakerPos() {

    return {speakerPos: this.speakerPos, lastSpeakerPosUpdate: this.lastSpeakerPosUpdate};

  }

  getSong(synched) {

    if (synched && this.queue[0]) {
      console.log(`Returning first song`);
      return this.speakerSong;
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

    case `SET_AUDIO_POS`:
      this.setAudioPos(action.audioPos, action.sendSocketEvent, action.posUpdatedDate);
      break;

    case `SET_VIDEO_POS`:
      this.setVideoPos(action.data);
      break;

    case `END_SONG_AND_PLAY_NEXT`:
      this.endSongAndPlayNext(action.data);
      break;

    }
  }

}

const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
window.dispatcher = dispatcher;

export default playlistStore;
