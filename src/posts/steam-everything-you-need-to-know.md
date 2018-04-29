---
title: "Node.js Streams, 你需要知道的一切"
date: "2017-06-12"
origin: "https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93"
---


![](https://chuguan.me/static/stream.jpeg)
Node.js的streams向来被认为难以使用，更难于理解。现在我有一个好消息告诉你，这种情况马上就会被改变。

在过去的几年里，很多开发者为了能够更好更容易地使用streams，写了很多的模块。但在这篇文章里，我只关注原生的Node.js stream API。

> Streams是Node最好但也是最被误解的理念

-- *Dominic Tarr*


### Streams究竟是什么？

Streams是数据的集合，就像数组和字符串一样。不同在于，streams的数据集合在某一个时刻不一定全都能访问，因为不一定都在内存中，也因此不受内存大小限制。这使得streams非常擅长处理大体积数据，或者擅长某些从外部源一次只能获取一部分数据的场景。

除了可以处理大数据以外，streams还赋予了我们代码组合的能力。就像我们可以通过管道piping的方式组合强大的linux命名，在Node里也可以通过streams实现一样的效果。

![](https://chuguan.me/static/stream-01.png)

```javascript
const grep = ... // A stream for the grep output
const wc = ... // A stream for the wc input
grep.pipe(wc)
```

许多Node内置的模块都实现了streaming接口：

![](https://chuguan.me/static/stream-02.png)

上面列举了一些或是可或是可写streams的Node.js原生对象。其中有一些streams既可读也可写，比如TCP sockets, zib 和 crypto streams。

需要注意一些紧密相关的对象。比如，HTTP的响应response，在客户端是可读stream，但在服务端是可写stream。这是因为，对于HTTP请求来说，我们需要读接收到的信息(http.IncomingMessage)，然后写入到其他响应(http.ServerResponse)。

对于子进程child_process，需要注意的是相比主进程，标准输入输出stdio流(stdin, stdout, stderr)有相反的stream类型。这为父子进程之间stdio输入输出(pipe)提供了便利。

#### 一个实际的例子

理论是好的，但并没有100%的说服力。我们来看一个例子，证明在内存消耗上streams是如何地不同。

我们先创建一个大文件：

```javascript
const fs = require('fs');
const file = fs.createWriteStream('./big.file');

for(let i=0; i<= 1e6; i++) {
  file.write('Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n');
}

file.end();
```

注意，我使用了可写流(writable stream)来创建这个大文件。

`fs`模块可以用stream接口来读或者写文件。上面的例子中，我们轮换了一百万次，每次写入一行文字到big.file文件中。

运行上面的脚本会创建一个大约400MB的文件。

下面是一个Node服务器，用于提供前面生成的big.file文件。

```javascript
const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  fs.readFile('./big.file', (err, data) => {
    if (err) throw err;
  
    res.end(data);
  });
});

server.listen(8000);
```

当这个服务器接收到一个请求时，我们会使用异步的`fs.readFile`方法响应big.file文件。看上去我们不会阻塞事件循环或者其他任何的执行。一切都非常棒，对不对？可是，真的对吗？

那么让我们来看下服务器运行并接收到请求时内存的使用究竟发生了什么。

当我运行服务器后，内存的使用正常，只有8.7MB:

![](https://chuguan.me/static/stream-03.png)

然后，我请求了服务器，观察这个时候的内存使用变化：

![](https://chuguan.me/static/stream-04.gif)

天了噜，内存消耗直接跳到了434.8MB。

简单说，我们把整个big.file文件读到了内存中，然后再写入response响应对象。这样做显然效率不高。

HTTP的响应对象(上面代码中的`res`对象)也是一个可写stream。这意味着，如果我们有一个可读stream代表big.file的内容，那么我们可以通过pipe的方式连接两个stream对象，在无需消耗400MB内存的情况下实现同样的效果。

我们可以使用Node的fs模块的createReadStream方法拿到任何文件的可读stream。我们可以pipe这个可读stream给response响应对象。

```javascript
const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
  const src = fs.createReadStream('./big.file');
  src.pipe(res);
});

server.listen(8000);
```

现在当你请求服务器时，神奇的事情发生了。观察内存的使用情况：

![](https://chuguan.me/static/stream-05.gif)


发生了什么？

当客户端请求这个big.file文件时，我们通过stream的方式每次返回一小块数据，这意味着我们不用再内存中缓存整个文件。如上所示，内存的使用仅仅增加到25MB而已。

你可以尝试极端的情况，比如循环500万次生成一个2GB的big.file文件，这实际上已经大于Node默认的内存限制。

这种情况，你不能再使用fs.readFile方法了。但是依然可以用fs.createReadStream的方式响应请求提供文件。并且最棒的是，这个过程中内存的使用量基本和之前一样。

那么准备好开始学习streams了吗？

> 这篇文章是我在[Pluralsight](https://www.pluralsight.com/courses/nodejs-advanced)上Node相关课程的一部分。在那里有对应的视频内容。

### Streams 入门


