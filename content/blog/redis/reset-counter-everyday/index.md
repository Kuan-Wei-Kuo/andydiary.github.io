---
title: 使用 Redis 將計數每天重置
date: "2023-08-21T23:00:00Z"
tags: ['Redis']
---

## Introduction
最近開發到一個需求，每次建立資料都會使用[日期]+[流水號]來進行編號，其中流水號每天都會進行刷新。想到這種需求，大家第一眼可能會想將流水號建立在資料庫，但安迪想偷懶，利用 Redis 的 incr、expire 功能來達成目標。

## Code
```java
public Long incr(String key, Long expireSeconds) {
  Long sequence = redisTemplate.opsForValue().increment(key, 1);
  
  if (sequence != null && sequence == 1) {
    redisTemplate.expire(key, expireSeconds, TimeUnit.SECONDS);
  }

  return sequence;
} 

public Long getExpireSeconds() {
  Calendar calendar = Calendar.getInstance();
  calendar.add(Calendar.DAY_OF_MONTH, 1);
  calendar.set(Calendar.HOUR_OF_DAY, 0);
  calendar.set(Calendar.MINUTE, 0);
  calendar.set(Calendar.SECOND, 0);
  calendar.set(Calendar.MILLISECOND, 0);
  return (calendar.getTimeInMillis() - System.currentTimeMillis()) / 1000L;
}
```
稍微解釋一下程式碼，當呼叫 incr 方法時，我們會使用一組 Key 與 Redis 通知，若查無 Key 則將會返回 1 並且建立 Key，反之則將返回新增後的值。

當返回值後，我們就可以開始判斷，若 sequence 等於 1 的時候，也代表這筆 Key 是第一次建立，那我們將會設定其過期時間。

也許有眼尖的夥伴會說，為何不先判斷 Redis 是否有 Key 在來進行初始化呢? 當然可以，但是動作將會拆成兩步驟，若今天系統為併發系統，那麼這個方式並不能保證原子性，這也是為何安迪選擇使用 Redis 來實作該功能，因為 Redis 的 incr 功能是原子性的，利用 incr、expire 兩種功能，我們就能快速地達到要求，這也算是安迪偷懶了一下。

## 結論
這次安迪簡單的分享這個方式，我相信有更多好的方式，但在目前專案的緊急階段，我選擇了可以讓我相對安全的快速交付功能。

也許這麼說會得罪一些人，但我認為有時候工程師也需要停止爛漫，在工作中選擇當下最適合的解法即可，後續我們可以在使用私底下時間進行分析與研究，這是相對安全的方式，企業獲利與個人成長有時候是非常衝突的。