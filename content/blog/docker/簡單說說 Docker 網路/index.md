---
title: 簡單說說 Docker 網路
date: "2023-07-011T00:50:00Z"
tags: ['Docker']
---

## 事情是這樣的
某一天我突然發現 Docker 主機連不到 Private Registry 了，原先還以為是公司防火牆政策沒有開通，也請主管幫忙進行開通。而過了幾天，同事跑來跟我說，會不會其實是 Docker 的網路衝突到了，導致我們請求都走錯網卡，我也尋思一想，似乎有類似的經驗，接下來就讓我們簡單說說 Docker 網路。

## Docker 的網路認知
Docker network drivers 有幾種類別，分別為 Bridge、Overlay、Host、IPvlan、Macvlan、None (no networking)，下面讓我們簡單的說明這幾種網路類別。

### Bridge
橋接應該會是我們最熟悉的網路類別，我們可以看到有硬體橋接、軟體橋接。但對 Docker 是軟體橋接，允許同一橋接網路的容器互相通訊，反之則無法進行通訊。

### Overlay
如果有使用 Swarm 的夥伴，應該對於 Overlay 類別有一定的了解。當初始化 Swarm 時，將會自動建立兩個網路，分別為以下:

* ingress: 若我們 Swarm 網路沒有指定時，將會預設用此網路。
* docker_gwbridge: 負責溝通在 Swarm 內的各個 Docker daemon。

說了這麼多，簡單的說就是 Overlay 類別可以讓我們在不同的 Docker daemon 進行容器間的通訊，因此當我們 Swarm 內有兩個 Docker daemon，若我們想要讓這兩個不同 Daemon 的容器互相溝通，就必須使用 Overlay 網路進行通訊。

### Host
在這種網路下，Container 將會尚失其隔離性，因為你將直接在 Host 進行開放，且你並不會被分配到 IP，所謂的 Port 對應並不會在這時候發生。

## 進階版的 IPvlan 與 Macvlan
小夥伴們很抱歉，因為小弟這兩種網路模式並沒有經驗，因此無法給於說明。而小弟也發現這兩種模式的文章也不多，所以必須得實作並且與大大的文章並行，才能更加了解這兩種模式。

## 結論
這次我們簡單地帶過常用的幾種網路模式，至於遺珠 IPvlan 與 Macvlan 只能夠過後續的努力補足知識。在此感嘆軟體的世界真是讓我捲爆，希望大家在卷的同時也不要忘記生活。

## 參考
https://chat.openai.com/</br>
https://docs.docker.com/network/</br>
https://ithelp.ithome.com.tw/articles/10193457
