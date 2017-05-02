import React, {Component, PropTypes} from 'react';
import _ from 'lodash';
import moment from 'moment';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';
import * as PlaylistActions from '../actions/PlaylistActions';
import songs from '../api/songs';

export default class SongSummary extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      order: props.order,
      id: props.general.id,
      title: props.general.title,
      duration: props.general.duration,
      filename: props.audio.filename,
      currentQueueScore: props.votes.currentQueueScore,
      legacyScore: props.votes.legacyScore,
      isPlaying: props.queue.isPlaying,
      isVetoed: props.queue.isVetoed,
      thumbs: props.thumbs,
      lastAddedBy: props.queue.lastAddedBy,
      originallyAddedBy: props.queue.originallyAddedBy,
      song: props,
      uservote: props.uservote,
      voteMode: props.voteMode,
      playing: false,
      disableButtons: props.disableButtons
    };

    // -- Non State Vars ----
    this.fsPreview = props.fsPreview;

    // -- Events ----
    this.evtCheckIndicatePlaying = () => this.checkIndicatePlaying();
    this.evtUpdateSong = () => this.updateSong();

  }

  componentWillMount() {
    PlaylistStore.on(`SONG_CHANGED`, this.evtCheckIndicatePlaying);
    PlaylistStore.on(`SPEAKER_SONG_CHANGED`, this.evtCheckIndicatePlaying);
    UserStore.on(`SYNCHED_CHANGED`, this.evtCheckIndicatePlaying);
  }

  componentWillUnmount() {
    PlaylistStore.removeListener(`SONG_CHANGED`, this.evtCheckIndicatePlaying);
    PlaylistStore.removeListener(`SPEAKER_SONG_CHANGED`, this.evtCheckIndicatePlaying);
    UserStore.removeListener(`SYNCHED_CHANGED`, this.evtCheckIndicatePlaying);
  }

  componentWillReceiveProps(nextProps) {

    if (this.props !== nextProps) {

      let {order, id, title, duration, filename, currentQueueScore, legacyScore, isPlaying, isVetoed, thumbs, lastAddedBy, originallyAddedBy, song, uservote, voteMode, disableButtons} = this.state;

      order = nextProps.order;
      id = nextProps.general.id;
      title = nextProps.general.title;
      duration = nextProps.general.duration;
      filename = nextProps.audio.filename;
      currentQueueScore = nextProps.votes.currentQueueScore;
      legacyScore = nextProps.votes.legacyScore;
      isPlaying = nextProps.queue.isPlaying;
      isVetoed = nextProps.queue.isVetoed;
      thumbs = nextProps.thumbs;
      lastAddedBy = nextProps.queue.lastAddedBy;
      originallyAddedBy = nextProps.queue.originallyAddedBy;
      song = nextProps;
      uservote = nextProps.uservote;
      voteMode = nextProps.voteMode;
      disableButtons = nextProps.disableButtons;

      this.setState({order, id, title, duration, filename, currentQueueScore, legacyScore, isPlaying, isVetoed, thumbs, lastAddedBy, originallyAddedBy, song, uservote, voteMode, disableButtons});

    }

  }

  componentDidMount() {

    const {originallyAddedBy} = this.state;
    const strMomentFromNow = moment(originallyAddedBy.added).fromNow();

    let intervalTime = 60 * 60 * 1000; // once an hour
    if (strMomentFromNow.indexOf(`seconds`) > - 1) {
      intervalTime = 1000; // once a second
    } else if (strMomentFromNow.indexOf(`minutes`) > - 1) {
      intervalTime = 60 * 1000; // once a minute
    }

    setInterval(() => this.updateTimeFromThen(), intervalTime);

  }

  checkIndicatePlaying() {

    const {id} = this.state;
    let {playing} = this.state;

    const songPlaying = PlaylistStore.getSong(UserStore.getSynched());

    if (id === songPlaying.general.id) {
      playing = true;
    } else {
      playing = false;
    }

    this.setState({playing});

  }

  updateTimeFromThen() {

    const {originallyAddedBy} = this.state;

    document.querySelector(`.from-then`).value = moment(originallyAddedBy.added).fromNow();

  }

  getVoteType(type) {

    const {voteMode} = this.state;

    if (voteMode === `normal`) {
      return type;
    } else {
      return `${voteMode}_${type}`;
    }

  }

  vote(e, type) {

    if (PlaylistStore.getPlayMode() === `fullscreen` && !UserStore.getLoggedIn()) {
      PlaylistActions.setPlayMode(`normal`);
    }

    if (!UserStore.getIsSpeaker()) {

      const $target = e.currentTarget;
      const enabled = $target.getAttribute(`data-enabled`);

      if (enabled === `enabled`) {

        const isLoggedIn = UserStore.getLoggedIn();

        if (isLoggedIn) {

          const {id, title} = this.state;
          const voteType = this.getVoteType(type);

          songs.voteSong(id, title, voteType)
            .then(res => {

              if (res) {
                PlaylistActions.updateQueue();
              }

            }, failData => {

              // failed to vote
              console.log(`FAILED:`, failData);

              if (failData && this.props.voteMode === `veto` || this.props.voteMode === `super`) {
                const message = `${voteType} failed!`;
                NotifActions.addError(message);
              }

            })
          ;

        } else {
          UserActions.showLoginModal();
        }

      }

    } else {
      NotifActions.addError(`Cannot vote as speaker`);
    }

  }

  playSongHandler() {

    if (!UserStore.getIsSpeaker() && !this.fsPreview) {

      const {song} = this.state;

      UserActions.setSynched(false);

      setTimeout(() => PlaylistActions.setSong(song), 10);
      setTimeout(() => PlaylistActions.startPlay(), 500);

    } else {
      NotifActions.addError(`Cannot change song as speaker`);
    }

  }

  playVideoHandler() {

    if (!UserStore.getIsSpeaker() && !this.fsPreview) {

      const {song} = this.state;

      UserActions.setSynched(false);

      setTimeout(() => PlaylistActions.setSong(song), 1);
      setTimeout(() => PlaylistActions.setVideoMode(true), 10);

    }

  }

  shouldComponentUpdate (prevProps, prevState) {
    return !_.isEqual(this.state, prevState);
  }

  renderThumbExtras(duration) {

    if (!this.fsPreview) {
      return (
        <div>
          <div className='play-video-button'>&nbsp;</div>
          <span className='song-duration'>{duration}</span>
        </div>
      );
    }

  }

  render() {

    const {order, title, duration, currentQueueScore, thumbs, lastAddedBy, isPlaying, isVetoed, uservote, voteMode, playing, disableButtons} = this.state;

    const thumbStyle = {backgroundImage: `url(${thumbs.default.url})`};
    const fromNow = moment(lastAddedBy.added).fromNow();

    let buttonsEnabled = `enabled`;
    let upvotedClass = ``;
    let downvotedClass = ``;
    let scoreClasses = `queue-score`;
    let titleClasses = `song-title`;
    let tags = ``;

    if (isVetoed) {
      buttonsEnabled = `disabled`;
      scoreClasses = `queue-score veto`;
      titleClasses = `song-title veto`;
      tags = `[VETO] `;
    }

    if (uservote.hasVoted) {

      switch (uservote.voteType) {

      case `upvote`:
        upvotedClass = `upvoted `;
        break;

      case `downvote`:
        downvotedClass = `downvoted `;
        break;

      case `super_upvote`:
        upvotedClass = `super-upvoted `;
        break;

      case `super_downvote`:
        downvotedClass = `super-downvoted `;
        break;

      case `veto_upvote`:
        upvotedClass = `veto-upvoted `;
        break;

      }

    }

    if (order < 3) {
      if (isPlaying) { tags = `${tags}[PLAYING] `;buttonsEnabled = `disabled`; }
      if (order === 2) tags = `${tags}[UP NEXT] `;
      if (this.fsPreview) tags = ``;
    }

    if (disableButtons || UserStore.getIsSpeaker()) {
      buttonsEnabled = `disabled`;
    }

    const upvoteButtonClasses = `btn-upvote ${upvotedClass}${buttonsEnabled}`;
    const downvoteButtonClasses = `btn-downvote ${downvotedClass}${buttonsEnabled}`;

    let playlistItemClasses = `song-summary`;
    if (playing && !this.fsPreview) {
      playlistItemClasses = `song-summary playing`;
    }

    let scoreWrapperClasses = `song-score-wrapper`;
    if (buttonsEnabled === `enabled`) {
      scoreWrapperClasses = `song-score-wrapper vote-mode-${voteMode}`;
    }

    return (
      <article className={playlistItemClasses}>
        <section className={scoreWrapperClasses}>
          <span className={upvoteButtonClasses} data-enabled={buttonsEnabled} onClick={e => this.vote(e, `upvote`)}>&nbsp;</span>
          <span className={scoreClasses}>{currentQueueScore}</span>
          <span className={downvoteButtonClasses} data-enabled={buttonsEnabled} onClick={e => this.vote(e, `downvote`)}>&nbsp;</span>
        </section>
        <section className='song-thumb' style={thumbStyle} onClick={() => this.playVideoHandler()}>
          {this.renderThumbExtras(duration)}
        </section>
        <section className='song-info' onClick={() => this.playSongHandler()}>
          <span className={titleClasses}>{tags}{title}</span>
          <div className='submitter-info'>Submitted <span className='from-then'>{fromNow}</span> by <span>{lastAddedBy.userName}</span></div>
        </section>
      </article>
    );

  }

}

SongSummary.propTypes = {
  order: PropTypes.number,
  general: PropTypes.object,
  audio: PropTypes.object,
  votes: PropTypes.object,
  queue: PropTypes.object,
  thumbs: PropTypes.object,
  uservote: PropTypes.object,
  voteMode: PropTypes.string,
  fsPreview: PropTypes.bool,
  disableButtons: PropTypes.bool
};
