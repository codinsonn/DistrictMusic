import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
import {users} from '../api/';

class UserStore extends EventEmitter {

  constructor() {

    super();

    this.isLoggedIn = false;
    this.showLoginModal = false;

    this.userProfile = {};
    this.defaultProfile = {
      general: {
        profileImage: `/assets/img/defaultProfile.png`
      }
    };

  }

  setProfileSession() {

    users.getSessionProfile()
      .then(res => {

        this.isLoggedIn = true;
        this.userProfile = res;

        this.emit(`USER_PROFILE_CHANGED`);

      }, failData => {

        console.log(`-!- Login failed: -!- \n`, failData, `\n-!-`);

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

  logout() {

    users.logout()
      .then(res => {

        console.log(`Succesfully logged out`, res);

        this.isLoggedIn = false;
        this.userProfile = this.defaultProfile;

        this.emit(`USER_PROFILE_CHANGED`);

      }, failData => {

        console.log(`-!- Logout failed: -!- \n`, failData, `\n-!-`);

      })
    ;

  }

  getLoggedIn() {

    return this.isLoggedIn;

  }

  getProfile() {

    if (this.isLoggedIn) {
      return this.userProfile;
    } else {
      return this.defaultProfile;
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

    case `LOGOUT_USER`:
      this.logout();
      break;

    }
  }

}

const userStore = new UserStore;
dispatcher.register(userStore.handleActions.bind(userStore));
window.dispatcher = dispatcher;

export default userStore;
