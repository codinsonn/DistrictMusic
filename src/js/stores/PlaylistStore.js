import {EventEmitter} from 'events';
import _ from 'lodash';
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
    this.defaultSuggestion = {id: ``, title: ``};

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

    console.log(`[PlaylistStore] About to update queue...`);

    songs.getAllQueued()
      .then(res => {

        this.queue = res;
        this.emit(`QUEUE_CHANGED`);

        console.log(`[PlaylistStore] Queue Fetched!`, UserStore.getIsSpeaker(), this.queue[0].general, this.speakerSong.general);

        if (UserStore.getIsSpeaker() && this.queue[0].general.id !== `` && this.queue[0].general !== this.speakerSong.general) {

          this.updateSpeakerSong();

        } else if (this.speakerSong.general !== `` && this.queue[0].general.id !== this.speakerSong.general.id) {

          console.log(`[PlaylistStore] About to update speakersong`);

          if (this.userChosenSong.general === ``) {
            this.updateUserChosenSong(this.queue[0]);
          }

          this.updateSpeakerSong();

        } else if (!this.hasFetchedQueue && this.queue[0]) {

          console.log(`[PlaylistStore] About to update user chosen song`);

          this.updateSpeakerSong(this.queue[0]);
          this.updateUserChosenSong(this.queue[0]);

        }

        this.hasFetchedQueue = true;

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

    console.log(`[Speaker] About to end song and play next`);

    songs.endSongAndPlayNext(song)
      .then(res => {

        console.log(`[Speaker] Ended song, about play the next one`, res);

      }, failData => {

        console.log(`[Speaker] Failed to end song and play next:`, failData);

      })
    ;

  }

  startNextSongUnsynched(prevSongId) {

    console.log(`[NEXT] Starting next song in queue, prev:`, prevSongId);

    let i = 0;
    let nextSongIndex = 0;
    _.forEach(this.queue, queItem => {

      console.log(`[NEXT] Checking:`, prevSongId, queItem.general.id);

      if (queItem.general.id === prevSongId && i !== this.queue.length - 1) {
        console.log(`[NEXT] HIT!!!`);
        nextSongIndex = i + 1;
      }

      i ++;

      if (i === this.queue.length) {
        console.log(`[NEXT] Ending loop:`, nextSongIndex, this.queue.length, this.queue[nextSongIndex].general.title);
        this.setUserChosenSong(this.queue[nextSongIndex]);
      }

    });

  }

  updateSpeakerConnected(speakerConnected) {

    if (speakerConnected !== this.speakerConnected) {

      this.speakerConnected = speakerConnected;

      if (this.speakerConnected) {
        console.log(`[SPEAKER] Updated connected speaker`, this.speakerConnected);
        this.emit(`SPEAKER_RESET`);
      } else {
        console.log(`[SPEAKER] Speaker disconnected`, this.speakerConnected);
        if (UserStore.getSynched()) {
          setTimeout(() => this.emit(`SPEAKER_DISCONNECTED`), 10);
        }
        UserStore.setSynched(false);
        this.emit(`SPEAKER_UNSET`);
      }

    }

  }

  updateUserChosenSong(song) {

    this.userChosenSong = song;
    this.emit(`SONG_CHANGED`);

  }

  updateSpeakerSong(asSynched = false) {

    if (this.speakerSong.general === `` || this.speakerSong.general.id !== this.queue[0].general.id) {

      console.log(`[PlaylistStore] Updating speakersong`);

      this.speakerSong = this.queue[0];

      if (this.speakerSong.general === `` || asSynched || UserStore.getSynched() || UserStore.getIsSpeaker()) {
        this.emit(`SPEAKER_SONG_CHANGED`);
      }

    }

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

    if (synched && this.speakerSong.general !== ``) {
      console.log(`Returning speaker song:`, this.speakerSong.general.title);
      setTimeout(() => this.emit(`SHOW_SONG_UPDATE`), 1000);
      return this.speakerSong;
    } else if (!synched && this.userChosenSong.general !== ``) {
      console.log(`Returning user chosen song:`, this.userChosenSong.general.title);
      setTimeout(() => this.emit(`SHOW_SONG_UPDATE`), 1000);
      return this.userChosenSong;
    } else if (this.queue[0]) {
      console.log(`Returning first in queue:`, this.queue[0].general.title);
      return this.queue[0];
    } else {
      console.log(`Returning default empty song`);
      return this.defaultSong;
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

    case `START_NEXT_SONG_UNSYNCHED`:
      this.startNextSongUnsynched(action.data);
      break;

    case `PAUSE_PLAY`:
      console.log(`Pausing play`);
      this.emit(`PAUSE_PLAY`);
      break;

    }
  }

}

const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
window.dispatcher = dispatcher;

export default playlistStore;
