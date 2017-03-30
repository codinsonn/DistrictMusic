import React, {Component} from 'react';
import YouTube from 'react-youtube';
import UserStore from '../stores/UserStore';
import PlaylistStore from '../stores/PlaylistStore';

export default class YoutubeVideo extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      visible: PlaylistStore.getShowYoutubeVideo(),
      layout: PlaylistStore.getVideoLayoutMode(),
      id: ``,
      isSynched: UserStore.getSynched()
    };

    // -- Events ----
    this.evtUpdateLayout = () => this.updateLayout();
    this.evtUpdateCurrentVideo = () => this.updateCurrentVideo();
    this.evtUpdateSynched = () => this.updateSynched();

  }

  componentWillMount() {
    PlaylistStore.on(`YOUTUBE_LAYOUT_TOGGLED`, this.evtUpdateLayout);
    PlaylistStore.on(`SONG_CHANGED`, this.evtUpdateCurrentVideo);
    UserStore.on(`SYNCHED_CHANGED`, this.evtUpdateSynched);
  }

  componentWillUnmount() {
    PlaylistStore.removeListener(`YOUTUBE_LAYOUT_TOGGLED`, this.evtUpdateLayout);
    PlaylistStore.removeListener(`SONG_CHANGED`, this.evtUpdateCurrentVideo);
    UserStore.removeListener(`SYNCHED_CHANGED`, this.evtUpdateSynched);
  }

  componentDidMount() {

  }

  updateLayout() {

    let {visible, layout} = this.state;

    visible = PlaylistStore.getShowYoutubeVideo();
    layout = PlaylistStore.getVideoLayoutMode();

    this.setState({visible, layout});

  }

  updateCurrentVideo() {

    let {id} = this.state;
    const {isSynched} = this.state;

    const song = PlaylistStore.getSong(isSynched);
    id = song.general.id;

    this.setState({id});

  }

  updateSynched() {

    let {isSynched} = this.state;

    isSynched = UserStore.getSynched();

    this.setState({isSynched});

  }

  renderPlayer() {

    const {id, layout} = this.state;

    let vidWidth = 300;
    let vidHeight = vidWidth * .6;
    if (layout !== `side`) {
      vidWidth = 300;
      vidHeight = vidWidth * .6;
    }

    const opts = {
      height: vidHeight,
      width: vidWidth,
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 0,
        loop: 1,
        playlist: id
      }
    };

    if (id !== ``) {

      return (
        <YouTube
          videoId={id}
          id='yt-player'
          class='yt-player'
          opts={opts}
          onReady={this.handleOnVideoReady}
        />
      );

    }

  }

  render() {

    const {visible} = this.state;

    let youtubeWrapperClasses = `youtube-wrapper hidden`;
    if (visible) {
      youtubeWrapperClasses = `youtube-wrapper show`;
    }

    return (
      <article className={youtubeWrapperClasses}>
        <section className='youtube-video'>
          {this.renderPlayer()}
        </section>
      </article>
    );

  }

  handleOnVideoReady(event) {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

}
