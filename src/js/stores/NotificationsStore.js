import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';

class NotificationsStore extends EventEmitter {

  constructor() {

    super();

    this.gapiClientLoaded = false;

    this.notifs = [];

  }

  setGapiClientLoaded() {

    this.gapiClientLoaded = true;

    this.emit(`GAPI_CLIENT_READY`);

  }

  addSuccess(message) {

    this.notifs.push({type: `success`, message: message});

    this.emit(`NOTIFICATIONS_CHANGED`);

  }

  addNotification(message) {

    this.notifs.push({type: `info`, message: message});

    this.emit(`NOTIFICATIONS_CHANGED`);

  }

  addError(message) {

    this.notifs.push({type: `error`, message: message});

    this.emit(`NOTIFICATIONS_CHANGED`);

  }

  removeNotification() {

    this.notifs.splice(0, 1);

    this.emit(`NOTIFICATIONS_CHANGED`);

  }

  getNext() {

    if (this.notifs.length >= 1) {
      const notifs = [];
      notifs.push(this.notifs[0]);
      return notifs;
    } else {
      return [];
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
      this.removeNotification();
      break;

    }

  }

}

const notificationsStore = new NotificationsStore;
dispatcher.register(notificationsStore.handleActions.bind(notificationsStore));
window.dispatcher = dispatcher;

export default notificationsStore;
