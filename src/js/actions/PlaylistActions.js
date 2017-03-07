import dispatcher from '../dispatcher';

export function mute() {
  dispatcher.dispatch({
    type: `MUTE`
  });
}
