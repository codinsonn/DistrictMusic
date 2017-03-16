import io from 'socket.io-client';
import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
import UserStore from './UserStore';

class SocketStore extends EventEmitter {

  constructor() {

    super();

    this.socket = io();

    // -- Vars ---------
    this.downloadProgress = 0;

    // -- Events -------
    this.socket.on(`UPDATED_SOCKET_ID`, socketId => UserStore.updateSessionSocketId(socketId));
    this.socket.on(`DOWNLOAD_PROGRESS`, data => this.updateDownloadProgress(data));
    this.socket.on(`DOWNLOAD_DONE`, data => this.updateDownloadProgress(data));
    this.socket.on(`QUEUE_UPDATED`, () => this.emit(`QUEUE_UPDATED`));

  }

  updateDownloadProgress(downloadData) {

    this.downloadProgress = downloadData.percent;

    this.emit(`DOWNLOAD_PROGRESS_UPDATED`);

  }

  getDownloadProgress() {

    return this.downloadProgress;

  }

  getSocket() {

    return this.socket;

  }

  handleActions(action) {

    switch (action.type) {

    case `RESET_DOWNLOAD_PROGRESS`:
      this.resetDownloadProgress();
      break;

    }

  }

}

const socketStore = new SocketStore;
dispatcher.register(socketStore.handleActions.bind(socketStore));
window.dispatcher = dispatcher;

export default socketStore;
