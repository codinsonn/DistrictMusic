import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
import {users} from '../api/';

class UserStore extends EventEmitter {

  constructor() {

    super();

    this.isLoggedIn = false;
    this.userProfile = {};
    this.showLoginModal = false;

  }

  setProfileSession() {

    users.getSessionProfile()
      .then(res => {

        //console.log(`Session user:`, res);

        this.isLoggedIn = true;
        this.userProfile = res;

        this.emit(`USER_PROFILE_FETCHED`);

      }, failData => {

        console.log(`-!- Request failed: -!- \n`, failData, `\n-!-`);

      })
    ;

  }

  setShowLoginModal(visible) {

    let blnShowModal = false;
    if (!this.isLoggedIn) {
      blnShowModal = visible;
    }
    this.showLoginModal = blnShowModal;

    this.emit(`SHOW_LOGIN_MODAL_CHANGED`);

  }

  getLoggedIn() {

    return this.isLoggedIn;

  }

  getProfile() {

    if (this.isLoggedIn) {
      return this.userProfile;
    } else {
      return {error: `User profile unavailable`};
    }

  }

  getShowLoginModal() {

    return this.showLoginModal;

  }

  handleActions(action) {

    switch (action.type) {

    case `FETCH_USER_PROFILE`:
      this.setProfileSession();
      break;

    case `SHOW_LOGIN_MODAL`:
      this.setShowLoginModal(true);
      break;

    case `HIDE_LOGIN_MODAL`:
      this.setShowLoginModal(false);
      break;

    }
  }

}

const userStore = new UserStore;
dispatcher.register(userStore.handleActions.bind(userStore));
window.dispatcher = dispatcher;

export default userStore;
