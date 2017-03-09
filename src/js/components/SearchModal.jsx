import React, {Component, PropTypes} from 'react';
//import {Link} from 'react-router';
//import Parallax from '../vendor/parallax';
//import Scrollchor from 'react-scrollchor';
//import PlaylistStore from '../stores/PlaylistStore';
//import {users} from '../api/';
import NotificationsStore from '../stores/NotificationsStore';
import * as PlaylistActions from '../actions/PlaylistActions';
import gapi from 'googleapi';

export default class SearchModal extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      gapiLoaded: false
    };

  }

  componentWillMount() {
    NotificationsStore.on(`GAPI_CLIENT_READY`, () => this.initSearchApi());
  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  initSearchApi() {

    gapi.client.setApiKey(`AIzaSyAh0pqBXb_-QLX92f3WOCiBffHVyYIaMJU`);
    gapi.client.load(`youtube`, `v3`, () => {
      //this.search('music');
    });

  }

  /*search(query) {

    //var q = $('#query').val();
    const q = query;
    const request = gapi.client.youtube.search.list({
      q: q,
      part: `snippet`,
      kind: `video`
    });

    request.execute(function(response) {
      const str = JSON.stringify(response.result);
      //$('#search-container').html('<pre>' + str + '</pre>');
      console.log(`Search Results`, str);
    });

  }*/

  render() {

    const {visible} = this.props;

    return (
      <div className={visible}>
        <div className='lightbox' onClick={() => PlaylistActions.hideSearchModal()}>&nbsp;</div>
        <article className='search-modal'>

        </article>
      </div>
    );

  }

}

SearchModal.propTypes = {
  visible: PropTypes.string
};

// <span className='buttonText'><a href="/auth/user/google">Sign in with Google+</a></span>
