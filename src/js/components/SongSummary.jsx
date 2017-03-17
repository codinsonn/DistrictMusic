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
      originallyAddedBy: props.queue.originallyAddedBy
    };

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {

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

    const {/*order, */title, duration, currentQueueScore, thumbs, lastAddedBy} = this.state;

    const thumbStyle = {backgroundImage: `url(${thumbs.default.url})`};
    const fromNow = moment(lastAddedBy.added).fromNow();

    return (
      <article className='song-summary'>
        <section className='song-score-wrapper'>
          <span className='btn-upvote' onClick={() => this.upvote()}>&nbsp;</span>
          <span className='queue-score'>{currentQueueScore}</span>
          <span className='btn-downvote' onClick={() => this.downvote()}>&nbsp;</span>
        </section>
        <section className='song-thumb' style={thumbStyle}>
          <span className='song-duration'>{duration}</span>
        </section>
        <section className='song-info'>
          <span className='song-title'>{title}</span>
          <div className='submitter-info'>Submitted <span>{fromNow}</span> by <span>{lastAddedBy.userName}</span></div>
        </section>
      </article>
    );

  }

}

SongSummary.propTypes = {
  order: PropTypes.number,
  general: PropTypes.object,
  queue: PropTypes.object,
  thumbs: PropTypes.object
};

/*
<section className='queue-order-wrapper'>
  <span className='queue-order'>{order}</span>
</section>
*/
