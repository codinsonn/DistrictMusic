import React, {Component} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
import {LoginModal} from '../components';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';

export default class PlaylistDash extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      userProfile: {},
      showLoginModal: UserStore.getShowLoginModal()
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_FETCHED`, () => this.showUserProfile());
    UserStore.on(`SHOW_LOGIN_MODAL_CHANGED`, () => this.setLoginModal());
  }

  componentWillUnmount() {

  }

  componentDidMount() {
    UserActions.fetchProfile();
  }

  showUserProfile() {

    let {isLoggedIn, userProfile} = this.state;

    isLoggedIn = UserStore.getLoggedIn();

    if (isLoggedIn) {
      userProfile = UserStore.getProfile();
    }

    this.setState({isLoggedIn, userProfile});

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
      <div>
        <LoginModal visible={visible} />
        <button onClick={() => UserActions.showLoginModal()}>Login</button>
      </div>
    );

  }

}
