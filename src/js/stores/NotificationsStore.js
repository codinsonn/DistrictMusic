import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';

class NotificationsStore extends EventEmitter {

  constructor() {

    super();

    this.notifs = [];
    this.emptyNotif = {type: ``, message: ``};

    this.setMaxListeners(0);

  }

  emitNotifChange() {

    this.emit(`NOTIFICATIONS_CHANGED`);

  }

  addSuccess(message) {

    this.queueNotification(`success`, message);

  }

  addNotification(message) {

    this.queueNotification(`info`, message);

  }

  addError(message) {

    this.queueNotification(`error`, message);

  }

  queueNotification(type, message) {

    this.removeCurrentNotification(false);

    this.notifs.push({type: type, message: message});

    setTimeout(() => this.emitNotifChange(), 10);

  }

  removeCurrentNotification(emit = true) {

    this.notifs.splice(0, 1); // remove current notification

    if (emit) {
      this.emitNotifChange();
    }

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
