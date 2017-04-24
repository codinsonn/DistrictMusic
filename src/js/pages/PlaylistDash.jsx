import React, {Component, PropTypes} from 'react';
import {Notification, Profile, LoginModal, SearchModal, SuggestionDetail, DownloadProgress, PlaylistQueue, AudioPlayer} from '../components';
import UserStore from '../stores/UserStore';
import SocketStore from '../stores/SocketStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';
import users from '../api/users';
import {getBaseURL} from '../util/';

export default class PlaylistDash extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      isSpeaker: false,
      isLoggedIn: UserStore.getLoggedIn(),
      userProfile: UserStore.getProfile()
    };

    // -- Events ----
    this.evtUpdateUserProfile = () => this.updateUserProfile();
    this.evtSetAsSpeaker = () => this.setSpeaker(true);
    this.evtUnsetAsSpeaker = () => this.setSpeaker(false);

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, this.evtUpdateUserProfile);
    UserStore.on(`SET_AS_SPEAKER`, this.evtSetAsSpeaker);
    UserStore.on(`UNSET_AS_SPEAKER`, this.evtUnsetAsSpeaker);
  }

  componentWillUnmount() {
    UserStore.removeListener(`USER_PROFILE_CHANGED`, this.evtUpdateUserProfile);
    UserStore.removeListener(`SET_AS_SPEAKER`, this.evtSetAsSpeaker);
    UserStore.removeListener(`UNSET_AS_SPEAKER`, this.evtUnsetAsSpeaker);
  }

  componentDidMount() {

    if (this.props.status && this.props.status === `isSpeaker`) {

      SocketStore.on(`SET_SOCKET_ID`, () => this.checkSocketAndSpeaker());

    } else if (this.props.status && this.props.status === `loginFailed`) {
      NotifActions.addError(`Not a District01 Google+ account`);
    } else {
      UserActions.fetchProfile();
    }

  }

  setSpeaker(blnIsSpeaker) {

    let {isSpeaker} = this.state;

    isSpeaker = blnIsSpeaker;

    if (!isSpeaker) {
      NotifActions.addError(`Removed as speaker`);
      setTimeout(() => { window.location = getBaseURL(); }, 4000);
    }

    this.setState({isSpeaker});

  }

  updateUserProfile() {

    let {isLoggedIn, userProfile} = this.state;

    isLoggedIn = UserStore.getLoggedIn();
    userProfile = UserStore.getProfile();

    this.setState({isLoggedIn, userProfile});

    if (isLoggedIn) {
      if (this.props.status && this.props.status === `loginSuccess`) {
        NotifActions.addSuccess(`Welcome back, ${userProfile.general.firstName}`);
      }
    } else {
      NotifActions.addNotification(`Till next time!`);
    }

  }

  checkSocketAndSpeaker() {

    const socketId = SocketStore.getSocketId();
    console.log(`--- [PlaylistDash] Socket Id:`, socketId, `---`);

    //if (socketId !== ``) {

    users.setSpeaker(true, socketId)
        .then(res => {

          // Success!
          console.log(`[SPEAKER] SET AS SPEAKER!`, res);
          UserActions.setSpeaker(true);
          NotifActions.addSuccess(`Connected as speaker`);

        }, failData => {

          // Failed!
          console.log(`[SPEAKER] COULD NOT SET AS SPEAKER!`, failData);
          NotifActions.addError(failData.error);

          setTimeout(() => { window.location = getBaseURL(); }, 4000);

        })
      ;

    /*} else {
      setTimeout(() => this.checkSocketAndSpeaker(), 100);
    }*/

  }

  render() {

    const {isSpeaker} = this.state;

    let dashboardClasses = `dashboard-wrapper`;
    if (isSpeaker) {
      dashboardClasses = `dashboard-wrapper is-speaker`;
    }

    return (
      <div className={dashboardClasses}>
        <DownloadProgress />
        <div className='logo'>&nbsp;</div>
        <Profile />
        <LoginModal />
        <SearchModal />
        <SuggestionDetail />
        <PlaylistQueue />
        <Notification />
        <AudioPlayer />
      </div>
    );

  }

}

PlaylistDash.propTypes = {
  status: PropTypes.string
};
