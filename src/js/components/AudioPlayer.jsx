import React, {Component} from 'react';
import Wavesurfer from 'react-wavesurfer';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import SocketStore from '../stores/SocketStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';
import * as PlaylistActions from '../actions/PlaylistActions';
import {curveArrayAtRandom} from '../util/';

const BAR_WIDTH = 4;
const MAX_BAR_HEIGHT = window.innerHeight * 0.15;

export default class AudioPlayer extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      song: PlaylistStore.getSong(UserStore.getSynched()),
      playing: false,
      pos: 0,
      currentTimeString: `00:00`,
      isSpeaker: UserStore.getIsSpeaker(),
      isSynched: UserStore.getSynched(),
      playMode: PlaylistStore.getPlayMode()
    };

    this.waveOptionsNormal = {
      height: 32,
      normalize: true,
      cursorColor: `#ffffff`,
      waveColor: `#c6c6c6`,
      progressColor: `#fecb58`,
      backend: `MediaElement`,
      mediaType: `audio`
    };

    this.waveOptionsFullscreen = {
      height: 80,
      normalize: true,
      cursorColor: `#ffffff`,
      waveColor: `#c6c6c6`,
      progressColor: `#fecb58`,
      backend: `MediaElement`,
      mediaType: `audio`
    };

    // -- non state vars ----
    this.prevSongId = ``;
    this.songHasStarted = false;
    this.prevTimeString = `00:00`;
    this.audioContextSet = false;
    this.frequencyBarsDrawn = false;
    this.frequencies = [];

    // -- events ----
    this.evtUpdateSong = () => this.updateSong();
    this.evtCheckSongUpdate = () => this.checkSongUpdate();
    this.evtUpdateSpeaker = () => this.updateSpeaker();
    this.evtUpdateSynched = () => this.updateSynched();
    this.evtSpeakerNotConnected = () => NotifActions.addError(`Speaker not connected`);
    this.evtSpeakerDisconnected = () => NotifActions.addError(`Speaker disconnected`);
    this.evtShowNowPlaying = () => this.showNowPlaying();
    this.evtPausePlay = () => this.pausePlay();
    this.evtUpdatePlayMode = () => this.updatePlayMode();

  }

  componentWillMount() {
    PlaylistStore.on(`SONG_CHANGED`, this.evtUpdateSong);
    PlaylistStore.on(`SPEAKER_SONG_CHANGED`, this.evtCheckSongUpdate);
    UserStore.on(`SET_AS_SPEAKER`, this.evtUpdateSpeaker);
    UserStore.on(`UNSET_AS_SPEAKER`, this.evtUpdateSpeaker);
    UserStore.on(`SYNCHED_CHANGED`, this.evtUpdateSynched);
    UserStore.on(`SPEAKER_NOT_CONNECTED`, this.evtSpeakerNotConnected);
    PlaylistStore.on(`SPEAKER_DISCONNECTED`, this.evtSpeakerDisconnected);
    PlaylistStore.on(`SHOW_SONG_UPDATE`, this.evtShowNowPlaying);
    PlaylistStore.on(`PAUSE_PLAY`, this.evtPausePlay);
    PlaylistStore.on(`PLAY_MODE_CHANGED`, this.evtUpdatePlayMode);
  }

  componentWillUnmount() {
    PlaylistStore.removeListener(`SONG_CHANGED`, this.evtUpdateSong);
    PlaylistStore.removeListener(`SPEAKER_SONG_CHANGED`, this.evtCheckSongUpdate);
    UserStore.removeListener(`SET_AS_SPEAKER`, this.evtUpdateSpeaker);
    UserStore.removeListener(`UNSET_AS_SPEAKER`, this.evtUpdateSpeaker);
    UserStore.removeListener(`SYNCHED_CHANGED`, this.evtUpdateSynched);
    UserStore.removeListener(`SPEAKER_NOT_CONNECTED`, this.evtSpeakerNotConnected);
    PlaylistStore.removeListener(`SPEAKER_DISCONNECTED`, this.evtSpeakerDisconnected);
    PlaylistStore.removeListener(`SHOW_SONG_UPDATE`, this.evtShowNowPlaying);
    PlaylistStore.removeListener(`PAUSE_PLAY`, this.evtPausePlay);
    PlaylistStore.removeListener(`PLAY_MODE_CHANGED`, this.evtUpdatePlayMode);
  }

  checkSongUpdate() {

    const {isSynched} = this.state;
    let {song, pos} = this.state;

    if (isSynched) {
      song = {general: ``};
      pos = 0;
      setTimeout(() => this.updateSong(true), 10);
      this.setState({song, pos});
    }

  }

  updateSong(asSynched = false) {

    const {isSynched} = this.state;
    let {song, pos, playing} = this.state;

    //console.log(`[AudioPlayer] UPDATING SONG`);

    if (asSynched) {
      song = PlaylistStore.getSong(true);
    } else {
      song = PlaylistStore.getSong(isSynched);
    }

    if (!isSynched) {
      playing = false;
      pos = 0;
    }

    this.songHasStarted = false;
    this.audioContextSet = false;
    this.frequencyBarsDrawn = false;

    this.setState({song, pos, playing});

  }

  updateSpeaker() {

    //console.log(`[updateSpeaker]`);

    let {isSpeaker} = this.state;

    isSpeaker = UserStore.getIsSpeaker();

    this.setState({isSpeaker});

  }

  updateSynched() {

    let {isSynched} = this.state;

    isSynched = UserStore.getSynched();

    //console.log(`[updateSynched] synched:`, isSynched);

    if (isSynched) {
      this.synchPosToSpeakerAndPlay();
    }

    this.setState({isSynched});

  }

  updatePlayMode() {

    let {song, playMode} = this.state;

    playMode = PlaylistStore.getPlayMode();
    song = {general: ``};

    // To reset waveOptions
    setTimeout(() => {
      let {song} = this.state;
      song = PlaylistStore.getSong(UserStore.getSynched());
      this.setState({song});
    }, 1);

    this.setState({song, playMode});

  }

  synchPosToSpeakerAndPlay() {

    //console.log(`[synchPosToSpeakerAndPlay]`);

    let {playing, pos} = this.state;

    const speakerPos = PlaylistStore.getSpeakerPos();

    playing = true;
    pos = speakerPos.speakerPos + 0.012 + (((new Date()).getTime() - speakerPos.lastSpeakerPosUpdate) / 1000);
    //pos = speakerPos.speakerPos;

    console.log(`pos`, pos);

    this.setState({playing, pos});

  }

  handleReadyToPlay() {

    //console.log(`[handleReadyToPlay]`);

    const {playing, song} = this.state;

    console.log(`[AudioPlayer:169] Setting up for audio visualisation...`);

    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    this.audio = document.querySelector(`audio`); // might not exist on constructor
    this.audioSrc = this.audioCtx.createMediaElementSource(this.audio);
    this.analyser = this.audioCtx.createAnalyser();
    this.audioSrc.connect(this.analyser);
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.audioSrc.connect(this.audioCtx.destination);
    this.canvas = document.querySelector(`.audio-visualisation`);
    this.canvasCtx = this.canvas.getContext(`2d`);
    this.audioContextSet = true;

    if (playing) { // x2 to trigger waveform play
      this.togglePlay(false);
      this.togglePlay(false);
    } else if (song.general !== ``) {
      this.togglePlay(false);
    }

  }

  pausePlay() {

    //console.log(`pausing play`);

    const {playing} = this.state;

    if (playing) {
      this.togglePlay(true);
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
      setTimeout(() => { PlaylistActions.setAudioPos(pos, sendSocketEvent, (new Date()).getTime()); }, 10);
    }

    // Update bar visualisations
    if (this.audioContextSet) {
      this.analyser.getByteFrequencyData(this.frequencyData);
      window.requestAnimationFrame(() => this.updateAudioVisualisation());
    }

    this.setState({pos, currentTimeString});
    this.prevTimeString = currentTimeString;

  }

  unSynch() {

    const {isSynched, isSpeaker} = this.state;

    if (isSynched) {

      if (!isSpeaker) {
        console.log(`[unSynch] unsynching listener`);
        this.toggleSynched();
      } else {
        console.log(`[unSynch] removing speaker`);
        //UserActions.setSpeaker(false);
      }

    }

  }

  handleSongEnd() {

    if (this.songHasStarted) {

      const {isSynched, isSpeaker} = this.state;
      let {song, pos} = this.state;

      //console.log(`-!- SONG ENDED -!-`, song.general.id, song.general.title);

      this.prevSongId = song.general.id;

      if (isSpeaker) {
        song.socketId = SocketStore.getSocketId();
        PlaylistActions.endSongAndPlayNext(song);
      } else if (!isSynched) {
        //console.log(`PREVSONGID:`, this.prevSongId);
        setTimeout(() => PlaylistActions.startNextSongUnsynched(this.prevSongId), 100);
      }

      this.prevTimeString = `00:00`;
      song = {general: ``};
      pos = 0;
      this.songHasStarted = false;
      this.audioContextSet = false;

      this.setState({song, pos});

    }

  }

  toggleSynched() {

    //console.log(`[toggleSynched]`);

    const {isSpeaker, isSynched} = this.state;
    let {song, pos} = this.state;

    if (!isSpeaker) {
      UserActions.setSynched(!isSynched);
    }

    if (!isSynched && song.general.id !== PlaylistStore.getSong(true).general.id) {
      song = {general: ``};
      pos = 0;
      setTimeout(() => this.updateSong(true), 10);
      this.setState({song, pos});
    }

  }

  togglePlay(clickTriggered = false) {

    //console.log(`[togglePlay]`);

    const {isSynched, isSpeaker} = this.state;
    let {playing} = this.state;

    playing = !playing;

    if (clickTriggered && isSynched && !playing) {
      this.toggleSynched();
    }

    if (!isSpeaker) {
      this.setState({playing});
      this.songHasStarted = true;
    } else if (isSpeaker && !playing && !this.songHasStarted) {
      this.setState({playing});
    } else if (isSpeaker && playing && !this.songHasStarted) {
      this.setState({playing});
      this.songHasStarted = true;
    }

  }

  showNowPlaying() {

    const {song} = this.state;

    if (document.querySelector(`.notification`).className.indexOf(`hide`) > - 1) {
      NotifActions.addNotification(`Now playing: ${song.general.title}`);
    }

  }

  updateAudioVisualisation() {

    const {playMode} = this.state;

    if (this.audioContextSet) {

      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Button Settings
      let maxBars = 3; // for normal mode ( => becomes button to enter fullscreen )
      let horizontalPadding = 0; // no padding in normal mode
      let verticalDivision = 2; // makes bars align vetically centered
      let barScale = 0.6;
      let scaleStep = 0; // will avoid making a curve (since there's only three bars)
      this.canvasCtx.fillStyle = `white`;

      // Fullscreen Settings
      if (playMode === `fullscreen`) {
        maxBars = Math.round(this.canvas.width / BAR_WIDTH / 2); // fill the entire width of screen with bars
        horizontalPadding = BAR_WIDTH / 2; // use some padding in fullscreen mode
        verticalDivision = 1; // makes bars align to bottom
        barScale = 1;
        scaleStep = 0.7 / (maxBars / 2); // make slight curve towards middle of the screen
        this.canvasCtx.fillStyle = `#3C3C3C`;
      }

      let frequencies = this.frequencyData.slice(0, maxBars); // only use as much frequency data as bars needed

      for (let i = 0;i < maxBars;i ++) {

        let index = i;
        if (i < maxBars / 2) {
          barScale -= scaleStep;
        } else if (i >= maxBars / 2) {
          barScale += scaleStep;
          if (playMode === `fullscreen`) {
            index = maxBars - i;
          }
        }

        let minFrequency = Math.min.apply(Math, frequencies);
        let maxFrequency = Math.max.apply(Math, frequencies);
        if (minFrequency === 0) { minFrequency = 1; } else if (playMode === `fullscreen` && maxFrequency < 180) { minFrequency = 0; }
        if (maxFrequency === 0) { maxFrequency = 1; } else if (playMode === `fullscreen` && maxFrequency < 180) { maxFrequency = 255; }
        if (playMode === `normal`) { frequencies = curveArrayAtRandom(frequencies); }
        const frequencyScale = Math.round(frequencies[index] - minFrequency);

        const barWidth = BAR_WIDTH;
        const barHeight = Math.round(frequencyScale / maxFrequency * (barScale * this.canvas.height));
        let xPos = horizontalPadding;if (i !== 0) { xPos = horizontalPadding + Math.round(BAR_WIDTH * (i * 2)); }
        const yPos = Math.round(this.canvas.height - barHeight) / verticalDivision;

        this.canvasCtx.fillRect(xPos, yPos, barWidth, barHeight);

      }

      if (playMode === `fullscreen`) {

        const destCanvas = document.querySelector(`.audio-visualisation-top`);
        const destCtx = destCanvas.getContext(`2d`);

        destCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        destCtx.drawImage(this.canvas, 0, 0);

      }

    }

  }

  renderPlayer() {

    const {song, playing, pos, playMode} = this.state;

    let waveOptions = this.waveOptionsNormal;
    if (playMode === `fullscreen`) {
      waveOptions = this.waveOptionsFullscreen;
    }

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
          options={waveOptions}
        />
      );

    } else {

      console.log(`[AudioPlayer] No render:`, song);

    }

  }

  renderAudioVisualisation() {

    const {playMode} = this.state;

    if (playMode === `normal`) {

      const canvasWidth = 20;
      const canvasHeight = 20;

      return (
        <div className='visualisation' onClick={() => PlaylistActions.setPlayMode(`fullscreen`)}>
          <canvas className='audio-visualisation' width={canvasWidth} height={canvasHeight}>&nbsp;</canvas>
        </div>
      );

    } else {

      const canvasWidth = window.innerWidth;
      const canvasHeight = MAX_BAR_HEIGHT;

      return (
        <div className='visualisation'>
          <canvas className='audio-visualisation' width={canvasWidth} height={canvasHeight}>&nbsp;</canvas>
          <canvas className='audio-visualisation-top' width={canvasWidth} height={canvasHeight}>&nbsp;</canvas>
        </div>
      );

    }

  }

  renderFullscreenButtons() {

    const {playMode} = this.state;

    if (playMode === `fullscreen`) {

      return (
        <div>
          <div className='btn-exit-fullscreen' onClick={() => PlaylistActions.setPlayMode(`normal`)}><span>&nbsp;</span></div>
        </div>
      );

    }

  }

  render() {

    const {song, playing, currentTimeString, isSynched, playMode} = this.state;

    let toggleSynchClasses = `btn-toggle-synch unsynched`;
    if (isSynched) {
      toggleSynchClasses = `btn-toggle-synch synched`;
    }

    let togglePlayClasses = `btn-toggle-play play`;
    if (playing) {
      togglePlayClasses = `btn-toggle-play pause`;
    }

    let audioPlayerClasses = `audio-player-wrapper play-mode-normal`;
    if (playMode === `fullscreen`) {
      audioPlayerClasses = `audio-player-wrapper play-mode-fullscreen`;
    }

    return (
      <article className={audioPlayerClasses}>
        <div className={toggleSynchClasses} onClick={() => this.toggleSynched()}><span>&nbsp;</span></div>
        <div className={togglePlayClasses} onClick={() => this.togglePlay(true)}><span>&nbsp;</span></div>
        <div className='current-time'><span>{currentTimeString}</span></div>
        <div className='wave-pos-wrapper'>
          {this.renderPlayer()}
        </div>
        <div className='total-duration'><span>{song.general.duration}</span></div>
        {this.renderAudioVisualisation()}
        {this.renderFullscreenButtons()}
      </article>
    );

  }

}
