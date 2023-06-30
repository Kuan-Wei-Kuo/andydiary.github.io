---
title: Docker container 所造成的硬碟空間不足
date: "2023-02-21T10:00:00Z"
tags: ['Docker']
---

## 事情是這樣的
在某年某月某一天，同事跑來跟我說測試機的 Docker Host 容量爆炸啦! 我第一步先打開 Docker Host 確認狀況，發現 Container 數量並沒不多，並且使用下面指令查詢 Docker 空間分佈:

```bash
sudo docker system df
```

得到的答案讓我覺得事情精彩了，Container、Image、Volume 並沒有花費多少空間，理應剩餘很多空間才對，這時候我只好去查一下，到底 Host 空間分佈是如何:

```bash
df -h
```

果然是根目錄已經滿，這時候我決定開大絕招，直接將根目錄中的 TOP 10 大的檔案找出來:

```bash
find / -type f -printf ‘%s %p\n’| sort -nr | head -10
```

好的，我們要準備看到 /var/lib/docker/containers/CONTAINER_ID/CONTAINER_ID-json.log 是如此地想要往前擠。

讓我們思考一下，是為何會發生這個問題，其實想一下也不難，每個 Container 其實都有自己的 system log，基本上這些 log 都會放在上述的路徑當中，因此我們要做的就是重新清空 log 並且在事後再 daemon.json 內加入 system log 的大小限制。

首先我們要清空 system log，但這前提請大家記得先確認可以清空，不要傻傻的。

```bash
sudo sh -c 'truncate -s 0 /var/lib/docker/containers/*/*-json.log'
```

當然清空後，我們得在 demon.json 中加上 log size limit 的設定。

```bash
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production_status",
    "env": "os,customer"
  }
}
```

之後請記得重新啟動 Docker，不要傻傻地以為這樣就好囉。

## 參考
https://docs.docker.com/config/containers/logging/configure/</br>
https://stackoverflow.com/questions/41091634/how-to-clean-docker-container-logs