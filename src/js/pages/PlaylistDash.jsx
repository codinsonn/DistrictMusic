import React, {Component, PropTypes} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
import {Notifications, Profile, LoginModal} from '../components';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';

export default class PlaylistDash extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      userProfile: UserStore.getProfile(),
      showLoginModal: UserStore.getShowLoginModal()
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateUserProfile());
    UserStore.on(`SHOW_LOGIN_MODAL_CHANGED`, () => this.setLoginModal());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

    if (this.props.error && this.props.error === `failedlogin`) {
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
      NotifActions.addSuccess(`Welcome, ${userProfile.general.firstName}!`);
    } else {
      NotifActions.addNotification(`Logout successfull`);
    }

  }

  setLoginModal() {

    const showLoginModal = UserStore.getShowLoginModal();
    this.setState({showLoginModal});

  }

  render() {

    const {showLoginModal} = this.state;

    let visible = `hidden`;
    if (showLoginModal) {
      visible = `shown`;
    }

    return (
      <div className='dashboard-wrapper'>
        <Profile />
        <Notifications />
        <LoginModal visible={visible} />
      </div>
    );

  }

}

PlaylistDash.propTypes = {
  error: PropTypes.string
};
