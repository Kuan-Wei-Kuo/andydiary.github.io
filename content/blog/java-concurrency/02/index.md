---
title: "Java Concurrency #02 - 可見性、原子性、有序性" 
date: "2023-04-08T02:00:00Z"
tags: ['Java', 'Concurrency']
---

可見性、原子性和有序性是多線程編程中的三個重要概念，它們是保證多線程程序正確性的三個基本要素。

## 可見性
在多線程編程中，可見性是指當一個線程修改共享變量的值時，該修改對其他線程是否可見的問題。如果修改對其他線程是可見的，則說明該修改是「可見的」；如果不可見，則說明該修改是「不可見的」。

```console
在多個 Thread 操作的情況下，任一 Thread 修改變數時，其餘 Thread 可看見修改後的變數
```

### 可見性範例
```java
public class Example01 {
    private volatile boolean flag = false;

    public void setFlag() {
        flag = true;
    }

    public void loopUntilFlagIsSet() {
        while (!flag) {
            // do nothing
        }
        System.out.println("Flag is set!");
    }

    public static void main(String[] args) {
        Example01 example = new Example01();

        // start a new thread to loop until flag is set
        new Thread(() -> {
            example.loopUntilFlagIsSet();
        }).start();

        // set the flag after a short delay
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        example.setFlag();
        System.out.println("Flag is now set to true.");
    }
}
```
在這個範例中，我們有一個 flag 的變數，在 main 執行時，會開啟一個 sub-thread 並且呼叫 loopUntilFlagIsSet 進行 while 等待，過一秒後，我們將 flag 設定為 true，嘗試關閉等待。

若今天沒有宣告 volatile 時，我們將有機會看到 while 迴圈並無跳出，這是因為我們並無法保證 sub-thread 執行時，對於 flag 的可見性，因此變量聲明為 volatile 變數，因此 JVM 保證所有執行緒都能夠及時看到 flag 變數的最新值，從而解決了可見性問題，保證了程序的正確性。

## 原子性
原子性是指一個操作是不可中斷的，即在該操作執行期間，不會被其他線程干擾。這個操作要麼執行完成，要麼沒有執行。在多線程編程中，原子性通常是使用原子變量來實現的。

```console
在一個操作中，不是全部執行成功，就是全部執行失敗
```

### 原子範例
```java
public class Example02 {
    
    private int count = 0;

    public synchronized void increment() {
        count++;
    }

    public synchronized int getCount() {
        return count;
    }

    public static void main(String[] args) throws InterruptedException {
        Example02 example = new Example02();

        Thread t1 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                example.increment();
            }
        });

        Thread t2 = new Thread(() -> {
            for (int i = 0; i < 10000; i++) {
                example.increment();
            }
        });

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println(example.getCount());
    }

}
```
在這個例子中，我們創建了兩個執行緒，分別對 count 進行加1操作。由於 increment() 方法都是 synchronized 方法，因此這兩個執行緒可以安全地對 increment 進行操作，不會出現競爭條件(race condition)等問題。最後，我們獲取 count 值，應該為 20000，表明操作是安全的。

## 有序性
一般而言，程式碼是從上至下來執行，實則不然，這時候我們就要探討到 Java Model Memory 中的 Reordering 的問題。實際上 JMM 允許編譯器與處理器進行指令重排(Instruction Reorder)，來優化執行效率。

當然，這樣的重排不會影響單執行序，這也是為何在併發時，我們需要了解 synchronized、volatile 等方式，來讓我們達成有序性。

```console
在單執行序下，通常不被指令重排影響，但在併發時，我們卻不能保證指令重排後的順序正確性。
```

## 結論
本篇文章我們簡單的了解可見性、有序性、原子性三個在併發中不可或缺的概念，並且實作了相關程式，在下一篇章我們將開始研究 Lock 機制該如何使用。

## 參考
https://chat.openai.com/chat<br>
https://zh.wikipedia.org/zh-tw/%E7%AB%B6%E7%88%AD%E5%8D%B1%E5%AE%B3<br>
https://www.jianshu.com/p/cf57726e77f2<br>
https://medium.com/bucketing/java-concurrency-1-%E5%9C%A8%E9%96%8B%E5%A7%8B%E5%AF%ABcode%E5%89%8D%E5%85%88%E4%BA%86%E8%A7%A3%E4%B8%80%E4%B8%8Bconcurrency%E7%9A%84%E5%9F%BA%E7%A4%8E-8d1a6694eeff<br>
http://jeremymanson.blogspot.com/2007/08/atomicity-visibility-and-ordering.html