<template>
  <div>
    <app-title />
    <node-selector />
  </div>
</template>

<script>
import AppTitle from "./AppTitle";
import NodeSelector from "./NodeSelector";

export default {
  name: "App",
  components: {
    "app-title": AppTitle,
    "node-selector": NodeSelector
  }
};
</script>

<style>

</style>
