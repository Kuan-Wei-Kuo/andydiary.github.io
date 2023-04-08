---
title: "Java Concurrency #01 - Thread 的基礎觀念" 
date: "2023-04-03T02:00:00Z"
tags: ['Java', 'Concurrency']
---

在講解 Concurrency 時，我們有必要去理解 Thread 相關知識，因此在此篇文章中，我們講快速理解一遍關於 Thread 的那些事。

## 什麼是 Thread
要講 Thread 我們就得先談到 Process，我們每一個運行的程序就可稱為為 Process，而 Thread 是 Process 中的執行單位。不過這樣還是有點模糊，我們直接清楚的條列出來以下重點

* 一個 Process 中可以包含一個或多個 Thread。
* 不同的 Process 中是獨立的，且不可共享資源。
* 同一 Process 中的不同 Thread 可以共享 Process 的資源。

除了上述 Process 與 Thread 的說明，接下來我們也需要知道，JVM 與 Process 的關係，重點如下

* Process 其實就是一個運行的程序，當我們 JVM 啟動時，系統就會幫我們分配一個 Process，這個 Process 包含了 JVM 所需的資源，而我們也可以用 JVM 參數來限制 Process 記憶體的劃分。
* 在 JVM 啟動時，我們會啟動一個 Main Thread 來進行應用程序的操作。

## 在 Java 中應用 Thread
若我們在 Java 裡面要應用 Thread 的話，大概可以包刮以下幾中方式

1. 繼承 Thread 類別
2. 實現 Runnable 介面
3. 使用 Callable 與 Future
4. 使用 CompletableFuture

接下來我們就一一實現他。

### 1. 繼承 Thread 類別
```java
public class Example01 extends Thread {
    
    public void run() {
        System.out.println("MyThread running");
    }

    public static void main(String[] args) {
        Example01 thread = new Example01();
        thread.start();
    }

}
```

直接繼承 Thread 的方式最為簡單，但我們並不建議使用 Thread 進行設計，原因有以下

* Java 不支持多重繼承，當我們設計好一個 Thread 時，也就代表我們無法繼續的擴展或者繼承其他類。
* Runnable 介面僅表示一個任務，我們很好的將邏輯分離於此處，這也意味著我們可以很好的重用任務。
* 在 Java 中，當我們繼承了，也就代表我們要修改與改進行為，但往往我們繼承 Thread 僅進行 Runnable 的實現。

除了上述三點，我相信還有一些大神可以找出更多點，但目前個人心得如上。

### 2. 實現 Runnable 介面
```java
public class Example02 implements Runnable {
    
    public void run() {
        System.out.println("MyRunnable running");
    }

    public static void main(String[] args) {
        Example02 runnable = new Example02();
        Thread thread = new Thread(runnable);
        thread.start();
    }

}
```

可以看到我們在 runnable 僅需實現 run 方法，並且邏輯更好的與 Thread 拆分，我今天甚至可以直接使用多個 Thread 來一起執行任務，又或者可以自己進行呼叫來重用任務。

### 使用 Callable 與 Future
```java
public class Example03 implements Callable<String> {
    
    public String call() throws Exception {
        Thread.sleep(5000);
        return "Hello, world!";
    }

    public static void main(String[] args) throws Exception {
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<String> future = executor.submit(new Example03());
        System.out.println("Waiting for result...");
        String result = future.get();
        System.out.println("Result: " + result);
        executor.shutdown();
    }

}
```

在這邊我們可以看到我們大名鼎鼎的 Future 了，在 Java 5 開始提供的 Future 可以讓我們進行任務等待，其實也就是阻塞式獲取執行結果。

### 使用 CompletableFuture
```java
public class Example04 {

    public static void main(String[] args) throws InterruptedException, ExecutionException {
        CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
            return 1 + 2;
        });
        
        future.thenAcceptAsync(result -> {
            System.out.println("計算結果為：" + result);
        });
        
        System.out.println("請稍等，計算結果正在計算中...");
    }

}
```

在這個例子中我們建立一個 CompletableFuture，並且其計算 1 + 2 結束後，會調用 thenAcceptAsync 來讓我們達成非阻塞式的計算，其運作結果如下

```console
請稍等，計算結果正在計算中...
計算結果為：3
```

可以看到我們第一行打印的字樣為"請稍等，計算結果正在計算中..."，也就代表我們並沒有等待 future 結束，並且我們在另外一個 Thread 執行 thenAcceptAsync 內容。

## 結論
本篇文章簡單的介紹 Process、Thread、JVM 三者的關係，並且我們實作四種在 Java 中使用 Thread 的方法。在後續我們將進行對 Java Concurrency 更深入的研究與學習。

## 參考
https://datacadamia.com/os/process/process<br>
https://medium.com/bucketing/java-concurrency-0-%E9%A0%90%E5%85%88%E7%9F%A5%E8%AD%98-338cd98604c2<br>
https://www.geeksforgeeks.org/main-thread-java/