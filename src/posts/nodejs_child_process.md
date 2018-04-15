---
title: "Node.js Child Processes, 你需要知道的一切"
date: "2017-09-20"
origin: "https://medium.freecodecamp.org/node-js-child-processes-everything-you-need-to-know-e69498fe970a"
---

![](https://chuguan.me/static/child_process.png)

虽然囿于单线程执行JS，Node.js的单进程应用利用非阻塞特性表现得非常好。但最终，单CPU单进程的方式不足以处理应用程序日益增长的工作负荷。

无论你的的服务器有多强大，需要承认的是，单线程只能承受有限的负荷。

Node单线程执行JS的事实并不意味着我们不能利用多进程，或者多处理器的优势。

使用多进程是扩展Node应用最好的方式。Node.js本就是设计成利用多节点(nodes)构建分布式应用的。这也是为什么它叫Node。可扩展性是Node这个平台的基因，并且是你在应用程序生命周期开始就应该考虑的事情。

请注意，在继续阅读这篇文章之前，你需要对Node.js的events和streams有非常好的理解。如果你还不熟悉这些，我建议你先阅读另外两篇文章：

* [Understanding Node.js Event-Driven Architecture](https://medium.freecodecamp.org/understanding-node-js-event-driven-architecture-223292fcbc2d)
* [Node.js Streams: Everything you need to know](https://medium.freecodecamp.org/node-js-streams-everything-you-need-to-know-c9141306be93)

### Child Processes 模块

我们可以非常容易地使用Node的`child_process`模块新开一个子进程，并且这些子进程可以非常容易地通过消息系统进行通信。

通过在子进程中运行系统命令，`child_process`模块可以使我们能够获取操作系统提供的许多能力。

比如，我们可以控制子进程的输入流，监听它的输出流。我们还能控制传递给底层操作系统命令的的参数，并且我们可以对命令的输出做任何想做的事。举个例子，我们可以把一个命令的输出作为另一个命令的输入（pipe, 就像我们经常在Linux上做的）。原因在于，这些命令的所有输入输出都可以通过Node.js中streams的方式呈现给我们使用。

需要注意的是，我在这篇文章中使用的所有例子都是基于Linux系统的，如果你是Windows用户，你需要把这些命令转换成对应的Windows命令。

在Node中，一共有四种不同的方式创建一个子进程：`spaw()`、`fork()`、 `exec()` 和 `execFile()`。

好了，下面开始分别介绍这四个函数和它们的区别，以及该在什么时候使用它们。

#### Spawned Child Processes

`spawn`函数在一个新进程中运行命令，并且我们可以传递任何参数给该命令。下面的代码创建了一个新进程用于执行`pwd`命令。

```javascript
const { spawn } = require('child_process');
const child = spawn('pwd');
```

如上所示，我们从`child_process`模块解构获取`spawn`函数，然后把操作系统命令`pwd`作为参数传递给它调用执行。

`spawn`函数调用返回的对象（上面的`child`对象）是一个`ChildProcess`实例，并实现了`EventEmitter API`。这意味着，我们可以直接在这个child对象上注册事件处理函数。比如，我们可以通过注册事件处理函数在子进程退出的时候做一些事情：

```javascript
child.on('exit', function (code, signal) {
  console.log('child process exited with ' +
              `code ${code} and signal ${signal}`);
});
```

上面的事件处理函数接收了两个参数，`code`以及`signal`。`signal`表示用来终止进程的信号，如果进程是正常退出的，它的值是null。

除了`exit`，其他我们可以在`ChildProcess`实例上监听的事件还有`disconnect`、 `error`、`close`，以及`message`。

* `disconnect`事件是当父进程手动调用`child.disconnect`函数时触发的。
* `error`事件是当进程不能被`spawned`或被`killed`的时候触发的。
* `close`事件是当一个子进程的`stdio`流被关闭的时候触发的。
* `message`事件是最重要的一个事件。它是当紫禁城调用`process.send()`函数发送消息的时候触发的。这是父/子进程进行通信的方式。下面我们来举例说明这个过程。

每一个子进程都能获取到三个标准`stdio`流，我们可以通过`child.stdin`，`child.stdout`以及`child.stderr`访问它们。

当这些流被关闭的时候，使用它们的子进程会触发`close`事件。`close`事件和`exit`不同，因为多个子进程可以共享同一个`stdio`流，所以当一个子进程退出的时候并不意味着这个流被关闭了。

因为所有的流也都是`event emitter`，所以我们可以在子进程的`stdio`流上监听不同的事件。和通常的进程不同，在子进程中，`stdout`/`stderr`流是可读流，而`stdin`是可写流，这正好和主进程中的对应流类型相反。在这些流上我们能使用的都是一些标准事件。在可读流上能够监听的最重要的事件是`data`事件，在该事件处理函数中我们可以获得命令执行后的输出或者执行命令时候的错误。

```javascript
child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`child stderr:\n${data}`);
});
```

上面代码中的两个事件处理函数会打印相关内容到住进程的`stdout`和`stderr`。当我们执行上面的`spawn`函数的时候 `pwd`命令的输出会被打印，然后子进程正常退出（`exit code`等于`0`，意味没有错误发生）。

我们可以把被执行的命令需要的参数组成成一个数组，作为`spawn`函数调用的第二个参数。举个简单的例子，在当前目录执行`find`命令并且带上参数`-type f`（只列出文件）,我们可以这样：

```javascript
const child = spawn('find', ['.', '-type', 'f']);
```

如果在执行命令的时候发生错误，比如，上面的例子我们给`find`命令一个无效的目录，`child.stderr`的`data`事件会被触发，并且`exit`事件处理函数接收到的exit code等于1，表示有一个错误发生了。具体的错误值依赖于宿主操作系统和错误类型。

子进程的`stdin`是可写流。我们可以利用这点给被执行的命令输入内容。和其他可写流一样，最简单的消费这个流的方式是使用`pipe`函数。我们可以简单地吧一个可读流导向一个可写流。因为主进程的`stdin`是一个可读流，我们可以把它导向一个子进程的`stdin`流。如下所示：

```javascript
const { spawn } = require('child_process');

const child = spawn('wc');

process.stdin.pipe(child.stdin)

child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
});
```

在上面的例子中，子进程执行了`wc`命令，这个命令在Linux系统中用于统计行数、单词数、以及字符数。然后我们把主进程的`stdin`（可读流）导向子进程的`stdin`（可写流）。这样做的结果是，我们可以在标准输入键入一些内容，然后按`Ctrl+D`，键入的内容会被作为`wc`命令的输入使用。

![](https://chuguan.me/static/child_process_demo_1.gif)

多个进程的标准输入输出可以相互之间导流，就像我们在使用Linux命令时候做的一样。比如，我们可以把`find`命令的`stdout`导向`wc`命令的`stdin`去计算当前目录下所有文件的数量：

```javascript
const { spawn } = require('child_process');

const find = spawn('find', ['.', '-type', 'f']);
const wc = spawn('wc', ['-l']);

find.stdout.pipe(wc.stdin);

wc.stdout.on('data', (data) => {
  console.log(`Number of files ${data}`);
})
```

我给`wc`命令加了`-l`参数，使它只统计行数。上面的代码执行后，会输出当前目录下所有文件的数量。







