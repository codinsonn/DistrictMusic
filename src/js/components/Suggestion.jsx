import React, {Component, PropTypes} from 'react';

export default class Suggestion extends Component {

  constructor(props, context) {

    super(props, context);

    this.state = {
      title: props.title,
      channel: props.channelTitle,
      thumbs: props.thumbnails
    };

  }

  componentWillMount() {

  }

  componentWillUnmount() {

  }

  componentDidMount() {

  }

  render() {

    const {title, thumbs} = this.state;

    //const style = {backgroundImage: `url(${  thumbs.medium.url  })`};

    return (
      <section className='search-suggestion'>
        <img src={thumbs.medium.url} alt={title} />
        <span>{title}</span>
      </section>
    );

  }

}

Suggestion.propTypes = {
  title: PropTypes.string,
  channelTitle: PropTypes.string,
  thumbnails: PropTypes.object
};
