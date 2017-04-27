export default array => {

  array.sort((a, b) => {return a - b;});

  const curvedArray = [];

  curvedArray[0] = Math.round(array[0] * (0.6 + 0.6 * Math.random()));
  curvedArray[1] = Math.max.apply(Math, array);
  curvedArray[2] = array[1]; // the average

  return curvedArray;

};
