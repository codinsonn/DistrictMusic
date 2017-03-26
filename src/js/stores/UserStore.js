import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
import SocketStore from './SocketStore';
import PlaylistStore from './PlaylistStore';
import {users} from '../api/';

class UserStore extends EventEmitter {

  constructor() {

    super();

    this.isLoggedIn = false;
    this.showLoginModal = false;

    this.voteMode = `normal`;

    this.isSynched = false;
    this.isSpeaker = false;
    this.waitingForPosChange = false;

    this.userProfile = {};
    this.defaultProfile = {
      general: {
        profileImage: `/assets/img/defaultProfile.png`
      }
    };

  }

  updateSessionSocketId(socketId) {

    users.updateSessionSocketId(socketId)
      .then(res => {

        console.log(`Updated session socketId`, res.meta.socketIds);

        this.isLoggedIn = true;
        this.userProfile = res;

      }, failData => {

        console.log(`-!- Could not update session -!- \n`, failData, `\n-!-`);

      })
    ;

  }

  updateUserProfile(user) {

    this.userProfile = user;

    this.emit(`USER_PROFILE_CHANGED`);

  }

  setProfileSession() {

    users.getSessionProfile()
      .then(res => {

        this.isLoggedIn = true;
        this.userProfile = res;

        const socket = SocketStore.getSocket();
        socket.emit(`SET_SESSION_SOCKET_ID`);

        this.emit(`USER_PROFILE_CHANGED`);

      }, failData => {

        console.log(`-!- Login failed: -!- \n`, failData, `\n-!-`);

      })
    ;

  }

  setSynched(synched) {

    if (synched !== this.isSynched) {

      if (synched) {

        const speakerConnected = PlaylistStore.getSpeakerConnected();

        if (this.isSpeaker) {

          this.confirmSynched();

        } else if (!this.isSpeaker && speakerConnected && !this.waitingForPosChange) {

          PlaylistStore.updateSynchSong();

          this.waitingForPosChange = true;

        } else {

          setTimeout(() => this.emit(`SPEAKER_NOT_CONNECTED`), 10);

        }

      } else {

        this.isSynched = false;
        this.waitingForPosChange = false;
        this.emit(`SYNCHED_CHANGED`);
      }

    }

  }

  confirmSynched() {

    if (this.waitingForPosChange || this.isSpeaker) {
      this.waitingForPosChange = false;
      this.isSynched = true;
      this.emit(`SYNCHED_CHANGED`);
    }

  }

  setSpeaker(isSpeaker) {

    if (isSpeaker !== this.isSpeaker) {

      if (isSpeaker) {

        console.log(`SET AS SPEAKER`);

        this.isSpeaker = isSpeaker;
        this.setSynched(true);

        this.emit(`SET_AS_SPEAKER`);

      } else { // disconnect speaker on server side

        const socket = SocketStore.getSocket();

        users.setSpeaker(false, socket.id)
          .then(res => {

            // Success!
            console.log(`[SPEAKER] UNSET AS SPEAKER`, res);

            this.isSpeaker = false;
            this.emit(`UNSET_AS_SPEAKER`);

          }, failData => {

            // Failed!
            console.log(`[SPEAKER] COULD NOT UNSET AS SPEAKER!`, failData);

          })
        ;

      }

    }

  }

  setVoteMode(voteMode) {

    switch (voteMode) {

    case `veto`:
    case `super`:
      if (voteMode !== this.voteMode) {
        this.voteMode = voteMode;
      } else {
        this.voteMode = `normal`;
      }
      break;

    default:
      this.voteMode = `normal`;
      break;

    }

    this.emit(`VOTE_MODE_CHANGED`);

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

  getVoteMode() {

    return this.voteMode;

  }

  getIsSpeaker() {

    return this.isSpeaker;

  }

  getSynched() {

    return this.isSynched;

  }

  getWaitingForPosChange() {

    return this.waitingForPosChange;

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

    case `SET_VOTE_MODE`:
      this.setVoteMode(action.data);
      break;

    case `SET_SYNCHED`:
      this.setSynched(action.data);
      break;

    case `SET_SPEAKER`:
      this.setSpeaker(action.data);
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
