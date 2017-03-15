import React, {Component/*, PropTypes*/} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
//import PlaylistStore from '../stores/PlaylistStore';
//import {users} from '../api/';
import SocketStore from '../stores/SocketStore';

export default class DownloadProgress extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      downloadProgress: SocketStore.getDownloadProgress()
    };

  }

  componentWillMount() {
    SocketStore.on(`DOWNLOAD_PROGRESS_UPDATED`, () => this.updateDownloadProgress());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateDownloadProgress() {

    let {downloadProgress} = this.state;

    downloadProgress = SocketStore.getDownloadProgress();
    console.log(`New downloadProgress: `, downloadProgress);

    this.setState({downloadProgress});

  }

  render() {

    const {downloadProgress} = this.state;

    let progressClasses = `progress hidden`;
    let progressStyle = {width: `0px`};
    if (downloadProgress > 0) {
      progressClasses = `progress show`;
      progressStyle = {width: `${window.innerWidth * downloadProgress}px`};
    }

    return (
      <div className={progressClasses} style={progressStyle}>&nbsp;</div>
    );

  }

}

/*Profile.propTypes = {

};*/
