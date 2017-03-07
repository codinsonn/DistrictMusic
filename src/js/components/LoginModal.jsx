import React, {Component, PropTypes} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
//import PlaylistStore from '../stores/PlaylistStore';
import {users} from '../api/';
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
      //this.attachSignin(document.querySelector(`.google-signin`));
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
    console.log(`ID: ${  profile.getId()}`); // Don't send this directly to your server!
    console.log(`Full Name: ${  profile.getName()}`);
    console.log(`Given Name: ${  profile.getGivenName()}`);
    console.log(`Family Name: ${  profile.getFamilyName()}`);
    console.log(`Image URL: ${  profile.getImageUrl()}`);
    console.log(`Email: ${  profile.getEmail()}`);

    // The ID token you need to pass to your backend:
    const idToken = googleUser.getAuthResponse().id_token;
    console.log(`ID Token: ${  idToken}`);

    const postData = {};
    postData.email = profile.getEmail();
    postData.googleToken = idToken;

    // Send email and token to api
    users.authenticateUser(postData)
      .then(res => {

        console.log(`Auth response:`, res);
        this.props.setLoginModal(false);

      }, failData => {

        console.log(`Auth failed:`, failData);
        this.props.setLoginModal(false);

      })
    ;

  }

  render() {

    const {visible} = this.props;

    return (
      <div className={visible}>
        <div className='lightbox' onClick={() => this.props.setLoginModal(false)}>&nbsp;</div>
        <article className='login-modal'>
          <div className='login-modal--logo'>&nbsp;</div>
          <div className='google-signin'>
            <span className='icon'>&nbsp;</span>
            <span className='buttonText'><a href='/auth/user/google'>Sign in with Google+</a></span>
          </div>
          <div className='login-modal--btn-cancel' onClick={() => this.props.setLoginModal(false)}>
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
