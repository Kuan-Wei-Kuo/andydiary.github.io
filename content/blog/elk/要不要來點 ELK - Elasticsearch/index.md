---
title: 要不來點 ELK - Logstash(Indexer) with Elasticsearch
date: "2023-03-18T23:00:00Z"
tags: ['ELK']
---

## 什麼是 Elasticsearch ?
Elasticsearch 是一套開源且基於 Apache lucene 的分散式搜尋引擎，因此搜尋效能非常好。通常我們會將資料儲放到 Elasticsearch 進行存儲與分析，在存儲部份我們可以將 Elasticsearch 當作一種 NoSQL 資料庫，也因 ES 是分散式的，意味著我們每個 ES 節點可以代管不同的分片，加速整體資料讀取效率。

## 裝個 Elasticsearch
### Edit elasticsearch configuration
```yaml
## elasticsearch.yml

network.host: 0.0.0.0
discovery.type: single-node
```

### Run elasticsearch
```bash
docker run -d \
-p 9200:9200 \
-p 9300:9300 \
-v $PWD/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml:ro \
elasticsearch:7.17.9
```

## Logstash(Indexer)
在上一章節，我們成功將資料丟到 Redis 了，接下來我們將嘗試把 Redis 的資料，丟到 Logstash(Indexer) 上，由 Indexer 幫我們解析資料，並且設定相關 Index。


### Edit pipeline configuration
```bash
mkdir -p ./logstash/pipeline
cd ./logstash/pipeline
vi traefik-indexer-pipeline.config
```

```conf
input {
  redis {
    data_type => "list"
    key => "traefik-log"
    host => "192.168.144.5"
    port => "6379"
  }
}

filter {
  dissect {
      mapping => {
        "message" => '%{source.address} %{traefik.access.user_identifier} %{user.name} [%{traefik.access.time}] "%{http.request.method} %{url.original} HTTP/%{http.version}" %{http.response.status_code} %{traefik.access.message}'
    }
  }
  date {
    match => ["traefik.access.time", "dd/MMM/yyyy:HH:mm:ss Z"]
	  remove_field => ["traefik.access.time"]
  }
}

output {
  elasticsearch {
    hosts => ["192.168.144.5:9200"]
	  index => "traefik-log-%{[host][name]}-%{+YYYY.MM.dd}"
  }
} 
```

接下來我們分析一下這個設定檔在做什麼事情

* Input: 從 Redis 中的 traefik-log 取得資料
* Filter: 使用 message 進行資料的 mapping，在這邊我們將會註記多個欄位加入我們的資料。然而我們為了讓 log 時間等於 timestamp 時間，因此我們將 traefik-log 的時間取代為 timestamp。
* Output: 將資料放入 ES 中，並且 index 規劃為 traefik-log-{hostname}-{date} 進行時間切割，這樣我們就能知道這筆 index 屬於哪台主機以及是哪一天的資料。

按照上一輪的範例，我們 pipeline 資料夾內應該要有兩個 config 檔案了。

```bash
andy@andy:~/blog-elk-demo/logstash/pipeline$ ls -al
-rw-rw-r-- 1 andy andy  650 Mar 18 13:37 traefik-indexer-pipeline.config
-rw-rw-r-- 1 andy andy  191 Mar 18 13:34 traefik-shipper-pipeline.config
```

### Run logstash
```bash
docker run -d -p 5000:5000 \
-v $PWD/pipeline:/usr/share/logstash/pipeline:ro \
logstash:7.17.9
```

## Testing
我們嘗試使用 Elasticsearch API 看看是否有資料進入。

```bash
curl -X GET "http://192.168.144.5:9200/_search?pretty"
```

我們將會看到類似以下的 JSON 回傳

```json
{
  "took" : 13,
  "timed_out" : false,
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "skipped" : 0,
    "failed" : 0
  },
  "hits" : {
    "total" : {
      "value" : 10000,
      "relation" : "gte"
    },
    "max_score" : 1.0,
    "hits" : [
      {
        "_index" : "traefik-log-617af695dd70-2023.03.04",
        "_type" : "_doc",
        "_id" : "11_09IYB4jZztLyLcEps",
        "_score" : 1.0,
        "_source" : {
          "url.original" : "/api/overview",
          "message" : "192.168.144.3 - - [04/Mar/2023:04:42:39 +0000] \"GET /api/overview HTTP/1.1\" 200 485 \"-\" \"-\" 540 \"api@internal\" \"-\" 0ms",
          "agent" : {
            "id" : "a0bf57a2-5430-4dae-9bc7-1e9280237456",
            "ephemeral_id" : "50fb1ad5-3f2a-40cf-8bf6-a4cfaf159217",
            "version" : "7.17.9",
            "type" : "filebeat",
            "hostname" : "617af695dd70",
            "name" : "617af695dd70"
          },
          "source.address" : "192.168.144.3",
          "http.request.method" : "GET",
          "user.name" : "-",
          "http.version" : "1.1",
          "http.response.status_code" : "200",
          "ecs" : {
            "version" : "1.12.0"
          },
          "log" : {
            "offset" : 64043,
            "file" : {
              "path" : "/home/andy/elk-demo/traefik/logs/access.log"
            }
          },
          "@version" : "1",
          "@timestamp" : "2023-03-04T04:42:39.000Z",
          "input" : {
            "type" : "log"
          },
          "traefik.access.user_identifier" : "-",
          "host" : {
            "name" : "617af695dd70"
          },
          "tags" : [
            "beats_input_codec_plain_applied"
          ],
          "traefik.access.message" : "485 \"-\" \"-\" 540 \"api@internal\" \"-\" 0ms"
        }
      },
	  ...
	]
} 
```

以上就可以證明我們將資料確實傳送到 Elasticsearch 了。

## 結論
在 DevOps 中，監控是不可或缺的一環，資料的分析以及蒐集都是為了讓系統更佳的穩定，並且在其中找出弱點加以修正。本次並沒有辦法很完全的展現 Elasticsearch 的一些特性，待以後有閒情逸致時再來詳細了解了。

感冒的一天，不太好受，文字中也許不是那麼完善，請各位體諒了。

## 參考
https://ithelp.ithome.com.tw/articles/10237875?sc=hot</br>
https://zh.wikipedia.org/zh-tw/Elasticsearch