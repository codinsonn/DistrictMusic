import React, {Component} from 'react';
import Wavesurfer from 'react-wavesurfer';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';
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
    this.prevTimeString = `00:00`;

  }

  componentWillMount() {
    PlaylistStore.on(`SONG_CHANGED`, () => this.updateSong());
    UserStore.on(`SET_AS_SPEAKER`, () => this.updateSpeaker(true));
    UserStore.on(`UNSET_AS_SPEAKER`, () => this.updateSpeaker(false));
    UserStore.on(`SYNCHED_CHANGED`, () => this.updateSynched());
    UserStore.on(`SPEAKER_NOT_CONNECTED`, () => NotifActions.addError(`Speaker not connected`));
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateSong() {

    const {isSynched} = this.state;
    let {song, pos, playing} = this.state;

    console.log(`[AudioPlayer] UPDATING SONG`);

    song = PlaylistStore.getSong(isSynched);

    if (!isSynched) {
      playing = false;
      pos = 0;
    }

    this.songHasStarted = false;

    this.setState({song, pos, playing});

  }

  updateSpeaker(blnIsSpeaker) {

    console.log(`[updateSpeaker]`);

    let {isSpeaker} = this.state;

    isSpeaker = blnIsSpeaker;

    this.setState({isSpeaker});

  }

  updateSynched() {

    let {isSynched} = this.state;

    isSynched = UserStore.getSynched();

    console.log(`[updateSynched] synched:`, isSynched);

    if (isSynched) {
      this.synchPosToSpeakerAndPlay();
    }

    this.setState({isSynched});

  }

  synchPosToSpeakerAndPlay() {

    console.log(`[synchPosToSpeakerAndPlay]`);

    let {playing, pos} = this.state;

    const speakerPos = PlaylistStore.getSpeakerPos();

    playing = true;
    pos = speakerPos.speakerPos + 0.002 + (((new Date()).getTime() - speakerPos.lastSpeakerPosUpdate) / 1000);
    //pos = speakerPos.speakerPos;

    console.log(`pos`, pos);

    this.setState({playing, pos});

  }

  handleReadyToPlay() {

    console.log(`[handleReadyToPlay]`);

    const {isSynched, playing} = this.state;

    console.log(`[AudioPlayer] SPEAKER: synched =`, isSynched, `, playing =`, playing);

    if (playing) {
      this.togglePlay();
      this.togglePlay();
    }

  }

  handlePosChange(e) {

    const {playing, isSpeaker} = this.state;
    let {pos, currentTimeString} = this.state;

    pos = e.originalArgs[0];

    const currentMinutes = Math.floor(pos / 60);
    const currentSeconds = Math.round(pos % 60);

    currentTimeString = `0${currentMinutes}:${currentSeconds}`;
    if (currentSeconds < 10) {
      currentTimeString = `0${currentMinutes}:0${currentSeconds}`;
    }

    let sendSocketEvent = false;
    if (isSpeaker && currentTimeString !== this.prevTimeString) {
      sendSocketEvent = true;
    }

    if (playing) {
      PlaylistActions.setAudioPos(pos, sendSocketEvent, (new Date()).getTime());
    }

    this.setState({pos, currentTimeString});
    this.prevTimeString = currentTimeString;

  }

  unSynch() {

    const {isSynched, isSpeaker} = this.state;

    if (isSynched) {

      if (!isSpeaker) {
        console.log(`[unSynch] unsynching listener`);
        //this.toggleSynched();
      } else {
        console.log(`[unSynch] removing speaker`);
        //UserActions.setSpeaker(false);
      }

    }

  }

  handleSongEnd() {

    const {song, isSynched, isSpeaker} = this.state;

    if (isSynched || isSpeaker) {
      this.songHasStarted = false;
      this.prevTimeString = `00:00`;
    }

    if (isSpeaker) {
      PlaylistActions.endSongAndPlayNext(song);
    }

  }

  toggleSynched() {

    console.log(`[toggleSynched]`);

    const {isSpeaker} = this.state;
    const {isSynched} = this.state;

    if (!isSpeaker) {
      UserActions.setSynched(!isSynched);
    }

  }

  togglePlay() {

    console.log(`[togglePlay]`);

    const {isSynched, isSpeaker} = this.state;
    let {playing} = this.state;

    playing = !playing;

    if (isSynched && !playing) {
      this.toggleSynched();
    }

    if (!isSpeaker) {
      this.setState({playing});
    } else if (isSpeaker && !playing && !this.songHasStarted) {
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
          onFinish={() => this.handleSongEnd()}
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
