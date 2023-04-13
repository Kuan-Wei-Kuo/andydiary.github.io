---
title: "Java Concurrency #03 - 關於 synchronized lock 的那點事" 
date: "2023-04-14T00:30:00Z"
tags: ['Java', 'Concurrency']
---

## 為何需要鎖(Lock)
為了防止競爭條件(Race condition)，我們是需要加上 Lock 使其他 Thread 無法同時存取該資源，而 Lock 的作用就是提供一個同步的機制，也因如此我們可以確保 Multi thread 情況下不會互相干擾。

```console
Lock 的作用就是提供一個同步的機制，避免 Multi thread 的操作互相干擾。
```

### 物件鎖(Object Lock)
```java
public class Example01 {
    
    private int count = 0;

    public void increment() {
        synchronized(this) {
            count++;
        }
    }

    public synchronized int getCount() {
        return count;
    }

    public static void main(String[] args) throws InterruptedException {
        Example01 example = new Example01();

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

Object lock 通常用於同步非靜態方法或非靜態區塊使用，他是一種對象級的鎖，因此這種鎖適合使用在當我們需要保護 Instance 的資源時來使用。

### 類別鎖(Class Lock)
```java
public class Example02 {
    
    private static int count = 0;

    public  void increment() {
        synchronized(Example02.class) {
            count++;
        }
    }

    public static synchronized int getCount() {
        return count;
    }

    public static void main(String[] args) throws InterruptedException {
        
        Thread t1 = new Thread(() -> {
            System.out.println(Thread.currentThread().getName() + "-> start");

            Example02 example = new Example02();
            example.increment();

            System.out.println(Thread.currentThread().getName() + "-> end");
        });

        Thread t2 = new Thread(() -> {
            System.out.println(Thread.currentThread().getName() + "-> start");

            Example02 example = new Example02();
            example.increment();

            System.out.println(Thread.currentThread().getName() + "-> end");
        });

        Thread t3 = new Thread(() -> {
            System.out.println(Thread.currentThread().getName() + "-> start");

            Example02 example = new Example02();
            example.increment();

            System.out.println(Thread.currentThread().getName() + "-> end");
        });

        t1.start();
        t2.start();
        t3.start();
        t1.join();
        t2.join();
        t3.join();

        System.out.println(Example02.getCount());
    }

}
```

Class lock 是以類別為主的鎖，也就是說假設我們有 10 個 Example02，同時間只能有一個 Thread 訪問任一 Example02 的方法或區塊。如果我們要保護靜態資源，那麼就非常適合使用這種類別鎖。

### 鎖的粗細
由於 Class lock 的特性毫無疑問的是粗鎖，但 Object lock 就是細鎖嗎? 不，這並不一定。倘若從我們 Object lock 的範例來看，我們也是粗鎖，因為都是鎖在物件本身，也就代表 increment、getCount 方法無法同時使用。

讓我們來優化看看。

```java
public class Example03 {
    private int count = 0;

    private final Object objLock1 = new Object();
    private final Object objLock2 = new Object();

    public void increment() {
        synchronized(objLock1) {
            count++;
        }
    }

    public int getCount() {
        synchronized(objLock2) {
            return count;
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Example01 example = new Example01();

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

在這裡我們為了更好的併發性，我們宣告了兩個 final 私有物件，並使其分別讓 increment、getCount 使用，以分離我們原先的同一個物件鎖，加強併發效率。

## 結論
在這篇文章中，我們簡略的介紹 Java 最基礎的鎖，也就是 synchronized。然而我們除了上鎖外，還要注意鎖的粗細度，以免影響到併發效率，這是非常重要的一點，否則就喪失我們併發的意義了。

## 參考
https://chat.openai.com/chat<br>
https://medium.com/bucketing/java-concurrency-2-%E7%94%9A%E9%BA%BC%E6%98%AF%E9%8E%96-lock-7abeea1b800a<br>
https://howtodoinjava.com/java/multi-threading/object-vs-class-level-locking/<br>
https://www.baeldung.com/java-synchronization-bad-practices2