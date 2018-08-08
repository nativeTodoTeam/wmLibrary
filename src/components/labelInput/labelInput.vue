/*
*  imgCard: 文案 + input
*  xiaotong
*/
<template>
  <div class = 'label-wrapper-style'>
    <div class = 'label-style'>{{title}}</div>
    <textarea v-if = "type == 'textarea'"
      class = 'label-textarea-style'
      :value = 'value'
      @input = "setMessage">
    </textarea>
    <input v-if = "type == 'input'"
      class = 'label-input-style'
      :value = 'value'
      @input = "setMessage">
    </input>
    <select v-model="message"
      class = 'select-style'
      v-if = "type == 'select'"
      @change = 'setMessage'>
      <option
        :value = 'option.value'
        v-for = 'option in optionArr'>
        {{option.text}}
      </option>
  </select>
  </div>
</template>

<style lang="scss" src="./labelInput.scss"></style>

<script>
  export default {
    data () {
      return {
        message: '',
        selected: ''
      }
    },
    props: {
      'title': {
        type: String
      },
      'type': {
        type: String
      },
      'optionArr': {
        type: Array
      },
      'value': {
        type: String
      }

    },

    methods: {
      setMessage: function() {
        this.$emit('setMessage', this.message);
      }
    }
  }

</script>
