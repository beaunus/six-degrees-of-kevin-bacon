<template>
  <div>
    <h1>Node Selector</h1>
    <label for="actor1">Actor 1</label>
    <input type="text" id="actor1">
    <label for="actor1">Actor 2</label>
    <input type="text" id="actor2">
    <button name="sumbit-actors">Submit</button>
  </div>
</template>

<script>
export default {
  name: "NodeSelector"
};
</script>

<style scoped>
h1 {
  text-align: center;
}
</style>
