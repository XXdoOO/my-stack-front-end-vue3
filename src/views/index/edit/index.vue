<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRoute } from 'vue-router'
import xMessage from '@/components/message/index'
import { postBlog, getBlogDetails, updateBlog } from '@/api/blog'

const blog = ref({
  id: useRoute().params.blogId ?? '',
  title: '',
  description: '',
  cover: '',
  content: '# 请使用markdown语法\n ## 开始你的表演\n```js\nlet f = new Func();\nconsole.log(f.__proto__); // Object\n```'
})

if (blog.value.id) {
  getBlogDetails(blog.value.id).then((data: any) => {
    console.log(data);
    blog.value = data
  })
}

const coverImg = ref()

const uploadCover = (e) => {
  blog.value.cover = URL.createObjectURL(e.target.files[0])
}

const handlePostBlog = () => {
  if (blog.value.title.trim().length != 0 && blog.value.description.trim().length != 0 && blog.value.content.trim().length != 0) {
    const img = coverImg.value.files[0]

    const data = new FormData()

    if (img) {
      data.append("coverImg", img)
    }

    for (let i in blog.value) {
      data.append(`${i}`, blog.value[i])
    }
    for (var [a, b] of data.entries()) {
      console.log(a, b);
    }

    if (blog.value.id) {
      updateBlog(data).then(data => {
        xMessage({
          type: 'success',
          message: '保存成功',
        })
      })
    } else {
      postBlog(data).then(() => {
        xMessage({
          type: 'success',
          message: '发布成功',
        })
      })
    }
  } else {
    xMessage({
      type: 'error',
      message: '请完善信息',
    })
  }
}
</script>

<template>
  <div class="info">
    <label class="title"><span>标题：</span><input type="text" v-model="blog.title" /></label>
    <label class="description"><span>描述：</span><input type="text" v-model="blog.description" /></label>
    <label class="cover"><span>封面：</span>
      <my-icon v-if="!blog.cover" icon="add" style="font-size:25px"></my-icon>
      <img v-if="blog.cover" :src="`/api/${blog.cover}`" width="50" height="50" />
      <input type="file" hidden accept=".jpg,.png" ref="coverImg" @change="uploadCover" /></label>
    <my-button class="post" @click="handlePostBlog">{{ blog.id ? '保存' : '发布' }}</my-button>
  </div>
  <v-md-editor class="markdown" v-model="blog.content"></v-md-editor>
</template>

<style lang="less" scoped>
.info {
  background-color: white;
  margin-bottom: @gap;
  border-radius: 5px;
  padding: 20px;
  display: flex;
  align-items: center;

  label {
    display: flex;
    align-items: center;
    margin-right: 50px;
  }

  label.title::before,
  label.description::before {
    content: "*";
    color: red;
  }

  input {
    border: none;
    border-bottom: 1px solid @theme-color;
    padding: 5px;
  }

  .description input {
    width: 500px;
  }

  .post {
    width: 120px;
    margin-left: auto;
  }

  .cover {
    cursor: pointer;

    img {
      border-radius: 5px;
    }
  }
}

.markdown {
  min-height: 100vh;
}
</style>