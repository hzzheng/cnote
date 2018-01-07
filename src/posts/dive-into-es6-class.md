---
title: "理解ES6系列-Class(01)"
date: "2018-01-03"
---

ECMAScript 2015，简称ES6，因为有大量好用的语法特性，已经是前端开发的主流规范了。虽然许多浏览器对该标准的支持程度并不是太理想，但通过使用babel等工具，可以很方便地把ES6语法转义成浏览器支持的ES5语法。即便如此，很多开发者其实都没有系统地去学习过这个版本的语言规范。经常有来面试的同学，当被问及ES6语法问题时，支支吾吾只能说出`let const 箭头函数`这几个名词和概念。我自己也经历了这样的过程，从了解一些零碎的语法到系统地学习标准并掌握了重要的一些细节。关于学习资料，非常推荐前端大宗师`Nicholas C. Zakas`的[Understanding ECMAScript 6](https://leanpub.com/understandinges6/read#leanpub-auto-about-this-book)，打开连接可以在网上免费阅读。该书中译本也已经面世，点击[豆瓣连接](https://book.douban.com/subject/27072230/)查看详情。

正式进入主题，这是我准备写的“理解ES6系列”文章的第一篇。之所以选择从`Class`语法开讲，主要是因为，我认为理解了Class语法和它底层的原型继承模型，就能更好地理解Javascript这门语言的本质。

不同于Java等编程语言，JS其实是没有类的概念的，在ES6之前，如果要模拟传统语言的类实现，需要用到构造函数。举个例子：

```javascript
function Person(name) {
  this.name = name
}

Person.prototype.say = function() {
  console.log('I am a person, my name is ' + this.name)
}

// xiaoming是Person的一个实例
var xiaoming = new Person('xiaoming')
```

ES6中引入了Class语法，上面的例子可以改写成如下所示：

```javascript
Class Person {
  constructor(name) {
    this.name = name
  }

  say() {
    console.log('I am a person, my name is ' + this.name)
  }
}
```

本质上，Class的实现也是基于原型的，实现的原理可以参考下面的代码：

```javascript
let Person = (function() {

    "use strict";
    const Person = function(name) {
        // 确保以new的方式调用
        if (typeof new.target === "undefined") {
            throw new Error("Constructor must be called with new.");
        }

        this.name = name;
    }

    Object.defineProperty(Person.prototype, "sayName", {
        value: function() {
            // 确保不能以new方式调用方法
            if (typeof new.target !== "undefined") {
                throw new Error("Method cannot be called with new.");
            }

            console.log(this.name);
        },
        enumerable: false,
        writable: true,
        configurable: true
    });

    return Person;
}());
```

所以很多人说ES6的Class只是语法糖。这种看法只对了一半。如果仔细研究上面转译后的代码，会意识到与传统的构造函数方式相比，Class语法其实做了更多的事情。
这些区别我会在后面的文章中一一说明。