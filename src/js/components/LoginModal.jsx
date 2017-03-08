import React, {Component, PropTypes} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
//import PlaylistStore from '../stores/PlaylistStore';
//import {users} from '../api/';
import * as UserActions from '../actions/UserActions';
import gapi from 'googleapi';

export default class LoginModal extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoggedIn: 0
    };

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {

    gapi.load(`auth2`, () => {
      // Retrieve the singleton for the GoogleAuth library and set up the client.
      this.auth2 = gapi.auth2.init({
        client_id: `988274792144-8f4hj5jj2qja2fagh9stkfe5f8dpfbau.apps.googleusercontent.com`,
        cookiepolicy: `single_host_origin`,
        // Request scopes in addition to 'profile' and 'email'
        //scope: 'additional_scope'
      });
      this.attachSignin(document.querySelector(`.google-signin`));
    });

  }

  attachSignin($element) {

    console.log($element.className);
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

    return (
      <div className={visible}>
        <div className='lightbox' onClick={() => UserActions.hideLoginModal()}>&nbsp;</div>
        <article className='login-modal'>
          <div className='login-modal--logo'>&nbsp;</div>
          <div className='google-signin'>
            <span className='icon'>&nbsp;</span>
            <span className='buttonText'>Sign in with Google+</span>
          </div>
          <div className='login-modal--btn-cancel' onClick={() => UserActions.hideLoginModal()}>
            <span className='icon'>&nbsp;</span>
            <span className='buttonText'>Cancel or just listen</span>
          </div>
        </article>
      </div>
    );

  }

}

LoginModal.propTypes = {
  visible: PropTypes.string,
  setLoginModal: PropTypes.func
};

// <span className='buttonText'><a href="/auth/user/google">Sign in with Google+</a></span>
