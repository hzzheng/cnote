---
title: "免费启用HTTPS"
date: "2017-11-20"
---

昨天花了一些时间把原来使用Ghost搭建的博客，迁移到了Gatsby。发现之前使用[Let’s Encrypt](https://letsencrypt.org/)的免费方案已过期，于是重新去[酷壳](https://coolshell.cn/articles/18094.html)找了一下左耳朵耗子老师的那篇文章。因为使用的系统和左老师不一样，并且启用过程遇到了一点小坑，所以也记录一下。

1. 打开[https://certbot.eff.org](https://certbot.eff.org) 网站
2. 选择你使用的web服务器和操作系统，我的是`nginx`和`CentOS 6`
3. 选择后会跳转到安装教程页，照着做一遍就可以

以我的选择为例，上面第三步需要执行的命令如下:

```bash
# 下载
wget https://dl.eff.org/certbot-auto
chmod a+x certbot-auto

# 更改nginx配置
sudo ./certbot-auto --nginx
```

在执行最后一条命令的时候报了如下错误：

```bash
/root/.local/share/letsencrypt/lib/python2.6/site-packages/cryptography/init.py:26: DeprecationWarning: Python 2.6 is no longer supported by the Python core team, please upgrade your Python. A future version of cryptography will drop support for Python 2.6
DeprecationWarning
Saving debug log to /var/log/letsencrypt/letsencrypt.log
The nginx plugin is not working; there may be problems with your existing configuration.
The error was: NoInstallationError()
```

google后在certbot仓库的[issue](https://github.com/certbot/certbot/issues/4937)下面找到了解决办法。报错是因为找不到nginx，配置一下软链即可：

```bash
ln -s /usr/local/nginx/sbin/nginx /usr/bin/nginx
ln -s /usr/local/nginx/conf/ /etc/nginx
```

然后重新执行：

```bash
sudo ./certbot-auto --nginx
```

免费的certbot证书90天会过期，所以可以通过`crontab -e`去定时更新，相关配置如下(每月都强制更新一次)：

```bash
# 注意：请使用自己的certbot-auto目录
0 0 1 * * /home/certbot-auto renew --force-renewal
5 0 1 * * nginx -s reload
```


