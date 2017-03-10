import {Router, Route, /*Redirect,*/ browserHistory} from 'react-router';
import {PlaylistDash, NoMatch} from '../pages';
import React, {Component} from 'react';
import * as NotifActions from '../actions/NotifActions';
import gapi from 'googleapi';

export default class App extends Component {

  constructor(props, context) {

    super(props, context);

  }

  componentDidMount() {

  }

  componentWillMount() {

    gapi.load(`client`, this.onGapiClientLoad);

  }

  componentWillUnmount() {

  }

  onGapiClientLoad() {

    gapi.client.init({
      apiKey: `AIzaSyAh0pqBXb_-QLX92f3WOCiBffHVyYIaMJU`,
      client_id: `988274792144-8f4hj5jj2qja2fagh9stkfe5f8dpfbau.apps.googleusercontent.com`,
      cookiepolicy: `single_host_origin`,
      scope: `profile email`
    }).then(() => {
      NotifActions.gapiClientLoaded();
    });

  }

  render() {

    return (
    <div>

    <Router history={browserHistory}>
      <div className='wrapper'>
        <Route path='/' component={PlaylistDash} />
        <Route path='/hello' component={() => (<PlaylistDash loginStatus='loginSuccess' />)} />
        <Route path='/fail' component={() => (<PlaylistDash loginStatus='loginFailed' />)} />
        <Route path='/song/:id' component={PlaylistDash} />
        <Route path='/*' component={NoMatch} />
      </div>
    </Router>

    </div>
    );

  }
}
