import dispatcher from '../dispatcher';

export function addNotification(message) {
  dispatcher.dispatch({
    type: `ADD_NOTIFICATION`,
    notification: message
  });
}

export function addError(message) {
  dispatcher.dispatch({
    type: `ADD_ERROR`,
    error: message
  });
}

export function removeNotification() {
  dispatcher.dispatch({
    type: `REMOVE_NOTIFICATION`
  });
}
