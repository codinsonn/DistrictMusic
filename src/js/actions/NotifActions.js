import dispatcher from '../dispatcher';

export function gapiClientLoaded() {
  dispatcher.dispatch({
    type: `GAPI_CLIENT_LOADED`
  });
}

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

export function hideNotification() {
  dispatcher.dispatch({
    type: `HIDE_NOTIFICATION`
  });
}

export function setAppearBusy(busy) {
  dispatcher.dispatch({
    type: `SET_APPEAR_BUSY`,
    data: busy
  });
}
