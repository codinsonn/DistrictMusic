import React, {Component, PropTypes} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
import {Notifications, Profile, LoginModal, SearchModal} from '../components';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';

export default class PlaylistDash extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      userProfile: UserStore.getProfile(),
      showLoginModal: UserStore.getShowLoginModal(),
      showSearchModal: PlaylistStore.getShowSearchModal()
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateUserProfile());
    UserStore.on(`SHOW_LOGIN_MODAL_CHANGED`, () => this.setLoginModal());
    PlaylistStore.on(`SHOW_SEARCH_MODAL_CHANGED`, () => this.setSearchModal());
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
      NotifActions.addSuccess(`Welcome back, ${userProfile.general.firstName}`);
    } else {
      NotifActions.addNotification(`Till next time!`);
    }

  }

  setLoginModal() {

    const showLoginModal = UserStore.getShowLoginModal();
    this.setState({showLoginModal});

  }

  setSearchModal() {

    const showSearchModal = PlaylistStore.getShowSearchModal();
    this.setState({showSearchModal});

  }

  render() {

    const {showLoginModal, showSearchModal} = this.state;

    let loginModalVisible = `hidden`;
    if (showLoginModal) { loginModalVisible = `shown`; }

    let searchModalVisible = `hidden`;
    if (showSearchModal) { searchModalVisible = `shown`; }

    return (
      <div className='dashboard-wrapper'>
        <Profile />
        <Notifications />
        <LoginModal visible={loginModalVisible} />
        <SearchModal visible={searchModalVisible} />
      </div>
    );

  }

}

PlaylistDash.propTypes = {
  error: PropTypes.string
};
