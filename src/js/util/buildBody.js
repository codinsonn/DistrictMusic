import {pick, assign} from 'lodash';

export default (data, values, extend) => {

  data = pick(data, values);

  if (extend) {
    data = assign(data, extend);
  }

  const fd = new FormData();
  for (const key in data) {
    fd.append(key, data[key]);
  }

  return fd;

};
