import React, {Component} from 'react';
import {SongSummary} from '../components';
import PlaylistStore from '../stores/PlaylistStore';
import UserStore from '../stores/UserStore';
import SocketStore from '../stores/SocketStore';
import * as PlaylistActions from '../actions/PlaylistActions';

export default class PlaylistQueue extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      currentQueue: PlaylistStore.getCurrentQueue(),
      voteMode: UserStore.getVoteMode()
    };

    this.hasFetchedQueue = false;

  }

  componentWillMount() {

    // listeners
    SocketStore.on(`QUEUE_UPDATED`, () => PlaylistActions.updateQueue());
    UserStore.on(`USER_PROFILE_CHANGED`, () => PlaylistActions.updateQueue());
    PlaylistStore.on(`QUEUE_CHANGED`, () => this.updateQueue());
    UserStore.on(`VOTE_MODE_CHANGED`, () => this.updateVoteMode());

    // fetch queue from api
    PlaylistActions.updateQueue();

  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateQueue() {

    let {currentQueue} = this.state;

    currentQueue = PlaylistStore.getCurrentQueue();

    console.log(`CURRENTQUEUE:`, currentQueue);

    this.hasFetchedQueue = true;

    this.setState({currentQueue});

  }

  updateVoteMode() {

    let {voteMode} = this.state;

    voteMode = UserStore.getVoteMode();

    this.setState({voteMode});

  }

  renderCurrentQueue(currentQueue) {

    if (currentQueue.length > 0) {

      const {voteMode} = this.state;

      const isLoggedIn = UserStore.getLoggedIn();

      let i = 0;
      return currentQueue.map(song => {
        i ++;
        if (!isLoggedIn) { song.uservote = {hasVoted: false}; }
        const key = `${song.general.id}${i}`;
        return <SongSummary {...song} voteMode={voteMode} order={i} key={key} />;
      });

    } else if (this.hasFetchedQueue) {

      return (
        <div className='no-songs-notif'>No songs currently in queue</div>
      );

    }

  }

  render() {

    const {currentQueue} = this.state;

    return (
      <article className='playlist-queue'>
        <section className='playlist-header'>
          <h2 className='active'>In Queue</h2>
          <h2>Alltime best</h2>
        </section>
        <section className='current-queue'>
          {this.renderCurrentQueue(currentQueue)}
        </section>
      </article>
    );

  }

}
