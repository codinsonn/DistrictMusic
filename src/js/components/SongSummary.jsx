import React, {Component, PropTypes} from 'react';
import moment from 'moment';
import UserStore from '../stores/UserStore';
import * as UserActions from '../actions/UserActions';

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
      uservote: props.uservote
    };

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

    const {originallyAddedBy, title} = this.state;

    console.log(`Updating time for `, title);

    document.querySelector(`.from-then`).value = moment(originallyAddedBy.added).fromNow();

  }

  upvote() {

    const isLoggedIn = UserStore.getLoggedIn();

    if (isLoggedIn) {
      //code for upvoting
    } else {
      UserActions.showLoginModal();
    }

  }

  downvote() {

    const isLoggedIn = UserStore.getLoggedIn();

    if (isLoggedIn) {
      //code for downvoting
    } else {
      UserActions.showLoginModal();
    }

  }

  render() {

    const {order, title, duration, currentQueueScore, thumbs, lastAddedBy, isVetoed, uservote} = this.state;

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

    return (
      <article className='song-summary'>
        <section className='song-score-wrapper'>
          <span className={upvoteButtonClasses} data-enabled={buttonsEnabled} onClick={() => this.upvote()}>&nbsp;</span>
          <span className={scoreClasses}>{currentQueueScore}</span>
          <span className={downvoteButtonClasses} data-enabled={buttonsEnabled} onClick={() => this.downvote()}>&nbsp;</span>
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
  uservote: PropTypes.object
};

/*
<section className='queue-order-wrapper'>
  <span className='queue-order'>{order}</span>
</section>
*/
