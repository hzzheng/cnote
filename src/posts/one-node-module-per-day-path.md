---
title: "每天一个Node模块：Path"
date: "2018-01-22"
origin: "https://nodejs.org/dist/latest-v8.x/docs/api/path.html"
---

#### 注：node v8.11.1

### 目录
- Path
  - Windows vs. POSIX
  - path.basename(path[, ext])
  - path.delimiter
  - path.dirname(path)
  - path.extname(path)
  - path.format(pathObject)
  - path.isAbsolute(path)
  - path.join([...paths])
  - path.normalize(path)
  - path.parse(path)
  - path.posix
  - path.relative(from, to)
  - path.resolve([...paths])
  - path.sep
  - path.win32

### Path

path模块提供了访问和操作文件/文件夹路径的能力。使用前引入：

```javascript
const path = require('path');
```

#### Windows vs. POSIX

path模块的默认行为会根据所运行的操作系统而变化。具体地说，当node应用运行在Windows上时，path模块会使用Windows风格的路径。

举个例子，当使用path.basename()函数处理Windows风格的文件路径`C:\temp\myfile.html`时，在POSIX和Windows系统上的运行结果并不同:

POSIX:
```javascript
path.basename('C:\\temp\\myfile.html');
// Returns: 'C:\\temp\\myfile.html'
```

Windows:
```javascript
path.basename('C:\\temp\\myfile.html');
// Returns: 'C:\\temp\\myfile.html'
```

对于Windows风格的文件路径，如果想要在不同的操作系统返回相同的结果，可以使用path.win32:

```javascript
path.win32.basename('C:\\temp\\myfile.html');
// Returns: 'myfile.html'
```


对于POSIX风格的文件路径，如果想要在不同的操作系统返回相同的结果，可以使用path.posix:

```javascript
path.posix.basename('/tmp/myfile.html');
// Returns: 'myfile.html'
```

#### path.basename(path[, ext])

- path [string]
- ext [string] 可选的文件扩展名
- returns [string]

path.basename()方法返回路径最后的部分，类似于Unix中的basename命令。末尾的目录分隔符会被忽略。详情参看path.sep。

举例：

```javascript
path.basename('/foo/bar/baz/asdf/quux.html');
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Returns: 'quux'
```

如果传入的path不是字符串，或者传入了ext并且不是字符串，会抛出类型错误`TypeError`。

#### path.delimiter

- [string]

返回特定于操作系统的路径分界符。

POSIX:
```javascript
console.log(process.env.PATH);
// Prints: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'

process.env.PATH.split(path.delimiter);
// Returns: ['/usr/bin', '/bin', '/usr/sbin', '/sbin', '/usr/local/bin']
```

Windows
```javascript
console.log(process.env.PATH);
// Prints: 'C:\Windows\system32;C:\Windows;C:\Program Files\node\'

process.env.PATH.split(path.delimiter);
// Returns ['C:\\Windows\\system32', 'C:\\Windows', 'C:\\Program Files\\node\\']
```

#### path.dirname(path)

- path [string]
- returns [string]

path.dirname()方法返回路径的文件夹地址，类似于Unix中dirname命令。末尾的目录分隔符会被忽略。详情参看path.sep。

举例：
```javascript
path.dirname('/foo/bar/baz/asdf/quux');
// Returns: '/foo/bar/baz/asdf'
```

#### path.extname(path)

- path [string]
- returns [string]

path.extname()返回路径的扩展名，从最后一个`.`开始一直到path路径字符串的末尾。如果path的最后一部分不包含`.`，或者path的basename以`.`开头，则返回一个空字符串。

举例：
```javascript
path.extname('index.html');
// Returns: '.html'

path.extname('index.coffee.md');
// Returns: '.md'

path.extname('index.');
// Returns: '.'

path.extname('index');
// Returns: ''

path.extname('.index');
// Returns: ''
```

如果传入的path不是字符串，则抛出类型错误。

#### path.format(pathObject)

