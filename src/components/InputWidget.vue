<template>
  <div class="line">
    <input
      type="text"
      class="line-edit"
      name="line-edit"
      ref="lineEdit"
      v-model="inputString"
      v-on:input="onChange"
      v-on:keyup.enter="
        () => {
          results[focusIndex].onClick();
          clearInput();
          remote.getCurrentWindow().hide();
        }
      "
      v-on:keyup.up="
        () => {
          focusIndex = (focusIndex - 1 + results.length) % results.length;
        }
      "
      v-on:keyup.down="
        () => {
          focusIndex = (focusIndex + 1) % results.length;
        }
      "
    />
  </div>
  <div
    class="list-widget"
    v-bind:style="{
      height: Math.min(10, results.length) * 40 + 'px'
    }"
  >
    <div
      class="list-widget-item"
      v-for="(result, index) in results"
      v-bind:class="{ selectedItem: focusIndex == index }"
      v-bind:key="result.content"
      v-on:click="result.onClick"
      v-on:mouseover="
        () => {
          focusIndex = index;
        }
      "
    >
      <p class="content">{{ result.content }} - {{ focusIndex }}-{{ index }}</p>
      <p class="hot-key">
        {{
          (index - screenIndex >= 0) & (results.length > index - screenIndex)
            ? index - screenIndex + 1
            : 0
        }}
      </p>
    </div>
  </div>
</template>

<script>
const { ipcRenderer, remote } = require("electron");
export default {
  name: "InputWidget",
  props: {
    msg: String,
  },
  directives: {},
  data: function () {
    return {
      inputString: "",
      timer: "",
      modules: [],
      results: [],
      focusIndex: 0,
      screenIndex: 0,
    };
  },
  mounted() {
    this.modules = [];
    ipcRenderer.on("clear", (event, arg) => {
      this.clearInput();
    });
    ipcRenderer.on("focus", (event, arg) => {
      setTimeout(() => {
        this.$refs.lineEdit.focus();
      });
    });
    ipcRenderer.on("reload", (event, arg) => {
      this.modules = [];
      for (var mp of arg) {
        console.log("load module " + mp);
        import("../modules/" + mp)
          .then((module) => {
            console.log(module.default);
            this.modules.push(module.default);
          })
          .catch((error) => {
            /* Error handling */
            console.log("load module " + mp + " fail " + error);
          });
      }
    });
    // shortcuts
    window.addEventListener(
      "keydown",
      (event) => {
        console.log(event);
        if (event.metaKey && event.keyCode >= 48 && event.keyCode <= 57) {
          let offset = event.keyCode - 48 - 1 + this.screenIndex;
          offset = Math.min(offset, this.results.length - 1);
          this.results[offset].onClick();
          this.clearInput();
        }
        if (event.keyCode == 27) {
          this.clearInput();
          remote.getCurrentWindow().hide();
        }
      },
      true
    );
  },
  methods: {
    clearInput: function () {
      this.inputString = "";
      this.results = [];
      this.focusIndex = 0;
      this.screenIndex = 0;
    },
    onChange: function () {
      clearTimeout(this.timer);
      this.timer = setTimeout(this.handleInput, 20);
    },
    handleInput: function () {
      // alert(this.$data.inputString)
      this.results = [];
      for (const module of this.modules) {
        this.results = this.results.concat(module(this.$data.inputString));
      }
      this.focusIndex = Math.min(this.results.length - 1, this.focusIndex);
      let win = remote.getCurrentWindow();
      let size = win.getSize();
      win.setSize(
        size[0],
        56 + 40 * Math.min(10, this.results.length) + 10 * (this.results.length > 0)
      );
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
p {
  margin: 0;
  border-width: 0;
  display: inline-block;
}
.line {
  margin: 0;
  border-width: 0;
  height: 40px;
  opacity: 1;
}
.line-edit {
  display: block;
  font-size: 32px;
  height: 100%;
  width: 100%;
  padding: 0;
  border-width: 0;
  margin: 0;
}
.list-widget {
  margin-top: 10px;
  border-width: 0;
  overflow: hidden, auto;
}
.list-widget-item {
  margin: 0;
  line-height: 40px;
  height: 40px;
}
.content {
  text-align: left;
  width: 90%;
}
.hot-key {
  text-align: right;
  width: 10%;
}
.selectedItem {
  background-color: #e0e0e0;
}
</style>
