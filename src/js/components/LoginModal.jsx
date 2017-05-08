import React, {Component} from 'react';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';
import {getBaseURL} from '../util/';

export default class LoginModal extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      visible: UserStore.getShowLoginModal()
    };

    // -- Events ----
    this.evtSetVisible = () => this.setVisible();

  }

  componentWillMount() {
    UserStore.on(`SHOW_LOGIN_MODAL_CHANGED`, this.evtSetVisible);
  }

  componentWillUnmount() {
    UserStore.removeListener(`SHOW_LOGIN_MODAL_CHANGED`, this.evtSetVisible);
  }

  componentDidMount() {

  }

  setVisible() {

    let {visible} = this.state;

    visible = UserStore.getShowLoginModal();

    this.setState({visible});

  }

  onSignIn() {

    // -- Redirect user to google callback on auth result --
    const base = getBaseURL();
    window.location = `${base}auth/user/google`;

  }

  render() {

    const {visible} = this.state;

    let loginModalClasses = `login-modal-wrapper hidden`;
    if (visible) {
      loginModalClasses = `login-modal-wrapper show`;
    }

    if (visible) {
      NotifActions.addNotification(`Please login with District01 account`);
    }

    return (
      <article className={loginModalClasses}>
        <div className='lightbox' onClick={() => UserActions.hideLoginModal()}>&nbsp;</div>
        <section className='login-modal'>
          <div className='login-modal--logo'>&nbsp;</div>
          <div className='google-signin' onClick={() => this.onSignIn()}>
            <span className='icon'>&nbsp;</span>
            <span className='buttonText'><a href='/auth/user/google'>Sign in with Google+</a></span>
          </div>
          <div className='login-modal--btn-cancel' onClick={() => UserActions.hideLoginModal()}>
            <span className='icon'>&nbsp;</span>
            <span className='buttonText'>Cancel sign in</span>
          </div>
        </section>
      </article>
    );

  }

}
