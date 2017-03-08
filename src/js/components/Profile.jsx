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
      userProfile: UserStore.getProfile()
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_FETCHED`, () => this.updateUserProfile());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateUserProfile() {

    let {isLoggedIn, userProfile} = this.state;

    isLoggedIn = UserStore.getLoggedIn();

    if (isLoggedIn) {
      userProfile = UserStore.getProfile();
    }

    this.setState({isLoggedIn, userProfile});

  }

  checkProfileActions() {

    const {isLoggedIn} = this.state;

    if (isLoggedIn) {
      console.log(`User is logged in`);
    } else {
      console.log(`Must login to continue...`);
      UserActions.showLoginModal();
    }

  }

  render() {

    const {userProfile} = this.state;
    const profileImage = userProfile.general.profileImage;
    const style = {backgroundImage: `url(${  profileImage  })`};

    return (
      <div className='profile-wrapper'>
        <section className='profile' style={style} onClick={() => this.checkProfileActions()}>
          &nbsp;
        </section>
      </div>
    );

  }

}

/*Profile.propTypes = {

};*/
