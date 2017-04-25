import React, {Component} from 'react';
import _ from 'lodash';
import {SongSummary} from '../components';
import YouTube from 'react-youtube';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as PlaylistActions from '../actions/PlaylistActions';

export default class YoutubeVideo extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      visible: PlaylistStore.getVideoMode(),
      song: PlaylistStore.getSong(UserStore.getSynched()),
      playing: false
    };

    // -- Events ----
    this.evtUpdateVisible = () => this.updateVisible();
    this.evtUpdateSong = () => this.updateSong();
    this.evtUpdateUservote = () => this.updateUservote();

  }

  componentWillMount() {
    PlaylistStore.on(`VIDEO_MODE_CHANGED`, this.evtUpdateVisible);
    PlaylistStore.on(`SONG_CHANGED`, this.evtUpdateSong);
    PlaylistStore.on(`QUEUE_CHANGED`, this.evtUpdateUservote);
  }

  componentWillUnmount() {
    PlaylistStore.removeListener(`VIDEO_MODE_CHANGED`, this.evtUpdateVisible);
    PlaylistStore.removeListener(`SONG_CHANGED`, this.evtUpdateSong);
    PlaylistStore.removeListener(`QUEUE_CHANGED`, this.evtUpdateUservote);
  }

  componentDidMount() {

  }

  updateVisible() {

    let {visible, id} = this.state;
    const {song} = this.state;

    visible = PlaylistStore.getVideoMode();
    if (!visible) {
      id = ``;
    } else {
      id = song.general.id;
    }

    this.setState({visible, id});

  }

  updateSong() {

    let {id, song} = this.state;

    song = PlaylistStore.getSong(UserStore.getSynched());
    id = song.general.id;

    this.setState({id, song});

  }

  updateUservote() {

    let {song} = this.state;
    const currentSong = PlaylistStore.getSong(UserStore.getSynched());

    if (song && song.queue) {
      if (
        song.queue.votes.currentQueueScore !== currentSong.queue.votes.currentQueueScore ||
        song.uservote !== currentSong.uservote
      ) {
        song = currentSong;
        this.setState({song});
      }
    }

  }

  exitVideoMode() {

    PlaylistActions.setVideoMode(false);

  }

  renderCurrentSongIndicator() {

    let {song} = this.state;

    song = PlaylistStore.getSong(UserStore.getSynched());

    if (song && song.general.id !== `` && song.queue && song.queue.votes && _.isNumber(song.queue.votes.currentQueueScore)) {

      const isLoggedIn = UserStore.getLoggedIn();
      const voteMode = UserStore.getVoteMode();

      if (!isLoggedIn || song.uservote === undefined) {
        song.uservote = {hasVoted: false};
      }

      const order = 1;
      const key = `fsPreview`;
      const fsPreview = true;

      return (
        <div className='current-song-wrapper'>
          <SongSummary {...song} order={order} key={key} fsPreview={fsPreview} voteMode={voteMode} />
        </div>
      );

    }

  }

  renderPlayer() {

    const {id, visible} = this.state;

    const vidWidth = Math.round(window.innerHeight / 2 * 1.64);
    const vidHeight = Math.round(vidWidth * .6);

    const opts = {
      height: vidHeight,
      width: vidWidth,
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        loop: 1,
        playlist: id
      }
    };

    if (visible && id !== ``) {

      return (
        <div className='player-wrapper'>
          <YouTube
            videoId={id}
            id='yt-player'
            class='yt-player'
            opts={opts}
            onReady={this.handleOnVideoReady}
          />
        </div>
      );

    }

  }

  render() {

    const {visible} = this.state;

    let videoModalClasses = `video-modal hidden`;
    if (visible) {
      videoModalClasses = `video-modal show`;
    }

    return (
        <article className={videoModalClasses}>
          <div className='lightbox' onClick={() => this.exitVideoMode()}>&nbsp;</div>
          <section className='video-wrapper'>
            {this.renderPlayer()}
            {this.renderCurrentSongIndicator()}
          </section>
        </article>
    );

  }

  handleOnVideoReady(event) {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

}
