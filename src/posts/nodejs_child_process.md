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

比如，我们可以控制子进程的输入流，监听它的输出流。我们还能控制传递给底层操作系统命令的的参数，并且我们可以对命令的输出做任何想做的事。举个例子，我们可以把一个命令的输出作为另一个命令的输入(pipe, 就像我们经常在Linux上做的)。原因在于，这些命令的所有输入输出都可以通过Node.js中streams的方式呈现给我们使用。

需要注意的是，我在这篇文章中使用的所有例子都是基于Linux系统的，如果你是Windows用户，你需要把这些命令转换成对应的Windows命令。

在Node中，一共有四种不同的方式创建一个子进程：`spaw()`, `fork()`, `exec()` 和 `execFile()`。

好了，下面开始分别介绍这四个函数和它们的区别，以及该在什么时候使用它们。

### Spawned Child Processes






