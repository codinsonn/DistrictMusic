export default array => {

  array.sort();

  const curvedArray = [];

  curvedArray[0] = Math.round(Math.random() * array[1] / 2);
  curvedArray[1] = Math.max.apply(Math, array);
  curvedArray[2] = array[1]; // the average

  return curvedArray;

};
