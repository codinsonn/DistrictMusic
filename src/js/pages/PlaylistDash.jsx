import React, {Component, PropTypes} from 'react';
import {Notification, Profile, LoginModal, SearchModal, SuggestionDetail, DownloadProgress, /*NowPlaying, UpNext,*/ PlaylistQueue} from '../components';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';

export default class PlaylistDash extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      isLoggedIn: UserStore.getLoggedIn(),
      userProfile: UserStore.getProfile(),
      showLoginModal: UserStore.getShowLoginModal(),
      showSearchModal: PlaylistStore.getShowSearchModal(),
      showSuggestionDetail: PlaylistStore.getShowSuggestionDetail()
    };

  }

  componentWillMount() {
    UserStore.on(`USER_PROFILE_CHANGED`, () => this.updateUserProfile());
    UserStore.on(`SHOW_LOGIN_MODAL_CHANGED`, () => this.setLoginModal());
    PlaylistStore.on(`SHOW_SEARCH_MODAL_CHANGED`, () => this.setSearchModal());
    PlaylistStore.on(`SHOW_SUGGESTION_DETAIL_CHANGED`, () => this.setSuggestionDetail());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

    if (this.props.loginStatus && this.props.loginStatus === `loginFailed`) {
      NotifActions.addError(`Not a District01 Google+ account`);
    } else {
      UserActions.fetchProfile();
    }

  }

  updateUserProfile() {

    let {isLoggedIn, userProfile} = this.state;

    isLoggedIn = UserStore.getLoggedIn();
    userProfile = UserStore.getProfile();

    this.setState({isLoggedIn, userProfile});

    if (isLoggedIn) {
      if (this.props.loginStatus === `loginSuccess`) {
        NotifActions.addSuccess(`Welcome back, ${userProfile.general.firstName}`);
      }
    } else {
      NotifActions.addNotification(`Till next time!`);
    }

  }

  setLoginModal() {

    const showLoginModal = UserStore.getShowLoginModal();
    this.setState({showLoginModal});

  }

  setSearchModal() {

    const showSearchModal = PlaylistStore.getShowSearchModal();
    this.setState({showSearchModal});

  }

  setSuggestionDetail() {

    const showSuggestionDetail = PlaylistStore.getShowSuggestionDetail();
    this.setState({showSuggestionDetail});

  }

  render() {

    const {showLoginModal, showSearchModal, showSuggestionDetail} = this.state;

    let loginModalVisible = `hidden`;
    if (showLoginModal) { loginModalVisible = `show`; }

    let searchModalVisible = `hidden`;
    if (showSearchModal) { searchModalVisible = `show`; }

    let suggestionDetailVisible = `hidden`;
    if (showSuggestionDetail) { suggestionDetailVisible = `show`; }

    return (
      <div className='dashboard-wrapper'>
        <DownloadProgress />
        <div className='logo'>&nbsp;</div>
        <Profile />
        <LoginModal visible={loginModalVisible} />
        <SearchModal visible={searchModalVisible} />
        <SuggestionDetail visible={suggestionDetailVisible} />
        <PlaylistQueue />
        <Notification />
      </div>
    );

  }

}

PlaylistDash.propTypes = {
  loginStatus: PropTypes.string
};
