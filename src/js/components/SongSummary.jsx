import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';
import songs from '../api/songs';

export default class SongSummary extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      order: props.order,
      id: props.general.id,
      title: props.general.title,
      duration: props.general.duration,
      filename: props.general.filename,
      currentQueueScore: props.queue.votes.currentQueueScore,
      legacyScore: props.queue.votes.legacyScore,
      isVetoed: props.queue.isVetoed,
      thumbs: props.thumbs,
      lastAddedBy: props.queue.lastAddedBy,
      originallyAddedBy: props.queue.originallyAddedBy,
      uservote: props.uservote,
      voteMode: props.voteMode
    };

  }

  componentWillReceiveProps(nextProps) {

    if (this.props !== nextProps) {

      let {order, id, title, duration, filename, currentQueueScore, legacyScore, isVetoed, thumbs, lastAddedBy, originallyAddedBy, uservote, voteMode} = this.state;

      order = nextProps.order;
      id = nextProps.general.id;
      title = nextProps.general.title;
      duration = nextProps.general.duration;
      filename = nextProps.general.filename;
      currentQueueScore = nextProps.queue.votes.currentQueueScore;
      legacyScore = nextProps.queue.votes.legacyScore;
      isVetoed = nextProps.queue.isVetoed;
      thumbs = nextProps.thumbs;
      lastAddedBy = nextProps.queue.lastAddedBy;
      originallyAddedBy = nextProps.queue.originallyAddedBy;
      uservote = nextProps.uservote;
      voteMode = nextProps.voteMode;

      this.setState({order, id, title, duration, filename, currentQueueScore, legacyScore, isVetoed, thumbs, lastAddedBy, originallyAddedBy, uservote, voteMode});

    }

  }

  componentWillMount() {

  }

  componentWillUnmount() {

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

    const $target = e.currentTarget;
    const enabled = $target.getAttribute(`data-enabled`);

    if (enabled === `enabled`) {

      const isLoggedIn = UserStore.getLoggedIn();

      if (isLoggedIn) {

        const {id, title} = this.state;
        const voteType = this.getVoteType(type);

        songs.voteSong(id, title, voteType)
          /*.then(res => {

            // success!
            console.log(`SUCCESS!`, res);

          }, failData => {

            // failed to vote
            console.log(`FAILED:`, failData);

          })*/
        ;

      } else {

        UserActions.showLoginModal();

      }

    }

  }

  render() {

    const {order, title, duration, currentQueueScore, thumbs, lastAddedBy, isVetoed, uservote, voteMode} = this.state;

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
        upvotedClass = `super-downvoted `;
        break;

      case `veto_upvote`:
        upvotedClass = `veto-upvoted `;
        break;

      }

    }

    if (order < 3) {
      if (order === 1) tags = `${tags}[PLAYING] `;
      if (order === 2) tags = `${tags}[UP NEXT] `;
      buttonsEnabled = `disabled`;
    }

    const upvoteButtonClasses = `btn-upvote ${upvotedClass}${buttonsEnabled}`;
    const downvoteButtonClasses = `btn-downvote ${downvotedClass}${buttonsEnabled}`;

    let scoreWrapperClasses = `song-score-wrapper`;
    if (buttonsEnabled === `enabled`) {
      scoreWrapperClasses = `song-score-wrapper vote-mode-${voteMode}`;
    }

    return (
      <article className='song-summary'>
        <section className={scoreWrapperClasses}>
          <span className={upvoteButtonClasses} data-enabled={buttonsEnabled} onClick={e => this.vote(e, `upvote`)}>&nbsp;</span>
          <span className={scoreClasses}>{currentQueueScore}</span>
          <span className={downvoteButtonClasses} data-enabled={buttonsEnabled} onClick={e => this.vote(e, `downvote`)}>&nbsp;</span>
        </section>
        <section className='song-thumb' style={thumbStyle}>
          <span className='song-duration'>{duration}</span>
        </section>
        <section className='song-info'>
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
  queue: PropTypes.object,
  thumbs: PropTypes.object,
  uservote: PropTypes.object,
  voteMode: PropTypes.string
};
