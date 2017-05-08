import React, {Component} from 'react';
import NotificationsStore from '../stores/NotificationsStore';
import PlaylistStore from '../stores/PlaylistStore';

export default class Notifications extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      currentNotifType: ``,
      currentNotifMessage: ``,
      playMode: `normal`,
      notifications: []
    };

    // -- Events ----
    this.evtAddNotification = () => this.addNotification();
    this.evtHideNotifications = () => this.hideNotifications();
    this.evtUpdatePlayMode = () => this.updatePlayMode();

  }

  componentWillMount() {
    NotificationsStore.on(`NOTIFICATIONS_CHANGED`, this.evtAddNotification);
    NotificationsStore.on(`HIDE_NOTIFICATION`, this.evtHideNotifications);
    PlaylistStore.on(`PLAY_MODE_CHANGED`, this.evtUpdatePlayMode);
  }

  componentWillUnmount() {
    NotificationsStore.removeListener(`NOTIFICATIONS_CHANGED`, this.evtAddNotification);
    NotificationsStore.removeListener(`HIDE_NOTIFICATION`, this.evtHideNotifications);
    PlaylistStore.removeListener(`PLAY_MODE_CHANGED`, this.evtUpdatePlayMode);
  }

  addNotification() {

    const {currentNotifType, currentNotifMessage, notifications} = this.state;

    const notif = NotificationsStore.getNext();
    if (notifications.length === 0) {
      setTimeout(() => { this.setNext(); }, 1);
    } else if (notifications[0].type !== `error`) { // Don't remove error notifications till done
      this.hideNotifications();
      setTimeout(() => { this.setNext(); }, 700);
    }
    console.log(`[Notifications] Adding notification:`, notif.message);
    notifications.push(notif);

    this.setState({currentNotifType, currentNotifMessage, notifications});

  }

  updatePlayMode() {

    let {playMode} = this.state;
    playMode = PlaylistStore.getPlayMode();
    this.setState({playMode});

  }

  setNext() {

    let {currentNotifType, currentNotifMessage} = this.state;
    const {notifications} = this.state;

    if (notifications.length > 0) {
      currentNotifType = notifications[0].type;
      currentNotifMessage = notifications[0].message;
      setTimeout(() => this.showNotification(), 600);
      setTimeout(() => this.hideNotification(), 5400);
      setTimeout(() => this.deleteNotifAndPlayNext(), 6000);
    } else {
      currentNotifType = ``;
      currentNotifMessage = ``;
    }

    this.setState({currentNotifType, currentNotifMessage});

  }

  showNotification() {

    const {currentNotifType} = this.state;
    document.querySelector(`.notification`).className = `notification ${currentNotifType} show`;

  }

  hideNotification(triggerDelete = false) {

    const {currentNotifType} = this.state;
    document.querySelector(`.notification`).className = `notification ${currentNotifType} hide`;
    if (triggerDelete) { setTimeout(() => this.deleteNotifAndPlayNext(), 600); }

  }

  deleteNotifAndPlayNext() {

    let {notifications} = this.state;
    notifications = notifications.slice(1, notifications.length);
    this.setState({notifications});
    this.setNext();

  }

  hideNotifications() {

    this.hideNotification();
    setTimeout(() => this.deleteNotifications(), 600);

  }

  deleteNotifications() {

    let {currentNotifType, currentNotifMessage, notifications} = this.state;

    notifications = [];
    currentNotifType = ``;
    currentNotifMessage = ``;

    this.setState({currentNotifType, currentNotifMessage, notifications});

  }

  render() {

    const {currentNotifType, currentNotifMessage, playMode} = this.state;
    const notificationClasses = `notification ${currentNotifType} hide`;
    const notificationsClasses = `notifications ${playMode}`;

    return (
      <article className={notificationsClasses}>
        <section className={notificationClasses} onClick={() => this.hideNotification(true)}>
          <span className='icon' onClick={() => this.hideNotification(true)}>&nbsp;</span>
          <span className='notifText'>{currentNotifMessage}</span>
        </section>
      </article>
    );

  }

}
