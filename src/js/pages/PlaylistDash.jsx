import React, {Component} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
import {LoginModal} from '../components';
//import PlaylistStore from '../stores/PlaylistStore';

export default class PlaylistDash extends Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      isLoggedIn: 0,
      showLoginModal: false
    };

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  setLoginModal(visible) {

    const showLoginModal = visible;
    this.setState({showLoginModal});

  }

  render() {

    const {showLoginModal} = this.state;

    let visible = `hidden`;
    if (showLoginModal) {
      visible = `shown`;
    }

    return (
      <div>
        <LoginModal visible={visible} setLoginModal={visible => this.setLoginModal(visible)} />
        <button onClick={() => this.setLoginModal(true)}>Login</button>
      </div>
    );

  }

}
