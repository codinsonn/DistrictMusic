import React, {Component} from 'react';
import {Notification} from '../components';
import NotificationsStore from '../stores/NotificationsStore';
//import * as NotifActions from '../actions/NotifActions';

export default class Notifications extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      notifs: NotificationsStore.getNext()
    };

  }

  componentWillMount() {
    NotificationsStore.on(`NOTIFICATIONS_CHANGED`, () => this.updateNotifications());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  updateNotifications() {

    let {notifs} = this.state;

    notifs = NotificationsStore.getNext();

    this.setState({notifs});

  }

  renderNotifications() {

    const {notifs} = this.state;

    return notifs.map(notif => {
      return <Notification {...notif} key={new Date()} />;
    });

  }

  render() {

    return (
      <section className='notifications'>
        {this.renderNotifications()}
      </section>
    );

  }

}

/*Profile.propTypes = {

};*/
