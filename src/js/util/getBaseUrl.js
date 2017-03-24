export default () => {

  return `${location.protocol  }//${  location.hostname  }${location.port && `:${  location.port}`  }/`;

};
