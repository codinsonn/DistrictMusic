import dispatcher from '../dispatcher';

export function addSuccess(message) {
  dispatcher.dispatch({
    type: `ADD_SUCCESS`,
    notification: message
  });
}

export function addNotification(message) {
  dispatcher.dispatch({
    type: `ADD_INFO`,
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
