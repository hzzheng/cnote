---
title: "区分await、return以及return await"
date: "2017-12-28"
origin: "https://jakearchibald.com/2017/await-vs-return-vs-return-await/"
---

当我们写async函数的时候，需要注意await、return以及return await的区别。

我们先来看一个async函数：

```javascript
async function waitAndMaybeReject() {
  // Wait one second
  await new Promise(r => setTimeout(r, 1000));
  // Toss a coin
  const isHeads = Boolean(Math.round(Math.random()));

  if (isHeads) return 'yay';
  throw Error('Boo!');
}
```

调用这个async函数会返回一个promise，等待一秒后，50%的可能性fulfilled，值为"yay"，50%的可能性reject一个异常。下面我们用几种不同的姿势来使用这个async函数。

### Just Calling

```javascript
async function foo() {
  try {
    waitAndMaybeReject();
  }
  catch (e) {
    return 'caught';
  }
}
```

如果调用上面的foo函数，会立即返回一个promise，并且fulfill的值为undefined。

因为我们没有await或者return函数`waitAndMaybeReject()`调用的结果。像上面这样的代码通常是写错了。

### Awaiting

```javascript
async function foo() {
  try {
    await waitAndMaybeReject();
  }
  catch (e) {
    return 'caught';
  }
}
```
如果调用上面的foo函数，返回的promise会等待一秒钟，然后fulfill，值要么为undefined，要么是“caught”。

因为我们await了`waitAndMaybeReject()`调用的结果，该调用返回的promise，如果是reject，会被当做一个异常抛出，因而catch代码块会被执行。如果返回的promise状态是fulfill，foo函数并没有处理fulfill的返回值。

### Returning

```javascript
async function foo() {
  try {
    return waitAndMaybeReject();
  }
  catch (e) {
    return 'caught';
  }
}

```

如果调用上面的foo函数，返回的promise会等待一秒钟，然后要么fulfill，值为“yar”，要么reject错误`Error('Boo!')`。

因为返回了`waitAndMaybeReject()`，foo调用返回的promise即为`waitAndMaybeReject()`返回的promise，所以catch代码并不会执行。

### Return-awaiting

如果希望上面的catch代码块有可能被执行，需要使用return await：

```javascript
async function foo() {
  try {
    return await waitAndMaybeReject();
  }
  catch (e) {
    return 'caught';
  }
}
```

如果调用上面的foo函数，返回的promise会等待一秒钟，然后fulfill，值为要么是“yay”，要么是“caught”。

因为我们await了`waitAndMaybeReject()`函数调用的结果，它返回的promise如果reject会抛出异常，此时catch代码块就会执行。但如果`waitAndMaybeReject()`返回的promise状态是fulfill，则会返回fulfill的结果。

如果上面的代码看起来有点困惑，把它拆分成两步可能更容易理解：

```javascript
async function foo() {
  try {
    // Wait for the result of waitAndMaybeReject() to settle,
    // and assign the fulfilled value to fulfilledValue:
    const fulfilledValue = await waitAndMaybeReject();
    // If the result of waitAndMaybeReject() rejects, our code
    // throws, and we jump to the catch block.
    // Otherwise, this block continues to run:
    return fulfilledValue;
  }
  catch (e) {
    return 'caught';
  }
}
```






