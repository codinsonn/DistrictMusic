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
import * as NotifActions from '../actions/NotifActions';
import songs from '../api/songs';
import gapi from 'googleapi';

export default class SearchModal extends Component {

  constructor(props, context) {

    super(props, context);

    this.inputPaused = false;
    this.inputChanged = false;

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      searchEnabled: false,
      gapiLoaded: false,
      currentSuggestions: []
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
      this.endSearch();
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

  endSearch() {

    this.currentSuggestions = [];
    document.querySelector(`.search-query`).value = ``;
    PlaylistActions.hideSearchModal();

  }

  triggerLoginOrModal() {

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
    let query = $search.value;

    if (isLoggedIn && this.inputPaused && this.inputChanged && query.length >= 4) {

      console.log(`Fetching suggestions for \'${query}\'`);

      // filter out id if youtube url
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = query.match(regExp);
      if (match && match[2].length === 11) {
        query = match[2];
      }

      // send to api to get suggestions
      songs.youtubeSearch(query)
        .then(res => {

          let {currentSuggestions} = this.state;

          currentSuggestions = res;

          this.setState({currentSuggestions});

          console.log(`Suggestions`, currentSuggestions);

        }, failData => {

          console.log(`-!- Search error -!- \n`, failData, `\n-!-`);

          failData.errors.forEach(error => {
            NotifActions.addError(error);
          });

        })
      ;

      this.inputChanged = false;

    }

  }

  onInputChanged() {

    const {isLoggedIn} = this.state;

    if (isLoggedIn) {
      setTimeout(() => { this.inputPaused = true; }, 1000);
      setTimeout(() => { this.search(); }, 1100);
      this.inputPaused = false;
      this.inputChanged = true;
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
        <div className={lightboxClasses} onClick={() => this.endSearch()}>&nbsp;</div>
        <section className='search-bar' onClick={() => this.triggerLoginOrModal()}>
          <input className='search-query' type='text' placeholder={placeholder} disabled
            onInput={() => this.onInputChanged()}
            onFocus={() => this.triggerLoginOrModal()}
            onBlur={() => this.endSearch()}
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
