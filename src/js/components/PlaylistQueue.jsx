import React, {Component} from 'react';
import {SongSummary} from '../components';
import PlaylistStore from '../stores/PlaylistStore';
import UserStore from '../stores/UserStore';
//import SocketStore from '../stores/SocketStore';
import * as PlaylistActions from '../actions/PlaylistActions';

export default class PlaylistQueue extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      currentQueue: PlaylistStore.getCurrentQueue(),
      voteMode: UserStore.getVoteMode()
    };

    // -- Non state vars ----
    this.hasFetchedQueue = false;

    // -- Events ----
    this.evtPlaylistActionUpdateQueue = () => PlaylistActions.updateQueue();
    this.evtUpdateQueue = () => this.updateQueue();
    this.evtUpdateVoteMode = () => this.updateVoteMode();

  }

  componentWillMount() {

    // listeners
    //SocketStore.on(`QUEUE_UPDATED`, this.evtPlaylistActionUpdateQueue);
    UserStore.on(`USER_PROFILE_CHANGED`, this.evtPlaylistActionUpdateQueue);
    PlaylistStore.on(`QUEUE_CHANGED`, this.evtUpdateQueue);
    UserStore.on(`VOTE_MODE_CHANGED`, this.evtUpdateVoteMode);

    // fetch queue from api
    PlaylistActions.updateQueue();

  }

  componentWillUnmount() {

    //SocketStore.removeListener(`QUEUE_UPDATED`, this.evtPlaylistActionUpdateQueue);
    UserStore.removeListener(`USER_PROFILE_CHANGED`, this.evtPlaylistActionUpdateQueue);
    PlaylistStore.removeListener(`QUEUE_CHANGED`, this.evtUpdateQueue);
    UserStore.removeListener(`VOTE_MODE_CHANGED`, this.evtUpdateVoteMode);

  }

  componentDidMount() {

  }

  updateQueue() {

    let {currentQueue} = this.state;

    currentQueue = PlaylistStore.getCurrentQueue();

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

        if (!isLoggedIn) {
          song.uservote = {hasVoted: false};
        } else if (!song.uservote) {
          song.uservote = {hasVoted: false};
        }

        const key = `${song.general.id}`;

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
