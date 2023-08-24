---
title: SpringBootTest 如何跳過 @Configuration
date: "2023-08-25T00:00:00Z"
tags: ['Spring']
---

## Introduction
最近在撰寫整合測試時，在思考有沒有辦法加快整合測試的速度，當然首當其衝的就是，當某些測試不需要 Redis、MQ 連線時，全部略過啟用，可是查了許多資料，安迪我真的找不到一個簡單的方式，接下來就讓我分享一下我是如何跳過 @Configuration 的自動載入。

## Solution
今天我們有一個 MyService 服務要進行測試，但在 SpringBootTest 的情況下，會自動載入相關 @Configuration，如果安迪不想讓 MQTT 在測試時也嘗試連線，我們應該如何使用。

首先我們需要建立一個 TestMqttConfiguraion

```java
@TestConfiguration
public class TestMqttConfiguration {

    @MockBean
    MessageProducer inbound;

}
```

上述實際用途就是相 MQTT 中的啟動入口利用 @MockBean 覆蓋，讓其略過啟動。

接下來我們可以看看 MyService 應該如何撰寫。

```java
@SpringBootTest
@AutoConfigureTestDatabase(connection = EmbeddedDatabaseConnection.H2)
@Import(TestMqttConfiguration.class)
public class MyServiceTests {

    // do something...

}
```

這邊可以看到我們 Import 剛剛建立的 TestMqttConfiguration，其實今天將 TestMqttConfiguration 內的 MessageProducer 放到這邊進行 @MockBean 也是行得通，概念上是一樣的，只是我們專門建立一個 Class 可以讓後續其他也需要略過啟動的測試可以一起使用。

## Review
目前這個方法網路上有不少的答案，但有時候並沒有說明清除，其根本思路就是利用 @MockBean 方式來跳過某些 @Configuraion 所需要的 Bean 以此來達到不啟用的動作。