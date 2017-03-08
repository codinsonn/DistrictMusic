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
        <Route path='/fail' component={() => (<PlaylistDash error='failedlogin' />)} />
        <Route path='/song' component={PlaylistDash} />
        <Route path='/song/:id' component={PlaylistDash} />
        <Route path='/*' component={NoMatch} />
      </div>
    </Router>

    </div>
    );

  }
}
