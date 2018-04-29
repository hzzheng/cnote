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

Node.js中一共有四种类型的stream: Readable, Writable, Duplex, 以及Transform streams。

- 一个可读流（readable stream）是对一个数据源的抽象。fs.createReadStream即是一个例子。
- 一个可写流（writable stream）是对一个数据写入目标的抽象。fs.createWriteStream即是一个例子。
- 一个双向流（duplex streams）同时可读可写，TCP socket即是一个例子。
- 一个转换流（transform stream）也是双向流，只不过在读写的时候可以修改或转换数据。用于gzip压缩的zlib.createGzip即是一个例子。你可以把转换流看成是一个函数，可写流是输入，可读流是输出。你可能也听说过，转换流有时候也被称“through streams”。

所有的streams都是EventEmitter实例。可以监听触发的事件进行读写数据的操作。我们还可以用pipe方法更简单地消费流数据。

#### pipe 方法

下面这行神奇的代码是你必须记住的：

```javascript
readableSrc.pipe(writableDest)
```

上面简单的代码展示了如何将作为数据源的可读流pipe到一个可写流。数据源需要是一个可读流，目标需要是一个可写流。当然，它们都可以用双向流/转换流替代。实际上，我们可以pipe到一个双向流，然后实现一个链式的pipe过程，就像我们在Linux中做的一样：

```javascript
readableSrc
  .pipe(transformStream1)
  .pipe(transformStream2)
  .pipe(finalWrtitableDest)
```

pipe方法返回的是目标流（destination stream），这使得我们可以像上面那样链式调用。对于可读流a，双向流b和c，以及可写流d，我们可以这样做：

```javascript
a.pipe(b).pipe(c).pipe(d)
# Which is equivalent to:
a.pipe(b)
b.pipe(c)
c.pipe(d)
# Which, in Linux, is equivalent to:
$ a | b | c | d
```

pipe方法是消费流最简单的方式。我们一般建议要么使用pipe方法，要么使用事件的方式消费流，应该避免同时使用两者。通常来说，当你使用pipe方法的时候你不需要再使用事件。但是如果你想使用自定义的方式消费流，那么事件更合适。

#### 流事件

除了从可读流读取数据，然后写入可写流，pipe方法还自动做了一些其他事情。比如，它处理了错误，文件结束，以及一个流比另一个更快或更慢的情况。

流也可以直接通过事件被消费。下面是用事件的方式完成了pipe方法相同功能的代码：

```javascript
# readable.pipe(writable)
readable.on('data', (chunk) => {
  writable.write(chunk);
});
readable.on('end', () => {
  writable.end();
});
```

下面是可读/可写流重要事件和方法的列表：

