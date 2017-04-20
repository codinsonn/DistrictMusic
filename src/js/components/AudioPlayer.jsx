import React, {Component} from 'react';
import _ from 'lodash';
import transform from 'dom-css-transform';
import Wavesurfer from 'react-wavesurfer';
import {SongSummary} from '../components';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';
import SocketStore from '../stores/SocketStore';
import * as UserActions from '../actions/UserActions';
import * as NotifActions from '../actions/NotifActions';
import * as PlaylistActions from '../actions/PlaylistActions';
import {curveArrayAtRandom} from '../util/';

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
    this.audioContextSupported = true;
    this.frequencyBarsDrawn = false;
    this.frequencies = [];
    this.skipFrames = 2;

    // -- events ----
    this.evtUpdateSong = () => this.updateSong();
    this.evtUpdateUservote = () => this.updateUservote();
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
    PlaylistStore.on(`QUEUE_CHANGED`, this.evtUpdateUservote);
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
    PlaylistStore.removeListener(`QUEUE_CHANGED`, this.evtUpdateUservote);
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

  updateUservote() {

    let {song} = this.state;
    const currentSong = PlaylistStore.getSong(UserStore.getSynched());

    if (song && song.queue) {
      if (
        song.queue.votes.currentQueueScore !== currentSong.queue.votes.currentQueueScore ||
        song.uservote !== currentSong.uservote
      ) {
        song = currentSong;
        this.setState({song});
      }
    }

  }

  updateSong(asSynched = false) {

    const {isSynched} = this.state;
    let {song, pos, playing} = this.state;

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

    let {isSpeaker} = this.state;

    isSpeaker = UserStore.getIsSpeaker();

    this.setState({isSpeaker});

  }

  updateSynched() {

    let {isSynched} = this.state;

    isSynched = UserStore.getSynched();

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

    let {playing, pos} = this.state;

    const speakerPos = PlaylistStore.getSpeakerPos();

    playing = true;
    pos = speakerPos.speakerPos + 0.012 + (((new Date()).getTime() - speakerPos.lastSpeakerPosUpdate) / 1000);

    this.setState({playing, pos});

  }

  handleReadyToPlay() {

    const {playing, song, isSpeaker} = this.state;

    if (this.audioContextSupported && !this.audioCtx) {

      //this.audioCtx = new AudioContext();
      //this.audioCtx = window.AudioContext || window.webkitAudioContext || false;
      this.audioCtx = new AudioContext() || window.webkitAudioContext || false;

      if (!this.audioCtx) {

        this.audioContextSupported = false;
        //NotifActions.addError(`Audio Context not supported by browser`);

      } else if (isSpeaker) {

        setTimeout(() => { PlaylistActions.setPlayMode(`fullscreen`); }, 1);

      }

    }

    if (this.audioContextSupported && this.audioCtx) {
      this.audio = document.querySelector(`audio`); // might not exist on constructor
      this.audioSrc = this.audioCtx.createMediaElementSource(this.audio);
      this.analyser = this.audioCtx.createAnalyser();
      this.audioSrc.connect(this.analyser);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.audioSrc.connect(this.audioCtx.destination);
      this.canvas = document.querySelector(`.audio-visualisation`);
      this.canvasCtx = this.canvas.getContext(`2d`);
      this.audioContextSet = true;
    }

    if (playing) { // x2 to trigger waveform play
      this.togglePlay(false);
      this.togglePlay(false);
    } else if (song.general !== ``) {
      this.togglePlay(false);
    }

  }

  pausePlay() {

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
    if (this.audioContextSupported && this.audioContextSet && this.skipFrames <= 0) { // Base audio visualisation on frequencies
      this.analyser.getByteFrequencyData(this.frequencyData);
      window.requestAnimationFrame(() => this.updateAudioVisualisation());
    } else if (!this.audioContextSupported && this.skipFrames <= 0) { // Fake the audio frequencies for visual effect
      window.requestAnimationFrame(() => this.updateAudioVisualisation());
    } else if (this.skipFrames > 0) { // Skip this frame for now
      this.skipFrames--;
    }

    this.setState({pos, currentTimeString});
    this.prevTimeString = currentTimeString;

  }

  unSynch() {

    const {isSynched, isSpeaker} = this.state;

    if (isSynched) {

      if (!isSpeaker) {
        //console.log(`[unSynch] unsynching listener`);
        this.toggleSynched();
      } else {
        //console.log(`[unSynch] removing speaker`);
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

  updateLogoAudioVisualisation(frequencies, minFrequency, maxFrequency) {

    const sortedFrequencies = frequencies.slice(); // copy array
    sortedFrequencies.sort();
    const medFrequency = sortedFrequencies[frequencies.length / 2];

    let maxFrequencyScale = maxFrequency / 220;if (maxFrequencyScale > 1) { maxFrequencyScale = 1; }
    let medFrequencyScale = medFrequency / 120;if (medFrequencyScale > 1) { medFrequencyScale = 1; }
    let minFrequencyScale = minFrequency / 5;if (minFrequencyScale > 1) { minFrequencyScale = 1; }

    const largeCircleScale = 0.6 + (0.4 * maxFrequencyScale);
    const mediumCircleScale = 0.85 + (0.15 * minFrequencyScale);
    const smallCircleScale = 0.9 + (0.1 * medFrequencyScale);

    transform(document.querySelector(`.audiodisc-large-left`), {scale: [largeCircleScale, largeCircleScale]});
    transform(document.querySelector(`.audiodisc-large-right`), {scale: [largeCircleScale, largeCircleScale]});
    transform(document.querySelector(`.audiodisc-medium-left`), {scale: [mediumCircleScale, mediumCircleScale]});
    transform(document.querySelector(`.audiodisc-medium-right`), {scale: [mediumCircleScale, mediumCircleScale]});
    transform(document.querySelector(`.audiodisc-small-left`), {scale: [smallCircleScale, smallCircleScale]});
    transform(document.querySelector(`.audiodisc-small-right`), {scale: [smallCircleScale, smallCircleScale]});

  }

  updateAudioVisualisation() {

    const {playMode} = this.state;

    if (this.audioContextSet) {

      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // - Button Settings -
      let barWidth = 3; // use smaller bars for button mode
      let maxBars = 3; // for normal mode ( => becomes button to enter fullscreen )
      let horizontalPadding = 0; // no padding in normal mode
      let verticalDivision = 2; // makes bars align vetically centered
      let barScale = 1; // start bar height at 60%
      let scaleStep = 0; // will avoid making a curve (since there's only three bars)
      this.canvasCtx.fillStyle = `white`;
      this.skipFrames = 6; // number of frames to skip in button mode

      // - Fullscreen Settings -
      if (playMode === `fullscreen`) {
        barWidth = 4; // use larger bars for fullscreen mode
        maxBars = Math.round(this.canvas.width / barWidth / 2); // fill the entire width of screen with bars
        horizontalPadding = barWidth / 2; // use some padding in fullscreen mode
        verticalDivision = 1; // makes bars align to bottom
        barScale = 1; // start bar height at 100%
        scaleStep = 0.7 / (maxBars / 2); // make slight curve towards middle of the screen
        this.canvasCtx.fillStyle = `#3C3C3C`; // dark grey
        this.skipFrames = 0; // number of frames to skip in fullscreen mode
      }

      let frequencies = this.frequencyData.slice(0, maxBars); // only use as much frequency data as bars needed

      for (let i = 0;i < maxBars;i ++) { // loop over frequency data

        let index = i;
        if (i < maxBars / 2) {
          barScale -= scaleStep; // downscale bars until reaching the center of the screen
        } else if (i >= maxBars / 2) {
          barScale += scaleStep; // upscale bars again past the center of the screen
          if (playMode === `fullscreen`) {
            index = maxBars - i; // mirror the bars at the center of the screen
          }
        }

        let minFrequency = Math.min.apply(Math, frequencies); // used for bar scaling
        let maxFrequency = Math.max.apply(Math, frequencies); // used for bar scaling
        if (minFrequency === 0) { minFrequency = 1; } else if (playMode === `fullscreen` && maxFrequency < 180) { minFrequency = 0; }
        if (maxFrequency === 0) { maxFrequency = 1; } else if (playMode === `fullscreen` && maxFrequency < 180) { maxFrequency = 255; }
        if (playMode === `normal`) { frequencies = curveArrayAtRandom(frequencies); } // make sure the middle bar is always the highest in button mode
        const frequencyScale = Math.round(frequencies[index] - minFrequency); // main influencer for bar height

        if (playMode === `fullscreen`) { this.updateLogoAudioVisualisation(frequencies, minFrequency, maxFrequency); }

        const barHeight = Math.round(frequencyScale / maxFrequency * (barScale * this.canvas.height));
        let xPos = horizontalPadding;if (i !== 0) { xPos = horizontalPadding + Math.round(barWidth * (i * 2)); }
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

    }

  }

  renderAudioVisualisation() {

    const {playMode} = this.state;

    if (playMode === `normal`) {

      const canvasWidth = 15;
      const canvasHeight = 15;

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

  renderCurrentSongIndicator() {

    let {song} = this.state;

    song = PlaylistStore.getSong(UserStore.getSynched());

    if (song && song.general.id !== `` && song.queue && song.queue.votes && _.isNumber(song.queue.votes.currentQueueScore)) {

      const isLoggedIn = UserStore.getLoggedIn();
      const voteMode = UserStore.getVoteMode();

      if (!isLoggedIn || song.uservote === undefined) {
        song.uservote = {hasVoted: false};
      }

      const order = 1;
      const key = `fsPreview`;
      const fsPreview = true;

      return (
        <div className='current-song-wrapper'>
          <SongSummary {...song} order={order} key={key} fsPreview={fsPreview} voteMode={voteMode} />
        </div>
      );

    }

  }

  renderFullscreenExtras() {

    const {playMode, song} = this.state;

    if (playMode === `fullscreen`) {

      this.prevSongId = song.general.id;

      return (
        <div>
          <div className='district-music-logo'>
            <div className='audiodisc-large-left'>&nbsp;</div>
            <div className='audiodisc-large-right'>&nbsp;</div>
            <div className='audiodisc-medium-left'>&nbsp;</div>
            <div className='audiodisc-medium-right'>&nbsp;</div>
            <div className='audiodisc-small-left'>&nbsp;</div>
            <div className='audiodisc-small-right'>&nbsp;</div>
          </div>
          <div className='btn-play-prev' onClick={() => PlaylistActions.startPrevSongUnsynched(this.prevSongId)}><span>&nbsp;</span></div>
          <div className='btn-exit-fullscreen' onClick={() => PlaylistActions.setPlayMode(`normal`)}><span>&nbsp;</span></div>
          <div className='btn-play-next' onClick={() => PlaylistActions.startNextSongUnsynched(this.prevSongId)}><span>&nbsp;</span></div>
          {this.renderCurrentSongIndicator()}
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
        {this.renderFullscreenExtras()}
      </article>
    );

  }

}
