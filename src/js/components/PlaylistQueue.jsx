import React, {Component/*, PropTypes*/} from 'react';
import {SongSummary} from '../components';
import PlaylistStore from '../stores/PlaylistStore';
import SocketStore from '../stores/SocketStore';
import * as PlaylistActions from '../actions/PlaylistActions';

export default class PlaylistQueue extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      currentQueue: PlaylistStore.getCurrentQueue()
    };

  }

  componentWillMount() {

    // listeners
    SocketStore.on(`QUEUE_UPDATED`, () => PlaylistActions.updateQueue());
    PlaylistStore.on(`QUEUE_CHANGED`, () => this.updateQueue());

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

    this.setState({currentQueue});

  }

  renderCurrentQueue(currentQueue) {

    if (currentQueue.length > 0) {

      let i = 0;
      return currentQueue.map(song => {
        i ++;
        return <SongSummary {...song} order={i} key={song.general.id} />;
      });

    } else {

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

/*Profile.propTypes = {

};*/
