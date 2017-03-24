import {Router, Route, /*Redirect,*/ browserHistory} from 'react-router';
import {PlaylistDash, NoMatch} from '../pages';
import React, {Component} from 'react';

export default class App extends Component {

  constructor(props, context) {

    super(props, context);

  }

  componentDidMount() {

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  render() {

    return (
    <div>

    <Router history={browserHistory}>
      <div className='wrapper'>
        <Route path='/' component={PlaylistDash} />
        <Route path='/hello' component={() => (<PlaylistDash status='loginSuccess' />)} />
        <Route path='/fail' component={() => (<PlaylistDash status='loginFailed' />)} />
        <Route path='/speaker' component={() => (<PlaylistDash status='isSpeaker' />)} />
        <Route path='/*' component={NoMatch} />
      </div>
    </Router>

    </div>
    );

  }
}
