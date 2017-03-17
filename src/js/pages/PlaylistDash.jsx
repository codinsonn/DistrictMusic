import React, {Component, PropTypes} from 'react';
import {Notification, Profile, LoginModal, SearchModal, SuggestionDetail, DownloadProgress, /*NowPlaying, UpNext,*/ PlaylistQueue} from '../components';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';

export default class PlaylistDash extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      userProfile: UserStore.getProfile()
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateUserProfile());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

    if (this.props.loginStatus && this.props.loginStatus === `loginFailed`) {
      NotifActions.addError(`Not a District01 Google+ account`);
    } else {
      UserActions.fetchProfile();
    }

  }

  updateUserProfile() {

    let {isLoggedIn, userProfile} = this.state;

    isLoggedIn = UserStore.getLoggedIn();
    userProfile = UserStore.getProfile();

    this.setState({isLoggedIn, userProfile});

    if (isLoggedIn) {
      if (this.props.loginStatus === `loginSuccess`) {
        NotifActions.addSuccess(`Welcome back, ${userProfile.general.firstName}`);
      }
    } else {
      NotifActions.addNotification(`Till next time!`);
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
      </div>
    );

  }

}

PlaylistDash.propTypes = {
  loginStatus: PropTypes.string
};