![](https://chuguan.me/static/stream-06.png)

事件和函数某种程度上是相关的因为它们通常一起使用。

可读流最重要的事件是：

- `data`事件。当流传递一块数据给消费者的时候触发。
- `end`事件。当流已经没有可以被消费的数据的时候触发。

可写流最重要的事件是：

- `drain`事件。它是一个信号，说明可写流可以接收更多的数据。
- `finish`事件。当所有的数据进入底层系统进行处理的时候触发。

事件和函数可以结合起来以更好更个性化地方式使用流。对于消费一个可读流，我们可以使用pipe/unpipe方法，或者使用read/unshift/resume方法。对于消费一个可写流，我们可以使它成为pipe/unpipe的目标，或者只是使用write方法写入，在结束的时候调用end方法。

#### 可读流的paused和flowing模式

可读流有两种主要的能够影响如何被消费的模式：

- 它们要么是paused模式
- 要么是flowing模式

这些模式有时候也被称为pull和push模式。

所有的可读流都是从paused模式开始，但它们可以非常容易地转换成flowing模式，并且在需要的时候也能转换回来。有时候，这种转换是自动进行的。

当一个可读流处在paused模式，我们可以使用read()方法根据需求从流中读取数据。对于处在flowing模式下的可读流，数据在不停地流动，我们必须监听事件来消费它。

在flowing模式下，如果没有消费者处理它，数据实际上会丢失。这是为什么，当我们有一个在flowing模式下的可读流，我们需要有一个data事件处理程序。实际上，当我们添加一个data事件处理程序，pause模式就会转变横flowing模式。当我们移除data事件处理程序，模式会转换回pause模式。这么处理的部分原因是为了向后兼容老的Node streams接口。

如果要手动在两种模式之间切换，我们可以使用resume()和pause()方法。

![](https://chuguan.me/static/stream-07.png)


当我们使用pipe方法消费可读流的时候，我们并不需要考虑这些模式，因为pipe已经自动处理了。

### 实现Streams

当我们讨论Node.js的streams时，有两个不同的主要任务：

- 实现各种类型的流
- 然后消费它们

到目前为止，我们只是谈了如何消费流。现在我们来实现它们。

stream的实现通常需要引用`stream`模块。

#### 实现一个可写流

为了实现一个可写流，我们需要使用stream模块的`Writable`构造函数。

```javascript
const { Writable } = require('stream');
```

有很多种方式可以实现一个可写流。比如，我们可以继承`Writable`构造函数：

```javascript
class myWritableStream extends Writable {
}
```

然而，我更喜欢简单的构造方式。我们从构造函数创建一个对象，并且传递了一些选项。唯一必须的选项是write方法，可写的数据块会暴露给这个方法。

```javascript
const { Writable } = require('stream');
const outStream = new Writable({
  write(chunk, encoding, callback) {
    console.log(chunk.toString());
    callback();
  }
});

process.stdin.pipe(outStream);
```

这个write方法接收三个参数：

- chunk，通常是一个buffer除非对这个流进行了不同的配置。
- encoding，通常我们可以忽略它。
- callback，这个函数式我们处理完数据块后需要调用的，用来通知是否写成功。如果想通知写失败了，可以在调用的时候传入一个error对象。


在outStream流实现中，我们简单地把数据块转成字符串打印出来。然后调用callback，通知没有错误发生。这是一个简单可能也没太大用处的echo流。它会echo所有它接收到的内容。

如果要消费这个流，我们可以简单地使用process.stdin这个可读流，我们可以把process.stdin流pipe到我们的outStream。

当我们运行上面的代码，任何我们输入到process.stdin中的内容会被console.log打印出来。

这个流用处不大，并且实际上已经被Node内置实现了。这个流类似process.stdout。下面的折行代码可以实现完全一样的功能：

```javascript
process.stdin.pipe(process.stdout);
```

#### 实现一个可读流

为了实现一个可读流，我们需要使用Readable接口，并通过它创建一个对象。

```javascript
const { Readable } = require('stream');
const inStream = new Readable({});
```

然后我们可以直接使用push方法提供我们希望消费者消费的数据。

```javascript
const { Readable } = require('stream'); 
const inStream = new Readable();
inStream.push('ABCDEFGHIJKLM');
inStream.push('NOPQRSTUVWXYZ');
inStream.push(null); // No more data
inStream.pipe(process.stdout);
```

我们push了一个null对象，是为了发出信号告知这个流没有更多数据了。

消费这个流也很简单，我们可以把它pipe到一个可写流process.stdout。

当我们运行上面的代码，会读取inStream的所有数据，并且响应给标准输出。非常简答，同时也非常低效。

上面例子中，我们先push了所有的数据，然后再pipe到process.stdout。更好的方式是仅在需要的时候push数据。我们可以通过配置read()方法来实现：

```javascript
const inStream = new Readable({
  read(size) {
    // there is a demand on the data... Someone wants to read it.
  }
});
```

当一个read方法被调用的时候，可以push部分数据到队列中。比如，我们可以一次push一个字符，从字符码65开始（代表A)，然后每次push的时候递增：

```javascript
const inStream = new Readable({
  read(size) {
    this.push(String.fromCharCode(this.currentCharCode++));
    if (this.currentCharCode > 90) {
      this.push(null);
    }
  }
});
inStream.currentCharCode = 65;
inStream.pipe(process.stdout);
```

当流的消费者读这个流的时候，read方法会被持续调用，我们得以push更多的字符。我们需要在某个地方暂停这个循环，因此在字符码大于90（代表Z）的时候，push了一个null对象。

上面代码的效果和之前更简单的版本一样，但现在我们可以按需去push数据。你也应该永远这样去做。

#### 实现双向/转换流

对于双向流（Duplex），我们可以在一个对象上同时实现可读/可写流，就像我们同时继承了两个接口。下面的例子中，双向流结合了上面可读/可写流的行为：

```javascript
const { Duplex } = require('stream');

const inoutStream = new Duplex({
  write(chunk, encoding, callback) {
    console.log(chunk.toString());
    callback();
  },

  read(size) {
    this.push(String.fromCharCode(this.currentCharCode++));
    if (this.currentCharCode > 90) {
      this.push(null);
    }
  }
});

inoutStream.currentCharCode = 65;
process.stdin.pipe(inoutStream).pipe(process.stdout);
```

