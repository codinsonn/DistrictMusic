import React, {Component, PropTypes} from 'react';
import YouTube from 'react-youtube';
import PlaylistStore from '../stores/PlaylistStore';
import * as PlaylistActions from '../actions/PlaylistActions';
import * as NotifActions from '../actions/NotifActions';
import songs from '../api/songs';

export default class SuggestionDetail extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      visible: PlaylistStore.getShowSuggestionDetail(),
      id: ``,
      title: ``,
      suggestion: PlaylistStore.getCurrentSuggestion()
    };

    // -- Events ----
    this.evtSetSuggestionDetail = () => this.setSuggestionDetail();

  }

  componentWillMount() {
    PlaylistStore.on(`SHOW_SUGGESTION_DETAIL_CHANGED`, this.evtSetSuggestionDetail);
  }

  componentWillUnmount() {
    PlaylistStore.removeListener(`SHOW_SUGGESTION_DETAIL_CHANGED`, this.evtSetSuggestionDetail);
  }

  componentDidMount() {

  }

  setSuggestionDetail() {

    let {visible, id, title, suggestion} = this.state;

    suggestion = PlaylistStore.getCurrentSuggestion();
    id = suggestion.id;
    title = suggestion.title;

    visible = PlaylistStore.getShowSuggestionDetail();
    if (!visible) {
      setTimeout(() => PlaylistActions.hideSearchModal(), 10);
    }

    this.setState({visible, id, title, suggestion});

  }

  addSongToQueue() {

    const {suggestion} = this.state;

    NotifActions.addNotification(`Uploading song to queue...`);
    PlaylistActions.hideSuggestionDetail();

    songs.addToQueue(suggestion)
      .then(res => {

        NotifActions.addSuccess(`Submission added to queue!`);

        PlaylistActions.resetSearchbar();

        console.log(`Success!`, res);

      }, failData => {

        NotifActions.addError(failData.errors[0]);

        console.log(`Failed`, failData);

      })
    ;

  }

  renderPlayer() {

    const {id, title} = this.state;

    let vidWidth = window.innerWidth * .9;
    let vidHeight = vidWidth * .6;
    if (window.innerWidth >= 751) {
      vidHeight = window.innerHeight * .4;
      vidWidth = vidHeight  * 1.64;
    }

    const opts = {
      height: vidHeight,
      width: vidWidth,
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        loop: 1,
        playlist: id
      }
    };

    if (id !== `` && title !== ``) {

      return (
        <YouTube
          videoId={id}
          id='yt-player'
          class='yt-player'
          opts={opts}
          onPlay={() => PlaylistActions.pausePlay()}
          onReady={this.handleOnVideoReady}
        />
      );

    }

  }

  render() {

    const {visible} = this.state;

    let suggestionModalClasses = `suggestion-modal-wrapper hidden`;
    if (visible) {
      suggestionModalClasses = `suggestion-modal-wrapper show`;
    }

    return (
      <article className={suggestionModalClasses}>
        <div className='lightbox' onClick={() => PlaylistActions.hideSuggestionDetail()}>&nbsp;</div>
        <section className='suggestion-detail-modal'>
          <div className='confirm-header'><span>Add to queue?</span></div>
          {this.renderPlayer()}
          <div className='confirm-buttons'>
            <button className='btn-cancel' onClick={() => PlaylistActions.hideSuggestionDetail()}>Cancel</button>
            <button className='btn-confirm' onClick={() => this.addSongToQueue()}>Add song</button>
          </div>
        </section>
      </article>
    );

  }

  handleOnVideoReady(event) {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

}

SuggestionDetail.propTypes = {
  id: PropTypes.string,
  suggestion: PropTypes.object
};
