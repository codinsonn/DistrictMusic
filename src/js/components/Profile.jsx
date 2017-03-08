import React, {Component/*, PropTypes*/} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
//import PlaylistStore from '../stores/PlaylistStore';
//import {users} from '../api/';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';

export default class Profile extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      userProfile: UserStore.getProfile(),
      showProfileOptions: false
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateUserProfile());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  hideProfileOptions() {

    console.log(`Blur`);

    const {isLoggedIn} = this.state;
    let {showProfileOptions} = this.state;

    if (isLoggedIn && showProfileOptions) {
      showProfileOptions = false;
      this.setState({showProfileOptions});
    }

  }

  updateUserProfile() {

    let {isLoggedIn, userProfile} = this.state;

    isLoggedIn = UserStore.getLoggedIn();
    userProfile = UserStore.getProfile();

    this.setState({isLoggedIn, userProfile});

  }

  checkProfileActions() {

    const {isLoggedIn} = this.state;
    let {showProfileOptions} = this.state;

    if (isLoggedIn) {
      console.log(`User is logged in`);
      showProfileOptions = !showProfileOptions;
      this.setState({showProfileOptions});
    } else {
      console.log(`Must login to continue...`);
      UserActions.showLoginModal();
    }

  }

  renderProfileOptions() {

    const {isLoggedIn, showProfileOptions} = this.state;

    let optionsClasses = `profile-options`;
    if (showProfileOptions) {
      optionsClasses = `profile-options show`;
      const $profile = document.querySelector(`.profile`);
      $profile.focus();
    }

    if (isLoggedIn) {
      return (
        <div className={optionsClasses}>
          <ul>
            <li className='btn-logout' onClick={() => UserActions.logoutUser()}>Logout</li>
          </ul>
        </div>
      );
    }

  }

  render() {

    const {userProfile} = this.state;
    const profileImage = userProfile.general.profileImage;
    const style = {backgroundImage: `url(${  profileImage  })`};

    return (
      <section className='profile' tabIndex='0' onBlur={() => this.hideProfileOptions()}>
        <div className='profile-img' style={style} onClick={() => this.checkProfileActions()}>&nbsp;</div>
        { this.renderProfileOptions() }
      </section>
    );

  }

}

/*Profile.propTypes = {

};*/
