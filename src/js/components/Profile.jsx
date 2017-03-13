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
      showProfileOptions = !showProfileOptions;
      this.setState({showProfileOptions});
    } else {
      console.log(`Must login to continue...`);
      document.querySelector(`.profile`).blur();
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
            <li onClick={() => UserActions.logoutUser()}><span className='btn-logout'>&nbsp;</span></li>
          </ul>
        </div>
      );
    } else {
      return (
        <div className={optionsClasses}>
          <ul>
            <li onClick={() => this.checkProfileActions()}><span className='btn-login'>&nbsp;</span></li>
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
      <article className='profile' tabIndex='0' onBlur={() => this.hideProfileOptions()}>
        <div className='profile-img' style={style} onClick={() => this.checkProfileActions()}>&nbsp;</div>
        { this.renderProfileOptions() }
      </article>
    );

  }

}

/*Profile.propTypes = {

};*/
