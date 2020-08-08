async function getPaths(event) {
  const actor1 = document.getElementById("actor1").value;
  const actor2 = document.getElementById("actor2").value;
  const actorsArray = [actor1, actor2];
  const queryString = actorsArray
    .map(actorName => `actor=${encodeURI(actorName)}`)
    .join("&");
  const paths = (await axios.get(`/api?${queryString}`)).data;
  loadGraphFromData(paths);
}
