import React, {Component, PropTypes} from 'react';
import YouTube from 'react-youtube';
import PlaylistStore from '../stores/PlaylistStore';
import * as PlaylistActions from '../actions/PlaylistActions';
import songs from '../api/songs';

export default class SuggestionDetail extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      id: ``,
      title: ``,
      suggestion: PlaylistStore.getCurrentSuggestion()
    };

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {
    PlaylistStore.on(`SHOW_SUGGESTION_DETAIL_CHANGED`, () => this.setSuggestionDetail());
  }

  setSuggestionDetail() {

    let {id, title, suggestion} = this.state;

    suggestion = PlaylistStore.getCurrentSuggestion();
    id = suggestion.id;
    title = suggestion.title;

    const visible = PlaylistStore.getShowSuggestionDetail();
    if (!visible) {
      setTimeout(() => PlaylistActions.hideSearchModal(), 200);
    }

    this.setState({id, title, suggestion});

  }

  addSongToQueue() {

    const {suggestion} = this.state;

    songs.addToQueue(suggestion)
      .then(res => {

        console.log(`Success!`, res);

      }, failData => {

        console.log(`Failed`, failData);

      })
    ;

  }

  renderPlayer() {

    const {id, title} = this.state;

    let vidWidth = window.innerWidth * .9;
    let vidHeight = vidWidth * .6;
    if (window.innerWidth >= 751) {
      vidHeight = window.innerHeight * .5;
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
          onReady={this.handleOnVideoReady}
        />
      );

    }

  }

  render() {

    const {visible} = this.props;

    const suggestionModalClasses = `suggestion-modal-wrapper ${visible}`;

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
  visible: PropTypes.string,
  id: PropTypes.string,
  suggestion: PropTypes.object
};
