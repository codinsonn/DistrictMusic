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
import songs from '../api/songs';
import {randomArray, curveArrayAtRandom} from '../util/';

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
      playMode: PlaylistStore.getPlayMode(),
      videoMode: PlaylistStore.getVideoMode(),
      drawFromImage: false
    };

    this.waveOptionsNormal = {
      height: 32,
      normalize: true,
      cursorColor: `#ffffff`,
      waveColor: `#c6c6c6`,
      progressColor: `#fecb58`,
      backend: `MediaElement`,
      mediaType: `audio`,
      barWidth: 2,
      barHeight: .8,
      pixelRatio: 2
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
    this.frequencies = [];
    this.skipFrames = 2;
    this.changingPlayModes = false;
    this.preChangedPlayModePos = 0;
    this.isActive = true;
    this.playOnSongReady = false;
    this.mouseDown = false;
    this.resetPlayingOnModeChanged = false;
    this.wavesurfer = {};
    this.barsSaved = false;
    this.waveSaved = false;
    this.savingVisualisation = false;

    setTimeout(() => { this.checkWaveform(); }, 100);

    // -- events ----
    this.evtUpdateSong = () => this.updateSong();
    this.evtUpdateUservote = () => this.updateUservote();
    this.evtCheckSongUpdate = () => this.checkSongUpdate();
    this.evtUpdateSpeaker = () => this.updateSpeaker();
    this.evtUpdateSynched = () => this.updateSynched();
    this.evtSpeakerNotConnected = () => NotifActions.addError(`Speaker not connected`);
    this.evtSpeakerDisconnected = () => NotifActions.addError(`Speaker disconnected`);
    this.evtUpdateCurrentTimeString = () => this.updateCurrentTimeString();
    this.evtShowNowPlaying = () => this.showNowPlaying();
    this.evtPausePlay = () => this.pausePlay();
    this.evtStartPlay = () => this.setPlaying(true);
    this.evtUpdatePlayMode = () => this.updatePlayMode();
    this.evtUpdateVideoMode = () => this.updateVideoMode();

    window.onfocus = () => { this.isActive = true; };
    window.onblur = () => { this.isActive = false; };
    window.onmouseup = () => { this.mouseDown = false; };

    // -- workers --
    this.speakerPosWorker = new Worker(`assets/workers/updateSpeakerPosWebworker.js`);
    this.speakerPosWorker.onmessage = e => {
      if (e.data.sendSocketEvent) console.log(e.data.pos, e.data.sendSocketEvent);
      PlaylistActions.setAudioPos(e.data.pos, e.data.sendSocketEvent, (new Date()).getTime());
    };

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
    PlaylistStore.on(`START_PLAY`, this.evtStartPlay);
    PlaylistStore.on(`CURRENT_TIMESTRING_CHANGED`, this.evtUpdateCurrentTimeString);
    PlaylistStore.on(`PLAY_MODE_CHANGED`, this.evtUpdatePlayMode);
    PlaylistStore.on(`VIDEO_MODE_CHANGED`, this.evtUpdateVideoMode);
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
    PlaylistStore.removeListener(`START_PLAY`, this.evtStartPlay);
    PlaylistStore.on(`CURRENT_TIMESTRING_CHANGED`, this.evtUpdateCurrentTimeString);
    PlaylistStore.removeListener(`PLAY_MODE_CHANGED`, this.evtUpdatePlayMode);
    PlaylistStore.removeListener(`VIDEO_MODE_CHANGED`, this.evtUpdateVideoMode);
    PlaylistStore.removeListener(`QUEUE_CHANGED`, this.evtUpdateUservote);
  }

  checkWaveform(waveformReady = false) {

    const {song, playMode, videoMode} = this.state;
    let {drawFromImage} = this.state;

    if (typeof (song.waveform) !== `undefined` && !videoMode) {

      const prevDrawFromImage = drawFromImage;

      this.barsSaved = song.waveform.barsSaved;
      this.waveSaved = song.waveform.waveSaved;

      console.log(`[AudioPlayer] barsSaved:`, this.barsSaved, `| waveSaved:`, this.waveSaved, `| savingVisualisation:`, this.savingVisualisation);

      if (!waveformReady && playMode === `normal` && this.barsSaved) {
        console.log(`[AudioPlayer] Drawing audiobars overlay...`);
        drawFromImage = true;
      } else if (waveformReady && playMode === `normal` && !this.barsSaved && window.innerWidth >= 1200 && !this.savingVisualisation) {
        console.log(`[AudioPlayer] Saving audiobars images...`);
        this.saveAudioVisualisation(`bars`);
        drawFromImage = false;
      } else if (waveformReady && playMode === `normal` && this.barsSaved) {
        console.log(`[AudioPlayer] Removing audiobars overlay...`);
        drawFromImage = false;
      }

      if (!waveformReady && playMode === `fullscreen` && this.waveSaved) {
        console.log(`[AudioPlayer] Drawing audiowave overlay...`);
        drawFromImage = true;
      } else if (waveformReady && playMode === `fullscreen` && !this.waveSaved && window.innerWidth >= 1200 && !this.savingVisualisation) {
        console.log(`[AudioPlayer] Saving audiowave images...`);
        this.saveAudioVisualisation(`wave`);
        drawFromImage = false;
      } else if (waveformReady && playMode === `fullscreen` && this.waveSaved) {
        console.log(`[AudioPlayer] Removing audiowave overlay...`);
        drawFromImage = false;
      }

      if (drawFromImage !== prevDrawFromImage) this.setState({drawFromImage});

    }

  }

  saveAudioVisualisation(type) {

    if (!this.savingVisualisation) {

      const {song} = this.state;

      this.savingVisualisation = true;

      const audiovisuals = document.querySelectorAll(`wave canvas`);
      const visualProgressData = audiovisuals[0].toDataURL(`image/png`);
      const visualImageData = audiovisuals[1].toDataURL(`image/png`);

      songs.saveAudioVisualisation(song.general.id, visualProgressData, visualImageData, type).then(updatedSong => {

        this.savingVisualisation = false;

        song.waveform = updatedSong.waveform;

        this.barsSaved = song.waveform.barsSaved;
        this.waveSaved = song.waveform.waveSaved;

        this.setState({song});

      }, failData => {

        console.log(`[AudioPlayer] -!- Error while saving audio visualisation -!-`, failData);
        this.savingVisualisation = false;

      });

    }

  }

  checkSongUpdate() {

    const {isSynched} = this.state;
    let {song, pos, currentTimeString} = this.state;

    if (isSynched) {
      song = {general: ``};
      pos = 0;
      currentTimeString = `00:00`;
      setTimeout(() => this.updateSong(true), 10);
      this.setState({song, pos, currentTimeString});
    }

  }

  updateUservote() {

    let {song} = this.state;
    const currentSong = PlaylistStore.getSong(UserStore.getSynched());

    if (song && song.votes) {
      if (
        song.votes.currentQueueScore !== currentSong.votes.currentQueueScore ||
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
      playing = true;
      song = PlaylistStore.getSong(true);
    } else {
      song = PlaylistStore.getSong(isSynched);
    }

    if (!isSynched) {
      this.prevTimeString = `00:00`;
      pos = 0;
    }

    this.songHasStarted = false;
    //this.audioContextSet = false;
    this.wavesurfer = {};

    setTimeout(() => { this.checkWaveform(); }, 100);

    this.setPlaying(playing);
    this.setState({song, pos});

  }

  updateSpeaker() {

    let {isSpeaker} = this.state;

    isSpeaker = UserStore.getIsSpeaker();

    if (isSpeaker && this.audioContextSet) {
      this.playOnSongReady = true;
      setTimeout(() => { this.setPlayMode(`fullscreen`); }, 10);
    }

    this.setState({isSpeaker});

  }

  updateSynched() {

    let {isSynched} = this.state;

    isSynched = UserStore.getSynched();

    if (isSynched) this.synchPosToSpeakerAndPlay();

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
      this.checkWaveform();
    }, 1);

    if (this.resetPlayingOnModeChanged) {
      //setTimeout(() => { this.setPlaying(true); }, 1);
      this.setPlaying(true);
      this.resetPlayingOnModeChanged = false;
    }

    this.setState({song, playMode});

  }

  updateVideoMode() {

    let {videoMode} = this.state;

    videoMode = PlaylistStore.getVideoMode();

    if (videoMode) this.setState({currentTimeString: `00:00`});

    this.setState({videoMode});

  }

  updateCurrentTimeString() {

    let {currentTimeString} = this.state;

    currentTimeString = PlaylistStore.getCurrentTimeString();
    if (currentTimeString.indexOf(`NaN`) > - 1) currentTimeString = `00:00`;

    this.setState({currentTimeString});

  }

  synchPosToSpeakerAndPlay() {

    let {pos} = this.state;

    const speakerPos = PlaylistStore.getSpeakerPos();

    this.setPlaying(true); // force play
    pos = speakerPos.speakerPos + 0.012 + (((new Date()).getTime() - speakerPos.lastSpeakerPosUpdate) / 1000);

    this.setState({pos});

  }

  handleWavesurferReady(args) {

    const {playing, song, isSpeaker} = this.state;

    this.wavesurfer = args.wavesurfer;
    this.wavesurfer.on(`waveform-ready`, () => this.checkWaveform(true));

    if (this.audioContextSupported && !this.audioCtx) {

      const constructor = window.AudioContext || window.webkitAudioContext || AudioContext() || false;
      if (constructor) this.audioCtx = new constructor();

      if (!constructor) {
        this.audioContextSupported = false;
        //NotifActions.addError(`Audio Context not supported by browser`);
      } else if (isSpeaker) {
        setTimeout(() => { this.setPlayMode(`fullscreen`); }, 10);
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

    // Start unsynching again
    if (this.changingPlayModes) {
      setTimeout(() => {
        console.log(`[AudioPlayer] Changed Play Mode`);
        this.setState({pos: this.preChangedPlayModePos});
        this.changingPlayModes = false;
      }, 100);
    }

    if (this.playOnSongReady) {
      this.setPlaying(true);
    } else {

      if (playing) { // x2 to trigger waveform play
        this.setPlaying(true);
      } else if (song.general !== ``) {
        this.setPlaying(playing);
      }

    }

  }

  pausePlay() {

    const {playing} = this.state;

    if (playing) {
      this.setPlaying(false);
      UserActions.setSynched(false);
    }

  }

  setPlayMode(playMode) {

    const {playing, pos, videoMode} = this.state;

    this.changingPlayModes = true;
    this.preChangedPlayModePos = pos;

    if (videoMode) {
      this.setPlaying(false);
      this.setState({currentTimeString: `00:00`});
      PlaylistActions.setVideoMode(false);
    }

    if (playing) {
      this.setPlaying(false);
      this.resetPlayingOnModeChanged = true;
    }

    PlaylistActions.setPlayMode(playMode);

  }

  handlePosChange(e) {

    const {playing, isSpeaker} = this.state;
    let {pos, currentTimeString} = this.state;

    pos = e.originalArgs[0];

    const currentMinutes = Math.floor(pos / 60);
    const currentSeconds = Math.round(pos % 60);

    currentTimeString = `0${currentMinutes}:${currentSeconds}`;
    if (currentSeconds < 10) currentTimeString = `0${currentMinutes}:0${currentSeconds}`;

    let sendSocketEvent = false;
    if (isSpeaker && currentTimeString !== this.prevTimeString) sendSocketEvent = true;

    if (playing) this.speakerPosWorker.postMessage({pos: pos, sendSocketEvent: sendSocketEvent});

    let showAnimation = true;
    if (this.isSpeaker && !this.isActive) showAnimation = false;

    if (this.skipFrames > 0) {
      showAnimation = false;
      this.skipFrames--;
    }

    if (showAnimation) { // Update bar visualisations

      if (this.audioContextSupported && this.audioContextSet) { // Base audio visualisation on frequencies
        this.analyser.getByteFrequencyData(this.frequencyData);
        window.requestAnimationFrame(() => this.updateAudioVisualisation());
      } else if (!this.audioContextSupported) { // Fake the audio frequencies for visual effect
        window.requestAnimationFrame(() => this.updateAudioVisualisation(true));
      }

    }

    this.setState({pos, currentTimeString});
    this.prevTimeString = currentTimeString;

  }

  handleSeek() {

    if (!this.mouseDown) {

      const {playing} = this.state;

      this.skipFrames = 6;
      this.setPlaying(playing);
      this.unSynch();

    }

  }

  unSynch() {

    const {isSynched, isSpeaker} = this.state;

    if (isSynched) {

      if (!isSpeaker && !this.changingPlayModes) {
        console.log(`[unSynch] unsynching listener`);
        this.toggleSynched();
      } else if (!this.changingPlayModes) {
        console.log(`[unSynch] removing speaker`);
        UserActions.setSpeaker(false);
      }

    }

  }

  handleSongEnd() {

    if (this.songHasStarted) {

      let {song, pos, currentTimeString} = this.state;

      const curMinutes = Math.floor(pos / 60);
      const curSeconds = Math.round(pos % 60);
      const curSecondsTotal = (curMinutes * 60) + curSeconds;
      console.log(`[AudioPlayer] curMin:`, curMinutes, `| curSec:`, curSeconds, `| curTot:`, curSecondsTotal);

      const durMinutes = Number(song.general.duration.slice(1, 2));
      const durSeconds = Number(song.general.duration.slice(3, 5));
      const durSecondsTotal = (durMinutes * 60) + durSeconds;
      console.log(`[AudioPlayer] durMin:`, durMinutes, `| durSec:`, durSeconds, `| durTot:`, durSecondsTotal);

      let prematureSongEnd = false;
      if (durSecondsTotal - curSecondsTotal >= 2) prematureSongEnd = true;

      if (!prematureSongEnd) {

        const {isSynched, isSpeaker} = this.state;

        console.log(`-i- SONG ENDED -i-`, song.general.id, song.general.title);

        this.prevSongId = song.general.id;

        if (isSpeaker) {
          song.socketId = SocketStore.getSocketId();
          PlaylistActions.endSongAndPlayNext(song);
        } else if (!isSynched) {
          setTimeout(() => PlaylistActions.startNextSongUnsynched(this.prevSongId), 100);
        }

        this.prevTimeString = `00:00`;
        currentTimeString = `00:00`;
        song = {general: ``};
        pos = 0;
        this.songHasStarted = false;
        this.audioContextSet = false;

        this.setState({song, pos, currentTimeString});

      } else {

        console.log(`[AudioPlayer] -!- Song ended prematurely -!-`);

      }

    }

  }

  handleVideoSeek(evt, updateVideoPos = true) {

    const barPosClicked = evt.clientX - 130;
    const seekPercentage = barPosClicked / (window.innerWidth - 260);

    document.querySelector(`.video-pos-progress`).style.width = `${barPosClicked}px`;
    document.querySelector(`.video-pos-scrubber`).style.left = `${barPosClicked}px`;

    if (updateVideoPos) {
      //this.setPlaying(false);
      PlaylistActions.seekVideoTo(seekPercentage);
      this.mouseDown = false;
    }

  }

  handleScrub(evt) {

    if (this.mouseDown) this.handleVideoSeek(evt, false);

  }

  avoidAudioSeekError() {

    const {playing} = this.state;

    if (playing) {
      this.setPlaying(false);
      setTimeout(() => { this.setPlaying(true); }, 1);
      this.skipFrames = 60;
    }

  }

  toggleSynched() {

    const {isSpeaker, isSynched, videoMode} = this.state;
    let {song, pos, currentTimeString} = this.state;

    if (!isSpeaker) {

      console.log(`[AudioPlayer:361] Attempting to synch... (toggleSynched)`);
      UserActions.setSynched(!isSynched);

      if (videoMode) {
        this.setPlaying(false);
        this.setState({currentTimeString: `00:00`});
        PlaylistActions.setVideoMode(false);
      }

    }

    if (
      !isSynched &&
      PlaylistStore.getSpeakerConnected() &&
      song.general.id !== PlaylistStore.getSong(true).general.id
    ) {
      song = {general: ``};
      pos = 0;
      currentTimeString = `00:00`;
      setTimeout(() => this.updateSong(true), 10);
      this.setState({song, pos, currentTimeString});
    }

  }

  setPlaying(playOrNot) {

    let {playing} = this.state;

    playing = playOrNot;

    if (playing && !this.songHasStarted) this.songHasStarted = true;

    this.setState({playing});

  }

  togglePlay() {

    const {playing, isSynched, isSpeaker, videoMode} = this.state;

    if (!isSpeaker) {

      if (isSynched) this.toggleSynched();

      const aboutToPlay = !playing;

      if (videoMode && aboutToPlay) PlaylistActions.startPlay();
      if (videoMode && !aboutToPlay) PlaylistActions.pausePlay();

      this.setPlaying(aboutToPlay);

    }

  }

  toggleVideoMode() {

    const {videoMode, isSynched, isSpeaker, song} = this.state;

    if (!isSpeaker) {

      if (isSynched) this.toggleSynched();

      this.setPlaying(false);

      let {currentTimeString} = this.state;
      currentTimeString = `00:00`;
      this.setState({currentTimeString});

      //PlaylistActions.setVideoMode(!videoMode);
      if (!videoMode) setTimeout(() => PlaylistActions.setSong(song), 1);
      setTimeout(() => PlaylistActions.setVideoMode(!videoMode), 10);

    }

  }

  showNowPlaying() {

    const {song, playMode, videoMode} = this.state;

    const notifAlreadyShowing = document.querySelector(`.notification`).className.indexOf(`show`) > - 1;
    console.log(`[AudioPlayer] Notif showing?`, notifAlreadyShowing);

    if (playMode === `normal` && !notifAlreadyShowing && !videoMode) {
      NotifActions.addNotification(`Now playing: ${song.general.title}`);
    }

  }

  updateLogoAudioVisualisation(frequencies, minFrequency, maxFrequency) {

    const sortedFrequencies = frequencies.slice(); // copy array
    sortedFrequencies.sort();
    const medFrequency = sortedFrequencies[frequencies.length / 2];

    let maxFrequencyScale = maxFrequency / 225;
    let medFrequencyScale = medFrequency / 140;if (medFrequencyScale > 1.6) { medFrequencyScale = 1.3; }
    //let minFrequencyScale = minFrequency / 8;if (minFrequencyScale > 1.5) { minFrequencyScale = 1.3; }

    if (maxFrequency > 250) maxFrequencyScale = medFrequency / 150;
    if (maxFrequencyScale < 0.6) maxFrequencyScale = 1;
    if (maxFrequencyScale > 1.4) maxFrequencyScale = 1.3;

    const largeCircleScale = 0.7 + (0.3 * maxFrequencyScale);
    //const mediumCircleScale = 0.9 + (0.1 * minFrequencyScale);

    transform(document.querySelector(`.audiodisc-large-left`), {scale: [largeCircleScale, largeCircleScale]});
    transform(document.querySelector(`.audiodisc-large-right`), {scale: [largeCircleScale, largeCircleScale]});
    //transform(document.querySelector(`.audiodisc-medium-left`), {scale: [mediumCircleScale, mediumCircleScale]});
    //transform(document.querySelector(`.audiodisc-medium-right`), {scale: [mediumCircleScale, mediumCircleScale]});

  }

  updateAudioVisualisation(fakeFrequencies = false) {

    const {playMode} = this.state;

    if (this.audioContextSet || fakeFrequencies) {

      this.canvasCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // - Button Settings -
      let barWidth = 3; // use smaller bars for button mode
      let maxBars = 3; // for normal mode ( => becomes button to enter fullscreen )
      let horizontalPadding = 0; // no padding in normal mode
      let verticalDivision = 2; // makes bars align vetically centered
      let barScale = 1; // start bar height at 60%
      let scaleStep = 0; // will avoid making a curve (since there's only three bars)
      this.canvasCtx.fillStyle = `white`;
      this.skipFrames = 8; // number of frames to skip in button mode

      // - Fullscreen Settings -
      if (playMode === `fullscreen`) {
        barWidth = 5; // use larger bars for fullscreen mode
        maxBars = Math.round(this.canvas.width / barWidth / 2); // fill the entire width of screen with bars
        horizontalPadding = Math.round(barWidth / 2); // use some padding in fullscreen mode
        verticalDivision = 1; // makes bars align to bottom
        barScale = 1; // start bar height at 100%
        scaleStep = 0.7 / (maxBars / 2); // make slight curve towards middle of the screen
        this.canvasCtx.fillStyle = `#3C3C3C`; // dark grey
        this.skipFrames = 0; // number of frames to skip in fullscreen mode
      }

      let frequencies = []; // fake frequency data for non supported browsers
      if (this.audioContextSupported && this.audioContextSet) {
        frequencies = this.frequencyData.slice(0, maxBars); // only use as much frequency data as bars needed
        if (playMode === `normal` && Math.max.apply(Math, this.frequencyData) < 60) { frequencies = [60, 170, 90]; } // use standard values for button
      } else {
        frequencies = randomArray(maxBars, 0, 255);
      }

      for (let i = 0;i < maxBars;i ++) { // loop over frequency data

        let index = i;
        if (i < maxBars / 2) {
          barScale -= scaleStep; // downscale bars until reaching the center of the screen
        } else if (i >= maxBars / 2) {
          barScale += scaleStep; // upscale bars again past the center of the screen
          if (playMode === `fullscreen`) index = maxBars - i; // mirror the bars at the center of the screen
        }

        let minFrequency = Math.min.apply(Math, frequencies); // used for bar scaling
        let maxFrequency = Math.max.apply(Math, frequencies); // used for bar scaling
        if (playMode === `normal` && minFrequency === 0) { minFrequency = 1; } else if (playMode === `fullscreen` && maxFrequency < 180) { minFrequency = 0; }
        if (playMode === `normal` && maxFrequency === 0) { maxFrequency = 1; } else if (playMode === `fullscreen` && maxFrequency < 180) { maxFrequency = 255; }
        if (playMode === `normal`) { frequencies = curveArrayAtRandom(frequencies); /*console.log(`FIXED?`, frequencies[0], frequencies[1], frequencies[2], `(`, maxFrequency, `)`);*/ } //else { console.log(`FREQS?`, frequencies[0], frequencies[1], frequencies[2], `(`, maxFrequency, `)`); } // make sure the middle bar is always the highest in button mode
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

    const {song, playing, pos, playMode, videoMode} = this.state;

    let waveOptions = this.waveOptionsNormal;
    if (playMode === `fullscreen`) waveOptions = this.waveOptionsFullscreen;

    if (song.general !== `` && !videoMode) { // render waveform progress bar

      const audioFile = `stream/audio/${song.audio.filename}`;

      return (
        <Wavesurfer
          audioFile={audioFile}
          pos={pos}
          onReady={args => this.handleWavesurferReady(args)}
          onPosChange={e => this.handlePosChange(e)}
          onSeek={() => this.handleSeek()}
          onFinish={() => this.handleSongEnd()}
          playing={playing}
          options={waveOptions}
        />
      );

    } else if (videoMode) { // render normal progress bar

      return (
        <div className='video-pos-wrapper'
          onMouseDown={() => { this.mouseDown = true; }}
          onMouseMove={evt => this.handleScrub(evt)}
          onMouseUp={evt => this.handleVideoSeek(evt)}
        >
          <div className='video-pos-progress'>&nbsp;</div>
          <div className='video-pos-scrubber'>&nbsp;</div>
        </div>
      );

    }

  }

  renderVideoModeButton() {

    const {playMode, videoMode} = this.state;

    if (playMode === `normal`) {

      let toggleVideoClasses = `btn-video-mode off`;
      if (videoMode) toggleVideoClasses = `btn-video-mode on`;

      return (
        <div className={toggleVideoClasses} onClick={() => this.toggleVideoMode()}><span>&nbsp;</span></div>
      );

    }

  }

  renderAudioVisualisation() {

    const {playMode, playing, videoMode} = this.state;

    if (playMode === `normal`) {

      const canvasWidth = 15;
      const canvasHeight = 15;

      if (!playing) setTimeout(() => { this.updateAudioVisualisation(); }, 10);

      return (
        <div className='visualisation' onClick={() => this.setPlayMode(`fullscreen`)}>
          <canvas className='audio-visualisation' width={canvasWidth} height={canvasHeight}>&nbsp;</canvas>
        </div>
      );

    } else if (playMode === `fullscreen` && !videoMode) {

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

    if (song && song.general.id !== `` && song.queue && song.votes && _.isNumber(song.votes.currentQueueScore)) {

      const voteMode = UserStore.getVoteMode();

      if (song.uservote === undefined) song.uservote = {hasVoted: false};

      const order = 1;
      const key = `fsPreview`;
      const fsPreview = true;
      const disableButtons = false;

      return (
        <div className='current-song-wrapper'>
          <SongSummary {...song} order={order} key={key} fsPreview={fsPreview} voteMode={voteMode} disableButtons={disableButtons} />
        </div>
      );

    }

  }

  renderFullscreenExtras() {

    const {playMode, song, videoMode} = this.state;

    if (playMode === `fullscreen` && !videoMode) {

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
          <div className='btn-exit-fullscreen' onClick={() => this.setPlayMode(`normal`)}><span>&nbsp;</span></div>
          <div className='btn-play-next' onClick={() => PlaylistActions.startNextSongUnsynched(this.prevSongId)}><span>&nbsp;</span></div>
          {this.renderCurrentSongIndicator()}
        </div>
      );

    }

  }

  renderLoadingOverlay() {

    const {song, drawFromImage, playMode} = this.state;

    if (drawFromImage) {

      let imgPath = `/stream/audio/visuals/${song.waveform.barsImage}`;
      let prgPath = `/stream/audio/visuals/${song.waveform.barsProgress}`;
      if (playMode === `fullscreen`) {
        imgPath = `/stream/audio/visuals/${song.waveform.waveImage}`;
        prgPath = `/stream/audio/visuals/${song.waveform.waveProgress}`;
      }
      const imageStyle = {backgroundImage: `url(${  imgPath  })`};
      const progressStyle = {backgroundImage: `url(${  prgPath  })`};

      return (
        <div className='loading-overlay'>
          <div className='progress-wrapper'>
            <div className='progress-visualisation' style={progressStyle}>&nbsp;</div>
          </div>
          <div className='song-visualisation' style={imageStyle}>&nbsp;</div>
        </div>
      );

    }

  }

  render() {

    const {song, playing, currentTimeString, isSynched, playMode} = this.state;

    let toggleSynchClasses = `btn-toggle-synch unsynched`;
    if (isSynched) toggleSynchClasses = `btn-toggle-synch synched`;

    let togglePlayClasses = `btn-toggle-play play`;
    if (playing) togglePlayClasses = `btn-toggle-play pause`;

    let audioPlayerClasses = `audio-player-wrapper play-mode-normal`;
    if (playMode === `fullscreen`) audioPlayerClasses = `audio-player-wrapper play-mode-fullscreen`;

    return (
      <article className={audioPlayerClasses}>
        {this.renderLoadingOverlay()}
        <div className={toggleSynchClasses} onClick={() => this.toggleSynched()}><span>&nbsp;</span></div>
        <div className={togglePlayClasses} onClick={() => this.togglePlay()}><span>&nbsp;</span></div>
        <div className='current-time'><span>{currentTimeString}</span></div>
        <div className='pos-wrapper' onClick={() => this.avoidAudioSeekError()}>
          {this.renderPlayer()}
        </div>
        <div className='total-duration'><span>{song.general.duration}</span></div>
        {this.renderVideoModeButton()}
        {this.renderAudioVisualisation()}
        {this.renderFullscreenExtras()}
      </article>
    );

  }

}
