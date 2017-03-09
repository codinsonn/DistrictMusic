import React, {Component, PropTypes} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
//import PlaylistStore from '../stores/PlaylistStore';
//import {users} from '../api/';
import UserStore from '../stores/UserStore';
import NotificationsStore from '../stores/NotificationsStore';
import * as UserActions from '../actions/UserActions';
import * as PlaylistActions from '../actions/PlaylistActions';
import gapi from 'googleapi';

export default class SearchModal extends Component {

  constructor(props, context) {

    super(props, context);

    this.lastInputChange =

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      searchEnabled: false,
      gapiLoaded: false
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateLoggedIn());
    NotificationsStore.on(`GAPI_CLIENT_READY`, () => this.enableSearch());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateLoggedIn() {

    let {isLoggedIn, searchEnabled} = this.state;

    isLoggedIn = UserStore.getLoggedIn();

    if (!isLoggedIn) {
      searchEnabled = false;
      document.querySelector(`.search-query`).disabled = true;
      document.querySelector(`.search-query`).value = ``;
    }

    this.setState({isLoggedIn, searchEnabled});

  }

  enableSearch() {

    const {isLoggedIn} = this.state;
    let {gapiLoaded, searchEnabled} = this.state;

    gapi.client.setApiKey(`AIzaSyAh0pqBXb_-QLX92f3WOCiBffHVyYIaMJU`);
    gapi.client.load(`youtube`, `v3`, () => {

      gapiLoaded = true;

      if (isLoggedIn) {
        searchEnabled = true;
        document.querySelector(`.search-query`).disabled = false;
      }

      this.setState({gapiLoaded, searchEnabled});

    });

  }

  triggerLoginOrSearch() {

    const {isLoggedIn} = this.state;

    if (isLoggedIn) {
      PlaylistActions.showSearchModal();
    } else {
      UserActions.showLoginModal();
    }

  }

  search() {

    const {isLoggedIn} = this.state;

    const $search = document.querySelector(`.search-query`);

    if (isLoggedIn && $search.value.length >= 2) {
      console.log(`Long input`);
    }

  }

  render() {

    const {isLoggedIn} = this.state;
    const {visible} = this.props;

    const lightboxClasses = `lightbox ${visible}`;

    let placeholder = `Login to add songs`;
    if (isLoggedIn) {
      placeholder = `Search or paste url`;
    }

    return (
      <div>
        <div className={lightboxClasses} onClick={() => PlaylistActions.hideSearchModal()}>&nbsp;</div>
        <section className='search-bar' onClick={() => this.triggerLoginOrSearch()}>
          <input className='search-query' type='text' placeholder={placeholder} disabled
            onInput={() => this.search()}
            onFocus={() => this.triggerLoginOrSearch()}
            onBlur={() => PlaylistActions.hideSearchModal()}
          />
        </section>
      </div>
    );

  }

}

SearchModal.propTypes = {
  visible: PropTypes.string
};

// <span className='buttonText'><a href="/auth/user/google">Sign in with Google+</a></span>
