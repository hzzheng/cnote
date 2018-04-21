---
title: "使用async函数写更清晰的代码"
date: "2017-03-09"
---

Async函数是ES2017规范的一部分。刚刚发布的Node7.6版本开始支持，不用加flag也能运行了。Chrome55版本以上以及大部分现代浏览器也都已经支持。对于不支持的浏览器和Node环境，可以通过Babel转译成ES3/ES5的语法运行。

### async函数是什么

先看一个简单的例子：

```javascript
async function fetchPosts() {
  const URL = '/api/posts'
  try {
    const response = await fetch(URL)
    // ...
  } catch (rejectValue) {
    // ...
  }
}
```

上面的函数声明前加了async关键字，函数内部使用了await语法。简单说，async函数内部可以await一个promise，用同步的方式写异步的代码。在被await的promise完成之前，函数不会继续执行，但不会阻塞主线程。当promise完成后，如果是fulfill，返回的结果作为await表达式的值。如果是reject，reject的值被当做异常抛出。

上面的例子并不完整，为了能更好地理解async函数，下面的例子分别用promise语法和async语法实现了相同的功能。

```javascript
// 实现请求文章列表 promise版本
function fetchPosts() {
  const URL = '/api/post'
}
```




