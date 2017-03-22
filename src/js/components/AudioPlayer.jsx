import React, {Component} from 'react';
import Wavesurfer from 'react-wavesurfer';
//import SocketStore from '../stores/SocketStore';
import PlaylistStore from '../stores/PlaylistStore';

export default class AudioPlayer extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      currentSong: PlaylistStore.getCurrentSong(),
      playing: true,
      pos: 0
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

  handlePosChange(e) {

    let {pos} = this.state;

    pos = e.originalArgs[0];

    this.setState({pos});

  }

  renderPlayer() {

    const {currentSong, playing, pos} = this.state;

    if (currentSong.general !== ``) {

      console.log(`[AudioPlayer] Rendering current song:`, currentSong);

      const audioFile = `assets/audio/${currentSong.general.filename}`;

      return (
        <Wavesurfer
          audioFile={audioFile}
          pos={pos}
          onPosChange={e => this.handlePosChange(e)}
          playing={playing}
          options={this.waveOptions}
          zoom='10'
        />
      );

    } else {

      console.log(`[AudioPlayer] No render:`, currentSong);

    }

  }

  render() {

    return (
      <article className='audio-player-wrapper'>
        <div className='wave-pos-wrapper'>
          {this.renderPlayer()}
        </div>
      </article>
    );

  }

}
