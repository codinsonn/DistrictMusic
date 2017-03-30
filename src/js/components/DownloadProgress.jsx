import React, {Component} from 'react';
import SocketStore from '../stores/SocketStore';

export default class DownloadProgress extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      appearBusy: SocketStore.getAppearBusy(),
      downloadProgress: SocketStore.getDownloadProgress()
    };

    // -- Non state vars ----
    this.prevProgress = 0;

    // -- Events ----
    this.evtSetAppearBusy = () => this.setAppearBusy();
    this.evtUpdateDownloadProgress = () => this.updateDownloadProgress();

  }

  componentWillMount() {
    SocketStore.on(`APPEAR_BUSY_CHANGED`, this.evtSetAppearBusy);
    SocketStore.on(`DOWNLOAD_PROGRESS_UPDATED`, this.evtUpdateDownloadProgress);
  }

  componentWillUnmount() {
    SocketStore.removeListener(`APPEAR_BUSY_CHANGED`, this.evtSetAppearBusy);
    SocketStore.removeListener(`DOWNLOAD_PROGRESS_UPDATED`, this.evtUpdateDownloadProgress);
  }

  componentDidMount() {

  }

  setAppearBusy() {

    let {appearBusy} = this.state;

    appearBusy = SocketStore.getAppearBusy();

    this.setState({appearBusy});

  }

  updateDownloadProgress() {

    let {downloadProgress} = this.state;

    if (SocketStore.getDownloadProgress() > this.prevProgress) {
      this.prevProgress = downloadProgress;
      downloadProgress = SocketStore.getDownloadProgress();
      this.setState({downloadProgress});
    }

  }

  render() {

    const {appearBusy, downloadProgress} = this.state;

    let progressClasses = `progress hidden`;
    let progressStyle = {};

    if (appearBusy) {

      console.log(`Appearing busy...`);
      progressClasses = `progress blue show`;
      setTimeout(() => { document.querySelector(`.progress`).className = `progress blue show appear-busy`; }, 1);

    } else if (downloadProgress > 0 && downloadProgress < .99) {

      if (downloadProgress < .33) {
        progressClasses = `progress red show`;
      } else if (downloadProgress >= .33 && downloadProgress < .66) {
        progressClasses = `progress blue show`;
      } else if (downloadProgress >= .66) {
        progressClasses = `progress green show`;
      }

      progressStyle = {width: `${window.innerWidth * downloadProgress}px`};

    } else {

      this.prevProgress = 0;

    }

    return (
      <div className={progressClasses} style={progressStyle}>&nbsp;</div>
    );

  }

}
