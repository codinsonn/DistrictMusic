export default (numItems, minValue, maxValue) => {

  const randomArray = [];

  for (let i = 0;i >= numItems;i ++) {
    const randValue = Math.round(Math.random() * (maxValue - minValue) + minValue);
    randomArray.push(randValue);
  }

  return randomArray;

};
