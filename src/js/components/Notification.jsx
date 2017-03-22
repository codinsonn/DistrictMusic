import React, {Component} from 'react';
import NotificationsStore from '../stores/NotificationsStore';
import * as NotifActions from '../actions/NotifActions';

export default class Notification extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      type: ``,
      message: ``
    };

    this.hidden = true;

  }

  componentWillMount() {
    NotificationsStore.on(`NOTIFICATIONS_CHANGED`, () => this.updateNotification());
    NotificationsStore.on(`HIDE_NOTIFICATION`, () => this.hideNotification());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateNotification() {

    let {type, message} = this.state;

    const notif = NotificationsStore.getNext();
    type = notif.type;
    message = notif.message;

    this.setState({type, message});

  }

  showNotification() {

    const $this = document.querySelector(`.notification`);

    if (this.hidden) {

      const {type} = this.state;
      const notificationClasses = `notification ${type} show`;

      $this.className = notificationClasses;

      this.hidden = false;

    }

  }

  hideNotification() {

    const $this = document.querySelector(`.notification`);

    if (!this.hidden) {

      const {type} = this.state;
      const notificationClasses = `notification ${type} hide`;

      $this.className = notificationClasses;

      setTimeout(() => NotifActions.removeNotification(), 600);

      this.hidden = true;

    }

  }

  render() {

    const {type, message} = this.state;
    const notificationClasses = `notification ${type} hide`;

    if (type !== `` && message !== ``) {
      setTimeout(() => this.showNotification(), 600);
      setTimeout(() => this.hideNotification(), 6000);
    }

    return (
      <article className='notifications'>
        <section className={notificationClasses} onClick={() => this.hideNotification()}>
          <span className='icon' onClick={() => this.hideNotification()}>&nbsp;</span>
          <span className='notifText'>{message}</span>
        </section>
      </article>
    );

  }

}
