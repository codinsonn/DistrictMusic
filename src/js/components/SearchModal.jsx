import React, {Component, PropTypes} from 'react';
import {Suggestion} from '../components';
import UserStore from '../stores/UserStore';
import NotificationsStore from '../stores/NotificationsStore';
import PlaylistStore from '../stores/PlaylistStore';
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
    this.cancelDelayed = false;

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

    let {currentSuggestions} = this.state;

    currentSuggestions = [];
    //document.querySelector(`.search-query`).value = ``;
    PlaylistActions.hideSearchModal();

    this.setState({currentSuggestions});

  }

  triggerLoginOrModal() {

    const {isLoggedIn} = this.state;
    const showSuggestionDetail = PlaylistStore.getShowSuggestionDetail();

    if (isLoggedIn && !showSuggestionDetail) {
      PlaylistActions.showSearchModal();
      this.onInputChanged(false);
    } else {
      UserActions.showLoginModal();
    }

  }

  search(delayed) {

    const {isLoggedIn} = this.state;

    const $search = document.querySelector(`.search-query`);
    let query = $search.value;

    if (isLoggedIn && this.inputPaused && this.inputChanged) {

      let canSearch = true;
      if (delayed && this.cancelDelayed) {
        canSearch = false;
      }

      if (canSearch) {

        if (query.length >= 4) {

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

              if (currentSuggestions.length === 0) {
                NotifActions.addNotification(`No results were found`);
              }

              this.setState({currentSuggestions});

            }, failData => {

              console.log(`-!- Search error -!- \n`, failData, `\n-!-`);

              if (failData.errors && failData.errors.length > 0) {
                failData.errors.forEach(error => {
                  console.log(`Error Msg:`, error);
                  //NotifActions.addError(error);
                });
              }

            })
          ;

        } else {

          if (query.length >= 1) {

            let {currentSuggestions} = this.state;
            currentSuggestions = [];
            this.setState({currentSuggestions});

            NotifActions.addError(`Please enter more than 3 characters`);

          }

        }

        this.inputChanged = false;

      }

    }

  }

  onInputChanged(delay) {

    const {isLoggedIn} = this.state;

    // hide any lingering notifications
    const notif = NotificationsStore.getNext();
    if (notif) {
      NotifActions.hideNotification();
    }

    this.inputChanged = true;
    if (isLoggedIn && delay) {
      setTimeout(() => { this.inputPaused = true; }, 1400);
      setTimeout(() => { this.search(true); }, 1500);
      this.inputPaused = false;
    } else {
      this.cancelDelayed = true;
      setTimeout(() => { this.cancelDelayed = false; }, 1600);
      this.inputPaused = true;
      this.search(false);
    }

  }

  renderSuggestions() {

    const {currentSuggestions} = this.state;

    if (currentSuggestions.length > 0) {

      return currentSuggestions.map(suggestion => {
        return <Suggestion {...suggestion} key={suggestion.id} />;
      });

    }

  }

  render() {

    const {isLoggedIn, currentSuggestions} = this.state;
    const {visible} = this.props;

    const lightboxClasses = `lightbox ${visible}`;

    let placeholder = `Login to add songs`;
    if (isLoggedIn) {
      placeholder = `Search or paste url`;
    }

    let suggestionsClasses = `suggestions-wrapper hidden`;
    if (visible === `show` && currentSuggestions.length > 0) {
      suggestionsClasses = `suggestions-wrapper show`;
    }

    return (
      <article className='search-modal'>
        <div className={lightboxClasses} onClick={() => this.endSearch()}>&nbsp;</div>
        <section className='search-bar' onClick={() => this.triggerLoginOrModal()}>
          <input className='search-query' type='text' placeholder={placeholder} disabled
            onSubmit={() => this.onInputChanged(false)}
            onInput={() => this.onInputChanged(true)}
            onFocus={() => this.triggerLoginOrModal()}
            //onBlur={() => setTimeout(() => { this.endSearch(); }, 50)}
          />
          <div className={suggestionsClasses}>
            {this.renderSuggestions()}
          </div>
        </section>
      </article>
    );

  }

}

SearchModal.propTypes = {
  visible: PropTypes.string
};
