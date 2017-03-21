import dispatcher from '../dispatcher';

export function fetchProfile() {
  dispatcher.dispatch({
    type: `FETCH_USER_PROFILE`
  });
}

export function showLoginModal() {
  dispatcher.dispatch({
    type: `SHOW_LOGIN_MODAL`
  });
}

export function hideLoginModal() {
  dispatcher.dispatch({
    type: `HIDE_LOGIN_MODAL`
  });
}

export function setVoteMode(voteMode) {
  dispatcher.dispatch({
    type: `SET_VOTE_MODE`,
    data: voteMode
  });
}

export function logoutUser() {
  dispatcher.dispatch({
    type: `LOGOUT_USER`
  });
}
