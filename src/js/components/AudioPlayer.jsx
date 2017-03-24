import React, {Component} from 'react';
import Wavesurfer from 'react-wavesurfer';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';
import * as PlaylistActions from '../actions/PlaylistActions';

export default class AudioPlayer extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      song: PlaylistStore.getSong(UserStore.getSynched()),
      playing: false,
      pos: 0,
      currentTimeString: `00:00`,
      isSpeaker: UserStore.getIsSpeaker(),
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

    this.songHasStarted = false;

  }

  componentWillMount() {
    PlaylistStore.on(`SONG_CHANGED`, () => this.updateSong());
    UserStore.on(`SET_AS_SPEAKER`, () => this.updateSpeaker(true));
    UserStore.on(`UNSET_AS_SPEAKER`, () => this.updateSpeaker(false));
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

    this.songHasStarted = false;

    this.setState({song, pos, playing});

  }

  updateSpeaker(blnIsSpeaker) {

    let {isSpeaker, isSynched} = this.state;

    isSpeaker = blnIsSpeaker;
    isSynched = blnIsSpeaker;

    this.setState({isSpeaker, isSynched});

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

    const {playing} = this.state;
    let {pos, currentTimeString} = this.state;

    pos = e.originalArgs[0];

    if (playing) {
      PlaylistActions.setAudioPos(pos);
    }

    const currentMinutes = Math.floor(pos / 60);
    const currentSeconds = Math.round(pos % 60);

    currentTimeString = `0${currentMinutes}:${currentSeconds}`;
    if (currentSeconds < 10) {
      currentTimeString = `0${currentMinutes}:0${currentSeconds}`;
    }

    this.setState({pos, currentTimeString});

  }

  unSynch() {

    const {isSynched, isSpeaker} = this.state;

    if (!isSpeaker && isSynched) {
      this.toggleSynched();
    } else {
      UserActions.setSpeaker(false);
    }

  }

  toggleSynched() {

    const {isSynched, isSpeaker} = this.state;

    if (!isSpeaker) {
      UserActions.setSynched(!isSynched);
    }

  }

  togglePlay() {

    const {isSynched, isSpeaker} = this.state;
    let {playing} = this.state;

    playing = !playing;

    if (isSynched && !playing) {
      this.toggleSynched();
    }

    if (!isSpeaker) {
      this.setState({playing});
    } else if (isSpeaker && playing && !this.songHasStarted) {
      this.setState({playing});
      this.songHasStarted = true;
    }

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
