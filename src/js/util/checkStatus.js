export default response => {
  //console.log(`RESP`, response.json());
  const json = response.json();
  //console.log(`Response:`, json);
  if (response.ok) return json;
  else return json.then(Promise.reject.bind(Promise));
};
