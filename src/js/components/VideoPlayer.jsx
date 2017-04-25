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
      playing: false,
      player: null
    };

    // -- Loop ------
    this.request = null; // will become requestAnimationFrame
    this.prevSongId = ``;

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

    let {visible, id, song} = this.state;

    visible = PlaylistStore.getVideoMode();
    if (visible) {
      song = PlaylistStore.getSong(false);
      id = song.general.id;
      this.prevSongId = id;
    } else {
      id = ``;
    }

    this.setState({visible, id, song});

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

  updateProgress() {

    const {player, playing} = this.state;
    const $progressBar = document.querySelector(`.video-pos-progress`);

    if (player && playing && $progressBar) {

      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      const progress = currentTime / duration;
      const barWidth = Math.round((window.innerWidth - 260) * progress);

      $progressBar.style.width = `${barWidth}px`;

      this.request = requestAnimationFrame(() => this.updateProgress());

    }

  }

  exitVideoMode() {

    PlaylistActions.setVideoMode(false);

  }

  handleOnPlayVideo() {

    console.log(`[VideoPlayer] Video started playing`);

    let {playing} = this.state;
    playing = true;
    this.request = requestAnimationFrame(() => this.updateProgress());
    this.setState({playing});

  }

  handleOnPauseVideo() {

    console.log(`[VideoPlayer] Video was paused`);

    let {playing} = this.state;
    playing = false;
    this.setState({playing});

  }

  handleOnVideoEnd() {

    console.log(`[VideoPlayer] Song ended, about to play next`);

    let {playing, player, id} = this.state;

    this.prevSongId = id;
    playing = false;
    player = null;
    id = ``;

    this.setState({playing, player, id});
    setTimeout(() => PlaylistActions.startNextSongUnsynched(this.prevSongId), 100);

  }

  renderCurrentSongIndicator() {

    let {song} = this.state;

    song = PlaylistStore.getSong(UserStore.getSynched());

    if (song && song.general.id !== `` && song.queue && song.queue.votes && _.isNumber(song.queue.votes.currentQueueScore)) {

      const voteMode = UserStore.getVoteMode();

      if (song.uservote === undefined) {
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

    let vidWidth = Math.round(window.innerHeight / 2 * 1.64);
    if (window.innerWidth <= 750) {
      vidWidth = Math.round(window.innerWidth * .9) - 20;
    }
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
            onReady={event => this.handleOnVideoReady(event)}
            onPlay={() => this.handleOnPlayVideo()}
            onPause={() => this.handleOnPauseVideo()}
            onEnd={() => this.handleOnVideoEnd()}
          />
        </div>
      );

    }

  }

  render() {

    const {visible, id} = this.state;

    let videoModalClasses = `video-modal hidden`;
    if (visible) {
      videoModalClasses = `video-modal show`;
    }

    if (visible && id !== ``) {

      return (
        <article className={videoModalClasses}>
          <div className='lightbox' onClick={() => this.exitVideoMode()}>&nbsp;</div>
          <section className='video-wrapper'>
            {this.renderPlayer()}
            {this.renderCurrentSongIndicator()}
          </section>
        </article>
      );

    } else {

      return (
        <article className={videoModalClasses}>
          <div className='lightbox' onClick={() => this.exitVideoMode()}>&nbsp;</div>
          <section className='video-wrapper'></section>
        </article>
      );

    }

  }

  handleOnVideoReady(event) {

    let {player} = this.state;

    // access to player in all event handlers via event.target
    player = event.target;
    player.playVideo();

    this.setState({player});

  }

}
