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
    this.playMode = `normal`;

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

    //console.log(`[PlaylistStore] About to update queue...`);

    songs.getAllQueued()
      .then(res => {

        //console.log(`[PlaylistStore] Queue Response:`, res);

        this.handleQueueChange(res);

      }, failData => {

        //console.log(`-!- Update queue error -!- \n`, failData, `\n-!-`);

        if (failData.errors && failData.errors.length > 0) {
          failData.errors.forEach(error => {
            console.log(`Error Msg:`, error);
          });
        }

      })
    ;

  }

  handleSocketQueueUpdate(currentQueue) {

    if (UserStore.getLoggedIn() && currentQueue.length >= 1) {

      //console.log(`[PlaylistStore] SocketQueue filled, fetching uservotes`);

      let i = 0;
      _.forEach(currentQueue, socketQueueItem => {

        //console.log(`[PlaylistStore] Checking uservote for`, socketQueueItem.general.id);

        _.forEach(this.queue, queItem => {

          if (
            socketQueueItem.general.id === queItem.general.id &&
            queItem.uservote && queItem.uservote.hasVoted
          ) {
            currentQueue[i].uservote = queItem.uservote;
          }

        });

        i ++;

        if (i === currentQueue.length) {
          //console.log(`[PlaylistStore] About to handle queue change`);
          this.handleQueueChange(currentQueue);
        }

      });

    } else if (!UserStore.getLoggedIn() && currentQueue.length >= 1) {

      //console.log(`[PlaylistStore] SocketQueue filled, but no user logged in`);

      this.handleQueueChange(currentQueue);

    } else {

      //console.log(`[PlaylistStore] SocketQueue:`, currentQueue);
      //console.log(`[PlaylistStore] SocketQueue Empty, updating by request`);

      this.updateQueue();

    }

  }

  handleQueueChange(currentQueue) {

    this.queue = currentQueue;

    //console.log(`[PlaylistStore] Queue Fetched! (`, UserStore.getIsSpeaker(), `)`, this.queue[0].general.title);

    if (UserStore.getIsSpeaker() && this.queue[0].general.id !== `` && this.queue[0].general !== this.speakerSong.general) {

      this.updateSpeakerSong();
      this.userChosenSong = this.speakerSong;

    } else if (this.speakerSong.general !== `` && this.queue[0].general.id !== this.speakerSong.general.id) {

      //console.log(`[PlaylistStore] About to update speakersong`);

      if (this.userChosenSong.general === ``) {
        this.updateUserChosenSong(this.queue[0]);
      }

      this.updateSpeakerSong();

    } else if (!this.hasFetchedQueue && this.queue[0]) {

      //console.log(`[PlaylistStore] About to update user chosen song`);

      this.updateSpeakerSong(this.queue[0]);
      this.updateUserChosenSong(this.queue[0]);

    }

    // Keep userchosen song up to date
    if (!UserStore.getSynched()) {
      _.forEach(currentQueue, queItem => {
        if (queItem.general.id === this.userChosenSong.general.id) {
          this.userChosenSong = queItem;
        }
      });
    }

    // Keep speakersong up to date
    if (UserStore.getSynched()) {
      _.forEach(currentQueue, queItem => {
        if (queItem.general.id === this.speakerSong.general.id) {
          this.speakerSong = queItem;
        }
      });
    }

    this.emit(`QUEUE_CHANGED`);
    this.hasFetchedQueue = true;

  }

  checkSpeakerQueue(currentQueue) {

    if (UserStore.getIsSpeaker) {
      this.handleQueueChange(currentQueue);
    }

  }

  endSongAndPlayNext(song) {

    //console.log(`[Speaker] About to end song and play next`);

    songs.endSongAndPlayNext(song)
      .then(res => {

        console.log(`[Speaker] Ended song, about play the next one`, res);

      }, failData => {

        if (failData) {
          console.log(`[Speaker] Failed to end song and play next:`, failData);
        }

      })
    ;

  }

  startNextSongUnsynched(currentSongId) {

    if (!UserStore.getIsSpeaker()) {

      if (UserStore.getSynched()) {
        UserStore.setSynched(false);
      }

      let i = 0;
      let nextSongIndex = 0;
      _.forEach(this.queue, queItem => {

        if (queItem.general.id === currentSongId && i !== this.queue.length - 1) {
          nextSongIndex = i + 1;
        }

        i ++;

        if (i === this.queue.length) {
          this.setUserChosenSong(this.queue[nextSongIndex]);
        }

      });

    }

  }

  startPrevSongUnsynched(currentSongId) {

    if (!UserStore.getIsSpeaker()) {

      if (UserStore.getSynched()) {
        UserStore.setSynched(false);
      }

      let i = 0;
      let prevSongIndex = this.queue.length - 1;
      _.forEach(this.queue, queItem => {

        if (queItem.general.id === currentSongId && i !== 0) {
          prevSongIndex = i - 1;
        }

        i ++;

        if (i === this.queue.length) {
          this.setUserChosenSong(this.queue[prevSongIndex]);
        }

      });

    }

  }

  updateSpeakerConnected(speakerConnected) {

    console.log(`[PlaylistStore:243] Speaker changed! connected:`, speakerConnected, `(updateSpeakerConnected)`);

    if (speakerConnected !== this.speakerConnected) {

      this.speakerConnected = speakerConnected;

      if (this.speakerConnected) {
        console.log(`[SPEAKER] Updated connected speaker`, this.speakerConnected);
        setTimeout(() => this.emit(`SPEAKER_RESET`), 1);
      } else {
        console.log(`[SPEAKER] Speaker disconnected`, this.speakerConnected);
        if (UserStore.getSynched()) {
          setTimeout(() => this.emit(`SPEAKER_DISCONNECTED`), 1);
        }
        UserStore.setSynched(false);
        setTimeout(() => this.emit(`SPEAKER_UNSET`), 1);
      }

    }

  }

  updateUserChosenSong(song) {

    this.userChosenSong = song;
    setTimeout(() => this.emit(`SONG_CHANGED`), 1);

  }

  updateSpeakerSong(asSynched = false) {

    if (this.speakerSong.general === `` || this.speakerSong.general.id !== this.queue[0].general.id) {

      //console.log(`[PlaylistStore] Updating speakersong`);

      this.speakerSong = this.queue[0];
      this.userChosenSong = this.queue[0];

      if (this.speakerSong.general === `` || asSynched || UserStore.getSynched() || UserStore.getIsSpeaker()) {
        setTimeout(() => this.emit(`SPEAKER_SONG_CHANGED`), 1);
      }

    }

  }

  synchPosToSpeaker(speakerPos) {

    //console.log(`[PlaylistStore:288] Speaker pos updated!`, speakerPos.speakerPos, `(synchPosToSpeaker)`);

    //this.speakerConnected = true;
    this.updateSpeakerConnected(true);
    this.lastSpeakerPosUpdate = speakerPos.posUpdatedDate;
    this.speakerPos = speakerPos.speakerPos;

    const waitingToSynch = UserStore.getWaitingForPosChange();
    if (waitingToSynch) {
      console.log(`[PlaylistStore:295] Waiting to synch...`, waitingToSynch, `(synchPosToSpeaker)`);
      UserStore.confirmSynched();
    }

  }

  setShowSearchModal(visible) {

    let blnShowModal = false;
    if (UserStore.getLoggedIn()) {
      blnShowModal = visible;
    }
    this.showSearchModal = blnShowModal;

    setTimeout(() => this.emit(`SHOW_SEARCH_MODAL_CHANGED`), 1);

  }

  setCurrentSuggestion(suggestion) {

    this.currentSuggestion = suggestion;
    //console.log(`Suggestion`, this.currentSuggestion);
    this.setShowSuggestionDetail(true);

  }

  setUserChosenSong(song) {

    this.userChosenSong = song;

    setTimeout(() => this.emit(`SONG_CHANGED`), 1);

  }

  setAudioPos(audioPos, sendSocketEvent, posUpdatedDate) {

    this.audioPos = audioPos;

    if (sendSocketEvent && UserStore.getIsSpeaker()) {
      console.log(`[PlaylistStore] Sending Speaker Pos Update`);
      const posData = {speakerPos: this.audioPos, posUpdatedDate: posUpdatedDate};
      SocketStore.emitSpeakerPos(posData);
    }

    setTimeout(() => this.emit(`AUDIO_POS_CHANGED`), 1);

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

    setTimeout(() => this.emit(`SHOW_SUGGESTION_DETAIL_CHANGED`), 1);

  }

  setPlayMode(playMode) {

    if (playMode !== this.playMode) {

      this.playMode = playMode;

      setTimeout(() => this.emit(`PLAY_MODE_CHANGED`), 1);

    }

  }

  resetSearchbar() {

    this.currentSuggestion = this.defaultSuggestion;

    setTimeout(() => this.emit(`RESET_SEARCH_BAR`), 1);

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
      //console.log(`[PlaylistStore] Returning speaker song:`, this.speakerSong.general.title);
      setTimeout(() => this.emit(`SHOW_SONG_UPDATE`), 1000);
      return this.speakerSong;
    } else if (!synched && this.userChosenSong.general !== ``) {
      //console.log(`[PlaylistStore] Returning user chosen song:`, this.userChosenSong.general.title);
      setTimeout(() => this.emit(`SHOW_SONG_UPDATE`), 1000);
      return this.userChosenSong;
    } else if (this.queue[0]) {
      //console.log(`[PlaylistStore] Returning first in queue:`, this.queue[0].general.title);
      return this.queue[0];
    } else {
      return this.defaultSong;
    }

  }

  getPlayMode() {

    return this.playMode;

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

    case `START_PREV_SONG_UNSYNCHED`:
      this.startPrevSongUnsynched(action.data);
      break;

    case `SET_PLAY_MODE`:
      this.setPlayMode(action.data);
      break;

    case `PAUSE_PLAY`:
      setTimeout(() => this.emit(`PAUSE_PLAY`), 1);
      break;

    }
  }

}

const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
window.dispatcher = dispatcher;

export default playlistStore;
