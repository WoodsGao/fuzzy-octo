<template>
  <InputWidget msg="Welcome to Your Vue.js App"/>
</template>

<script>
import InputWidget from './components/InputWidget.vue'

export default {
  name: 'App',
  components: {
    InputWidget
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  border-width: 0;
}
</style>
