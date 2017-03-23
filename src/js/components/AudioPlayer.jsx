import React, {Component} from 'react';
import Wavesurfer from 'react-wavesurfer';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';

export default class AudioPlayer extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      currentSong: PlaylistStore.getCurrentSong(),
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
    PlaylistStore.on(`QUEUE_CHANGED`, () => this.checkUpdate());
    UserStore.on(`SYNCHED_CHANGED`, () => this.updateSynched());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  checkUpdate() {

    let {currentSong} = this.state;

    if (PlaylistStore.getCurrentSong() !== currentSong) {

      currentSong = PlaylistStore.getCurrentSong();

      this.setState({currentSong});

      console.log(`[AudioPlayer] Updated current song:`, currentSong);

    } else {

      console.log(`[AudioPlayer] Didn't update current song:`, currentSong);

    }

  }

  updateSynched() {

    let {isSynched} = this.state;

    isSynched = UserStore.getSynched();

    this.setState({isSynched});

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

  toggleSynched() {

    const {isSynched} = this.state;

    UserActions.setSynched(!isSynched);

  }

  togglePlay() {

    let {playing} = this.state;

    playing = !playing;

    this.setState({playing});

  }

  renderPlayer() {

    const {currentSong, playing, pos} = this.state;

    if (currentSong.general !== ``) {

      const audioFile = `assets/audio/${currentSong.general.filename}`;

      return (
        <Wavesurfer
          audioFile={audioFile}
          pos={pos}
          onPosChange={e => this.handlePosChange(e)}
          playing={playing}
          options={this.waveOptions}
          zoom={10}
        />
      );

    } else {

      console.log(`[AudioPlayer] No render:`, currentSong);

    }

  }

  render() {

    const {currentSong, playing, currentTimeString, isSynched} = this.state;

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
        <div className='total-duration'><span>{currentSong.general.duration}</span></div>
      </article>
    );

  }

}
