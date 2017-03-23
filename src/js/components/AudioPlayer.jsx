import React, {Component} from 'react';
import Wavesurfer from 'react-wavesurfer';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';

export default class AudioPlayer extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      song: PlaylistStore.getSong(UserStore.getSynched()),
      playing: false,
      pos: 0,
      currentTimeString: `00:00`,
      isSynched: UserStore.getSynched()
    };

    this.waveOptions = {
      height: 40,
      normalize: true,
      scrollParent: true,
      hideScrollBar: true,
      cursorColor: `#ffffff`,
      waveColor: `#c6c6c6`,
      progressColor: `#fecb58`
    };

  }

  componentWillMount() {
    PlaylistStore.on(`SONG_CHANGED`, () => this.updateSong());
    UserStore.on(`SYNCHED_CHANGED`, () => this.updateSynched());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateSong() {

    const {isSynched} = this.state;
    let {song, pos, playing} = this.state;

    song = PlaylistStore.getSong(isSynched);

    if (!isSynched) {
      playing = false;
      pos = 0;
    }

    this.setState({song, pos, playing});

  }

  updateSynched() {

    let {isSynched} = this.state;

    isSynched = UserStore.getSynched();

    this.setState({isSynched});

  }

  handleReadyToPlay() {

    const {playing} = this.state;

    if (!playing) {
      this.togglePlay();
    }

  }

  handlePosChange(e) {

    let {pos, currentTimeString} = this.state;

    pos = e.originalArgs[0];

    const currentMinutes = Math.floor(pos / 60);
    const currentSeconds = Math.round(pos % 60);

    currentTimeString = `0${currentMinutes}:${currentSeconds}`;
    if (currentSeconds < 10) {
      currentTimeString = `0${currentMinutes}:0${currentSeconds}`;
    }

    this.setState({pos, currentTimeString});

  }

  unSynch() {

    const {isSynched} = this.state;

    if (isSynched) {
      this.toggleSynched();
    }

  }

  toggleSynched() {

    const {isSynched} = this.state;

    UserActions.setSynched(!isSynched);

  }

  togglePlay() {

    const {isSynched} = this.state;
    let {playing} = this.state;

    playing = !playing;

    if (isSynched && !playing) {
      this.toggleSynched();
    }

    this.setState({playing});

  }

  renderPlayer() {

    const {song, playing, pos} = this.state;

    if (song.general !== ``) {

      const audioFile = `assets/audio/${song.general.filename}`;

      return (
        <Wavesurfer
          audioFile={audioFile}
          pos={pos}
          onReady={() => this.handleReadyToPlay()}
          onPosChange={e => this.handlePosChange(e)}
          onSeek={() => this.unSynch()}
          playing={playing}
          options={this.waveOptions}
          zoom={10}
        />
      );

    } else {

      console.log(`[AudioPlayer] No render:`, song);

    }

  }

  render() {

    const {song, playing, currentTimeString, isSynched} = this.state;

    let toggleSynchClasses = `btn-toggle-synch unsynched`;
    if (isSynched) {
      toggleSynchClasses = `btn-toggle-synch synched`;
    }

    let togglePlayClasses = `btn-toggle-play play`;
    if (playing) {
      togglePlayClasses = `btn-toggle-play pause`;
    }

    return (
      <article className='audio-player-wrapper'>
        <div className={toggleSynchClasses} onClick={() => this.toggleSynched()}><span>&nbsp;</span></div>
        <div className={togglePlayClasses} onClick={() => this.togglePlay()}><span>&nbsp;</span></div>
        <div className='current-time'><span>{currentTimeString}</span></div>
        <div className='wave-pos-wrapper'>
          {this.renderPlayer()}
        </div>
        <div className='total-duration'><span>{song.general.duration}</span></div>
      </article>
    );

  }

}
