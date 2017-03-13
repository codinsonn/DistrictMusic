import React, {Component, PropTypes} from 'react';
import * as PlaylistActions from '../actions/PlaylistActions';

export default class Suggestion extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      id: props.id,
      title: props.title,
      channel: props.channelTitle,
      thumbs: props.thumbnails,
      duration: props.duration
    };

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  showSuggestionDetail() {

    const {id, title, channel, thumbs, duration} = this.state;
    const data = {id: id, title: title, channel: channel, thumbs: thumbs, duration: duration};

    PlaylistActions.hideSearchModal();
    PlaylistActions.showSuggestionDetail(data);

  }

  render() {

    const {title, thumbs, duration} = this.state;

    return (
      <section className='search-suggestion' onClick={() => this.showSuggestionDetail()}>
        <img src={thumbs.medium.url} alt={title} />
        <div className='suggestion-info'>
          <span className='btn-add-to-queue' onClick={() => this.showSuggestionDetail()}>+ Add to queue</span>
          <span className='suggestion-title'>{title}</span>
          <span className='suggestion-duration'>{duration}</span>
        </div>
      </section>
    );

  }

}

Suggestion.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  channelTitle: PropTypes.string,
  thumbnails: PropTypes.object,
  duration: PropTypes.string
};
