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

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateUserProfile());
    UserStore.on(`SPEAKER_RESET`, () => this.setIsSpeaker(true));
    UserStore.on(`SPEAKER_UNSET`, () => this.setIsSpeaker(false));
  }

  componentWillUnmount() {

  }

  componentDidMount() {

    if (this.props.status && this.props.status === `isSpeaker`) {

      this.checkSocketAndSpeaker();

    } else if (this.props.status && this.props.status === `loginFailed`) {
      NotifActions.addError(`Not a District01 Google+ account`);
    } else {
      UserActions.fetchProfile();
    }

  }

  setIsSpeaker(blnIsSpeaker) {

    let {isSpeaker} = this.state;

    isSpeaker = blnIsSpeaker;

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

    if (socketId !== ``) {

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

    } else {
      setTimeout(() => this.checkSocketAndSpeaker(), 100);
    }

  }

  render() {

    return (
      <div className='dashboard-wrapper'>
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
