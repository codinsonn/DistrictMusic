import React, {Component/*, PropTypes*/} from 'react';
import {Suggestion} from '../components';
import UserStore from '../stores/UserStore';
import NotificationsStore from '../stores/NotificationsStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';
import * as PlaylistActions from '../actions/PlaylistActions';
import * as NotifActions from '../actions/NotifActions';
import songs from '../api/songs';

export default class SearchModal extends Component {

  constructor(props, context) {

    super(props, context);

    this.inputPaused = false;
    this.inputChanged = false;
    this.cancelDelayed = false;

    this.state = {
      visible: PlaylistStore.getShowSearchModal(),
      isLoggedIn: UserStore.getLoggedIn(),
      searchEnabled: false,
      currentSuggestions: []
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateLoggedIn());
    PlaylistStore.on(`RESET_SEARCH_BAR`, () => this.resetSearchbar());
    PlaylistStore.on(`SHOW_SEARCH_MODAL_CHANGED`, () => this.setVisible());
  }

  componentWillUnmount() {

  }

  componentDidMount() {
    this.enableSearch();
  }

  setVisible() {

    let {visible} = this.state;

    visible = PlaylistStore.getShowSearchModal();

    this.setState({visible});

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

    this.enableSearch();

  }

  resetSearchbar() {

    let {currentSuggestions} = this.state;

    currentSuggestions = [];

    document.querySelector(`.search-query`).value = ``;

    this.setState({currentSuggestions});

  }

  enableSearch() {

    const {isLoggedIn} = this.state;
    let {searchEnabled} = this.state;

    if (isLoggedIn) {
      searchEnabled = true;
      document.querySelector(`.search-query`).disabled = false;
    }

    this.setState({searchEnabled});

  }

  endSearch() {

    let {currentSuggestions} = this.state;

    currentSuggestions = [];
    //document.querySelector(`.search-query`).value = ``;
    setTimeout(() => PlaylistActions.hideSearchModal(), 10);

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

        if (query.length >= 3) {

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

              NotifActions.setAppearBusy(false);
              if (currentSuggestions.length === 0) {
                NotifActions.addNotification(`No results were found`);
              }

              this.setState({currentSuggestions});

            }, failData => {

              NotifActions.setAppearBusy(false);

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

            NotifActions.addError(`Please enter 3 or more characters`);

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

    if (document.querySelector(`.search-query`).value.length >= 3) {
      NotifActions.setAppearBusy(true);
    }

    this.inputChanged = true;
    if (isLoggedIn && delay) {
      setTimeout(() => { this.inputPaused = true; }, 1200);
      setTimeout(() => { this.search(true); }, 1300);
      this.inputPaused = false;
    } else {
      this.cancelDelayed = true;
      setTimeout(() => { this.cancelDelayed = false; }, 1300);
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

    const {visible, isLoggedIn, currentSuggestions} = this.state;

    let placeholder = `Login to add songs`;
    if (isLoggedIn) {
      placeholder = `Search or paste url`;
    }

    let lightboxClasses = `lightbox hidden`;
    let suggestionsClasses = `suggestions-wrapper hidden`;
    if (visible && currentSuggestions.length > 0) {
      lightboxClasses = `lightbox show`;
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
          />
          <div className={suggestionsClasses}>
            {this.renderSuggestions()}
          </div>
        </section>
      </article>
    );

  }

}
