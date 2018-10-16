---
  import LabelInput from '../components/labelInput/labelInput.vue'
---

## Input
components: {
  LabelInput
},

### Component Show
```render html
  <LabelInput></LabelInput>
```

### API

  | Name | Description | Type | Default |
  |-|-|-|-|
  | title | label标题 | String | - |
  | type | input、select、textarea | String | - |
  | optionArr | select option  | Array | - |
  | value | input value 值 | String | - |
  | setMessage | change方法，返回value值 | func | - |
  
