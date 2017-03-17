import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';

class NotificationsStore extends EventEmitter {

  constructor() {

    super();

    //this.gapiClientLoaded = false;

    this.notifs = [];
    this.emptyNotif = {type: ``, message: ``};

  }

  emitNotifChange() {

    this.emit(`NOTIFICATIONS_CHANGED`);

  }

  setGapiClientLoaded() {

    //this.gapiClientLoaded = true;

    this.emit(`GAPI_CLIENT_READY`);

  }

  addSuccess(message) {

    this.notifs.splice(0, 1); // remove current notification

    this.notifs.push({type: `success`, message: message});

    this.emitNotifChange();

  }

  addNotification(message) {

    this.notifs.splice(0, 1); // remove current notification

    this.notifs.push({type: `info`, message: message});

    this.emitNotifChange();

  }

  addError(message) {

    this.notifs.splice(0, 1); // remove current notification

    this.notifs.push({type: `error`, message: message});

    this.emitNotifChange();

  }

  removeCurrentNotification() {

    this.notifs.splice(0, 1); // remove current notification

    this.emitNotifChange();

  }

  hideNotification() {

    this.emit(`HIDE_NOTIFICATION`);

  }

  getNext() {

    if (this.notifs.length >= 1) {
      return this.notifs[0];
    } else {
      return this.emptyNotif;
    }

  }

  handleActions(action) {

    switch (action.type) {

    case `GAPI_CLIENT_LOADED`:
      this.setGapiClientLoaded();
      break;

    case `ADD_SUCCESS`:
      this.addSuccess(action.notification);
      break;

    case `ADD_INFO`:
      this.addNotification(action.notification);
      break;

    case `ADD_ERROR`:
      this.addError(action.error);
      break;

    case `REMOVE_NOTIFICATION`:
      this.removeCurrentNotification();
      break;

    case `HIDE_NOTIFICATION`:
      this.hideNotification();
      break;

    }

  }

}

const notificationsStore = new NotificationsStore;
dispatcher.register(notificationsStore.handleActions.bind(notificationsStore));
window.dispatcher = dispatcher;

export default notificationsStore;
