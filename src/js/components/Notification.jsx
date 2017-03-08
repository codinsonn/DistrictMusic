import React, {Component, PropTypes} from 'react';
//import NotificationsStore from '../stores/NotificationsStore';
import * as NotifActions from '../actions/NotifActions';

export default class Notification extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      type: props.type,
      message: props.message
    };

    this.hasBeenRemoved = false;

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {

    setTimeout(() => this.showNotification(), 800);
    setTimeout(() => this.hideNotification(), 8000);

  }

  showNotification() {

    const {type} = this.state;
    const notificationClasses = `notification ${type} show`;

    document.querySelector(`.notification`).className = notificationClasses;
    document.querySelector(`.notification`).focus();

  }

  hideNotification() {

    if (!this.hasBeenRemoved) {

      const {type} = this.state;
      const notificationClasses = `notification ${type} hide`;

      document.querySelector(`.notification`).className = notificationClasses;

      setTimeout(() => NotifActions.removeNotification(), 300);

      this.hasBeenRemoved = true;

    }

  }

  render() {

    const {type, message} = this.state;
    const notificationClasses = `notification ${type} hide`;

    return (
      <section className={notificationClasses} tabIndex='1' onBlur={() => this.hideNotification()}>
        <span className='icon' onClick={() => this.hideNotification()}>&nbsp;</span>
        <span className='notifText'>{message}</span>
      </section>
    );

  }

}

Notification.propTypes = {
  type: PropTypes.string,
  message: PropTypes.string
};
