import React, {Component, PropTypes} from 'react';
import NotificationsStore from '../stores/NotificationsStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';
import gapi from 'googleapi';

export default class LoginModal extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoggedIn: 0
    };

  }

  componentWillMount() {
    NotificationsStore.on(`GAPI_CLIENT_READY`, () => this.initOauth());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  initOauth() {

    this.auth2 = gapi.auth2.getAuthInstance();

    this.attachSignin(document.querySelector(`.google-signin`));

  }

  attachSignin($element) {

    this.auth2.attachClickHandler($element, {},
      googleUser => this.onSignIn(googleUser),
      error => {
        console.log(JSON.stringify(error, undefined, 2));
      }
    );

  }

  onSignIn(googleUser) {

    // Useful data for your client-side scripts:
    const profile = googleUser.getBasicProfile();

    // The ID token you need to pass to your backend:
    const idToken = googleUser.getAuthResponse().id_token;

    const postData = {};
    postData.email = profile.getEmail();
    postData.googleToken = idToken;

    // -- Redirect user to google callback on auth result --
    const base = `http://localhost:3020`;
    window.location = `${base}/auth/user/google`;

  }

  render() {

    const {visible} = this.props;

    if (visible === `show`) {
      setTimeout(() => NotifActions.addNotification(`Please login with District01 account`), 10);
    } else {
      setTimeout(() => NotifActions.hideNotification(), 10);
    }

    const loginModalClasses = `login-modal-wrapper ${visible}`;

    return (
      <article className={loginModalClasses}>
        <div className='lightbox' onClick={() => UserActions.hideLoginModal()}>&nbsp;</div>
        <section className='login-modal'>
          <div className='login-modal--logo'>&nbsp;</div>
          <div className='google-signin'>
            <span className='icon'>&nbsp;</span>
            <span className='buttonText'>Sign in with Google+</span>
          </div>
          <div className='login-modal--btn-cancel' onClick={() => UserActions.hideLoginModal()}>
            <span className='icon'>&nbsp;</span>
            <span className='buttonText'>Cancel or just listen</span>
          </div>
        </section>
      </article>
    );

  }

}

LoginModal.propTypes = {
  visible: PropTypes.string
};

// <span className='buttonText'><a href="/auth/user/google">Sign in with Google+</a></span>
