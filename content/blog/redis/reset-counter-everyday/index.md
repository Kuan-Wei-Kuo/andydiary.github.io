---
title: SpringBoot 與 Redis 相遇
date: "2023-07-03T23:50:00Z"
tags: ['SpringBoot','Redis']
---

## 章節
CH1. SpringBoot 與 Redis 相遇<br>
CH2. SpringBoot 與 Redis 相遇 - Jackson 序列化設定<br>
CH3. SpringBoot 與 Redis 相遇 - 分散式鎖<br>
CH4. SpringBoot 與 Redis 相遇 - 超賣情境

## 前言
因為行動裝置的普及化，人手一支手機皆可上網進行網站操作，造就現代網站的流量日漸升高。在訪問次數如此平凡的情況下，對於資料庫造成莫大的負擔，為了解決這個問題，我們通常會採用 Cache 來讓我們加速訪問，減少資料庫的負擔，而最常見的 Cache Server 也就是我們常聽到的 Redis。

本文將會簡單地介紹 Redis 以及如何與 SpringBoot 3 進行整合。

## What is Redis
Redis 是一套開源且高性能的資料庫系統，資料通常存放於記憶體中，也提供持久化機制。而 Redis 主要使用 Kev-Value 資料結構來進行資料儲存，所以我們也可以說它是一種 NoSQL。

## Maven dependencies
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-pool2</artifactId>
</dependency>
```

在這邊可以注意一下，我們除了引用 spring-boot-starter-data-redis 也一併使用了 commons-pool，原因在於接下來我們的設定有使用到 pool。

除了上述以外，大家可以看到我們並沒有使用到 jedis，因為目前 SpringDataRedis 預設是使用 lettuce 作為預設使用的 library。

## Yaml Configuration
```yaml
spring:
  application:
    name: redis-example
  data:
    redis:
      host: 192.168.145.10
      port: 6379
      database: 0
      timeout: 1000
      lettuce:
        pool:
          min-idle: 0
          max-idle: 150
          max-wait: -1
          max-active: 150
```

在這邊我們簡單的介紹 pool 做了那些設定。

* min-idle: Connection Pool 最小的空閒連接數，只有在正數時有效。
* max-idle: Connection Pool 最大空閒連接數，若為負數代表不設限。
* max-wait: 當 Connection Pool 數量不足時，會有一個等待時間，若超出這個時間將會拋出錯誤，若為負數則不設限。
* max-active: Connection Pool 最大能夠分配的數量，若為負數則不設限。

## Test
```java
@Autowired
private RedisTemplate<String, String> redisTemplate;

@Test
public void testRedisSet() {
    // 嘗試設定一個 Key 為 Hello，Value 為 World 的資料
    redisTemplate.opsForValue().set("Hello", "World");

    // 嘗試取得 Key 為 Hello 的資料，並驗證其 Value 是否為 World
    assertEquals(redisTemplate.opsForValue().get("Hello"), "World");
}
```

在預設下，我們可以使用 RedisTemplate 來進行測試，主要動作為設定一個 Key 為 Hello，Value 為 World 的資料，並且測試其數值是否正確。

## 結論
至此我們簡單地完成了 Redis 與 SpringBoot 的整合，並且嘗試的操作，後面幾篇文章我們將會更加進一步的了解 Redis。