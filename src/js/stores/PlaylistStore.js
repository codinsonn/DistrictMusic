import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';
//import {songs} from '../api/';

class PlaylistStore extends EventEmitter {

  constructor() {

    super();

    this.queue = [
      {
        url: `https://youtu.be/E5GD_fb7v3s`,
        currentVotes: 1,
        legacyVotes: 10,
        lastAddedBy: `Thorr Stevens`
      }
    ];

  }

  eventHandler(param) {
    console.log(`EVENT`, param);
  }

  handleActions(action) {

    switch (action.type) {

    case `EVENT`:
      this.eventHandler(action.param);
      break;

    }
  }

}

const playlistStore = new PlaylistStore;
dispatcher.register(playlistStore.handleActions.bind(playlistStore));
window.dispatcher = dispatcher;

export default playlistStore;
