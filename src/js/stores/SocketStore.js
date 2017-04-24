import io from 'socket.io-client';
//import wio from 'socketio-shared-webworker/socket.io-worker';
//import wio from 'socketio-shared-webworker';
import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
import UserStore from './UserStore';
import PlaylistStore from '../stores/PlaylistStore';

class SocketStore extends EventEmitter {

  constructor() {

    super();

    this.socket = io();
    //this.socketWorker = new SharedWorker(`assets/workers/socketWorker.js`, `DistrictMusicWorker`);
    //this.socketWorker = wio(`http://localhost:3020/`);
    //this.socketWorker.setWorker(`node_modules/socketio-shared-webworker/shared-worker.js`);
    //this.socketWorker.setWorker(`assets/workers/shared-worker.js`);
    this.socketId = ``;

    // -- Vars ---------
    this.appearBusy = false;
    this.downloadProgress = 0;

    // -- Events -------
    this.socket.on(`CONNECTED`, socketId => this.setSocketId(socketId));
    this.socket.on(`UPDATED_SOCKET_ID`, socketId => UserStore.updateSessionSocketId(socketId));
    this.socket.on(`DOWNLOAD_PROGRESS`, data => this.updateDownloadProgress(data));
    this.socket.on(`DOWNLOAD_DONE`, data => this.updateDownloadProgress(data));
    this.socket.on(`QUEUE_UPDATED`, currentQueue => PlaylistStore.handleSocketQueueUpdate(currentQueue));
    this.socket.on(`CHECK_SPEAKER_QUEUE`, currentQueue => PlaylistStore.checkSpeakerQueue(currentQueue));
    this.socket.on(`PROFILE_UPDATED`, user => UserStore.updateUserProfile(user));
    this.socket.on(`SPEAKER_RESET`, () => PlaylistStore.updateSpeakerConnected(true));
    this.socket.on(`SPEAKER_UNSET`, () => PlaylistStore.updateSpeakerConnected(false));
    this.socket.on(`SPEAKER_POS_UPDATED`, speakerPos => PlaylistStore.synchPosToSpeaker(speakerPos));

    /*this.socketWorker.on(`connect`, () => {
      this.socketWorker.on(`CONNECTED`, socketId => this.setSocketId(socketId));
      this.socketWorker.on(`UPDATED_SOCKET_ID`, socketId => UserStore.updateSessionSocketId(socketId));
      this.socketWorker.on(`DOWNLOAD_PROGRESS`, data => this.updateDownloadProgress(data));
      this.socketWorker.on(`DOWNLOAD_DONE`, data => this.updateDownloadProgress(data));
      this.socketWorker.on(`QUEUE_UPDATED`, currentQueue => PlaylistStore.handleSocketQueueUpdate(currentQueue));
      this.socketWorker.on(`CHECK_SPEAKER_QUEUE`, currentQueue => PlaylistStore.checkSpeakerQueue(currentQueue));
      this.socketWorker.on(`PROFILE_UPDATED`, user => UserStore.updateUserProfile(user));
      this.socketWorker.on(`SPEAKER_RESET`, () => PlaylistStore.updateSpeakerConnected(true));
      this.socketWorker.on(`SPEAKER_UNSET`, () => PlaylistStore.updateSpeakerConnected(false));
      this.socketWorker.on(`SPEAKER_POS_UPDATED`, speakerPos => PlaylistStore.synchPosToSpeaker(speakerPos));
      this.socketWorker.on(`message`, data => { console.log(`[SocketStore] WORKER EVT:`, data); });
    });

    this.socketWorker.on(`disconnect`, () => { console.log(`[SocketStore] USER DISCONNECTED`); });
    this.socketWorker.on(`error`, data => { console.log(`[SocketStore] -!- ERROR:`, data, `-!-`); });*/

  }

  updateDownloadProgress(downloadData) {

    if (this.appearBusy === true) {
      this.appearBusy = false;
      this.emit(`APPEAR_BUSY_CHANGED`);
    }

    this.downloadProgress = downloadData.percent;
    this.emit(`DOWNLOAD_PROGRESS_UPDATED`);

  }

  setSocketId(socketId) {

    console.log(`[SocketStore] Connected to socket:`, socketId);

    this.socketId = socketId;

    this.emit(`SET_SOCKET_ID`);

  }

  setAppearBusy(busy) {

    if (this.downloadProgress === 0 || this.downloadProgress === 1) {
      this.appearBusy = busy;
      this.emit(`APPEAR_BUSY_CHANGED`);
    }

  }

  emitSpeakerPos(speakerPos) {

    this.socket.emit(`UPDATE_SPEAKER_POS`, speakerPos);
    //this.socketWorker.emit(`UPDATE_SPEAKER_POS`, speakerPos);

  }

  getDownloadProgress() {

    return this.downloadProgress;

  }

  getSocketId() {

    return this.socketId;

  }

  getAppearBusy() {

    return this.appearBusy;

  }

  handleActions(action) {

    switch (action.type) {

    case `RESET_DOWNLOAD_PROGRESS`:
      this.resetDownloadProgress();
      break;

    case `SET_APPEAR_BUSY`:
      this.setAppearBusy(action.data);
      break;

    }

  }

}

const socketStore = new SocketStore;
dispatcher.register(socketStore.handleActions.bind(socketStore));
window.dispatcher = dispatcher;

export default socketStore;
