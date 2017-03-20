import React, {Component/*, PropTypes*/} from 'react';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';

export default class LoginModal extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      visible: UserStore.getShowLoginModal()
    };

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {
    UserStore.on(`SHOW_LOGIN_MODAL_CHANGED`, () => this.setVisible());
  }

  setVisible() {

    let {visible} = this.state;

    visible = UserStore.getShowLoginModal();

    this.setState({visible});

  }

  onSignIn() {

    // -- Redirect user to google callback on auth result --
    const base = `http://localhost:3020`;
    window.location = `${base}/auth/user/google`;

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
            <span className='buttonText'>Cancel or just listen</span>
          </div>
        </section>
      </article>
    );

  }

}

/*LoginModal.propTypes = {
  visible: PropTypes.string
};*/
