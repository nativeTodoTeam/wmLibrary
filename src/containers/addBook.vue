<template>
  <div class = 'add-wrapper-style'>
    <div class = 'add-input-style'>
     <LabelInput
        title = "书名"
        type = 'input'
        :value = 'bookName'
        @setMessage = 'getBookName'>
     </LabelInput>
    </div>
    <div class = 'add-input-style'>
     <LabelInput
       title = "作者"
       type = 'input'
       :value = 'bookAuthor'
       @setMessage = 'getBookAuthor'>
     </LabelInput>
    </div>
    <div class = 'add-input-style'>
     <LabelInput
       title = "分类"
       type = 'select'
       :optionArr = 'typeArr'
       @setMessage = 'getBookType'>
     </LabelInput>
    </div>
    <div class = 'add-input-style'>
     <LabelInput
       title = "简介"
       type = 'textarea'
       :value = 'bookCon'
       @setMessage = 'getBookCon'>
     </LabelInput>
    </div>

    <div class = 'add-btn-style' v-on:click = 'addBook'>添加书籍</div>
  </div>
</template>

<script>

  // 引用组件
  import LabelInput from '../components/labelInput/labelInput.vue'

  export default {
    name: 'addBook',
    data () {
      return {
        bookName: '',
        bookAuthor: '',
        bookCon: '',
        bookType: 0,
        typeArr: [
         {
           value: 1,
           text: 'IT技术'
         },
         {
           value: 2,
           text: '艺术设计'
         },
         {
           value: 3,
           text: '人文社科'
         },
         {
           value: 4,
           text: '经济管理'
         },
         {
           value: 5,
           text: '心理课堂'
         },
         {
           value: 6,
           text: '营销学'
         },
        ]
      }
    },
    components: {
      LabelInput
    },
    methods: {
      // 获取书籍名称
      getBookName(msg) {
        this.bookName = msg;
      },

      // 获取书籍作者
      getBookAuthor(msg) {
        this.bookAuthor = msg;
      },

      // 获取书籍简介
      getBookCon(msg) {
        this.bookCon = msg;
      },

      // 获取书籍分类
      getBookType(msg) {
        this.bookType = msg;
      },

      // 添加书籍按钮
      addBook() {
        console.log('点击获取歇息', this.bookName, this.bookAuthor, this.bookCon)
        let url = '/api/addbook';
        let data = {
          title: this.bookName,
          author: this.bookAuthor,
          content: this.bookCon,
          type: this.bookType
        }

        this.bookName = ' ';
        this.bookAuthor = ' ';
        this.bookCon = ' ';

       if (this.bookCon.length > 255) {
          alert('简介不能超过255个字')
        } else {
         this.$http.post(url, data).then((response) => {
            let _res = response.body;
            if (_res.code == 1) {
              alert('书籍添加成功');
              this.bookName = '';
            } else {
              alert(_res.msg);
            }
          });
        }
      }
    }
  }
</script>

<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
