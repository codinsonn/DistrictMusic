import React, {Component, PropTypes} from 'react';

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

  render() {

    const {title, thumbs, duration} = this.state;

    return (
      <section className='search-suggestion'>
        <img src={thumbs.medium.url} alt={title} />
        <span className='song-title'>{title}</span>
        <span className='song-duration'>{duration}</span>
      </section>
    );

  }

}

Suggestion.propTypes = {
  id: PropTypes.string,
  title: PropTypes.string,
  channelTitle: PropTypes.string,
  thumbnails: PropTypes.object
};
