---
title: "Java Concurrency #05 - Thread 的生命週期" 
date: "2023-04-23T20:30:00Z"
tags: ['Java', 'Concurrency']
---

說來慚愧，儘管年資已老，我卻也不了解 Thread 的生命週期，此次就讓我們了解一下 Thread 生命週期為何。

## Thread 有分別
一般而言 Thread 分為 User-thread 以及 Kernel-thread，我們在 Java 中使用的就屬於 User-thread，由 JVM 進行管理，接下來讓我們看看差別。

### User-thread
User-thread 是由 Thread library 建立，基本上由應用程式自行管理，也因此 OS 並無法得知 Thread 的存在。舉個例子，當我們想要確認 Thread 狀況，一般而言我們會透過 JConsole 來看看 Thread 運行狀況，因為應用程式內的 Thread 對 OS 來說是不可見的。

### Kernel-thread
Kernel-thread 顧名思義就是由 OS 層建立以及管理的，當然 Kernel level 操作起來是相當複雜的，這邊我也不是專家，就不好說太多了，詳細資訊可能要去讀一下恐龍本以及相關文章才可以了解更加深入。

## Java thread 生命週期

![](./threadLifeCycle.jpg)
圖片取自於(https://www.geeksforgeeks.org/lifecycle-and-states-of-a-thread-in-java/)

在 Java thread 執行過程中，通常會處在以下任一狀態<br><br>
    1. New - 當 Thread 被建立時，其狀態為 New，但 Thread 中的程式碼尚未開始運行。<br><br>
    2. Runnable - 準備好可運行時，又或者 Thread 正在運行中，其狀態為 Runnable。由於 thread scheduler 負責進行資源調度，通常會運行一段時間會暫停，將轉換到另外一個 Thread 執行，以此類推。<br><br>
    3. Blocked - 如果需要獲取鎖進行排隊時，當會進入該狀態，且其不會占用 CPU 資源。<br><br>
    4. Waiting - 如果使用 wait() 方法進行時，即進入該狀態，其不會占用 CPU 資源。<br><br>
    5. Timed Waiting - 通常我們使用 Thread.sleep 方法就是屬於 Timed waiting 狀態，並且其不會占用 CPU 資源。<br><br>
    6. Terminated - 顧名思義就是執行結束。

接下來讓我們使用程式碼來玩看看 Java thread 狀態吧!

```java
public class Example01 implements Runnable {
    
    @Override
    public void run() {
        System.out.println("2. Thread State: " + Thread.currentThread().getState());

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        Thread thread = new Thread(new Example01());

        System.out.println("1. Thread State: " + thread.getState());

        thread.start();

        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("3. Thread State: " + thread.getState());

        try {
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.out.println("4. Thread State: " + thread.getState());
    }

}
```

運行後結果如下

```console
1. Thread State: NEW
2. Thread State: RUNNABLE
3. Thread State: TIMED_WAITING
4. Thread State: TERMINATED
```

在這邊我們可以看到，在建立 Thread 時，狀態為 New，後續當我們啟動 Thread 時，狀態更改為 Runnable，後續進行 Sleep 可看到 Time waiting 的產生，到最後使用 Join 等待 Thread 執行結束的 Terminated。

至此我們應該能夠更了解 Thread 的生命週期了。

## 結論
這次我們初步的了解 Thread 區分為 User-thread、Kernel-thread，嘗試的使用 Java 建立 Thread 並且控制其狀態。在這邊我們也可以說對 Thread 有一個非常初步的了解。

不過此次寫這篇文章也僅僅是做個了解，我們常常也僅僅是開開 Thread 卻也沒有去了解，但這種基礎面的東西，可能時間一久就又忘記了，希望這篇文章可以幫助再度遺忘的同行們。

## 參考
https://chat.openai.com/chat<br>
https://www.geeksforgeeks.org/difference-between-user-level-thread-and-kernel-level-thread/<br>
https://medium.com/@yovan/os-process-thread-user-kernel-%E7%AD%86%E8%A8%98-aa6e04d35002<br>
https://ithelp.ithome.com.tw/articles/10204372<br>
https://medium.com/bucketing/java-concurrency-4-%E5%9F%B7%E8%A1%8C%E7%B7%92%E7%9A%84%E7%94%9F%E5%91%BD%E9%80%B1%E6%9C%9F-thread-lifecycle-6f633bd3089c<br>
https://www.geeksforgeeks.org/lifecycle-and-states-of-a-thread-in-java/