---
title: LeetCode 1115.  Print FooBar Alternately
date: "2023-02-03T23:00:00Z"
tags: ['LeetCode']
---

## 題目位置
https://leetcode.com/problems/print-foobar-alternately/

## 題目描述

Suppose you are given the following code:
> 假設你有以下程式碼

```java
class FooBar {
  public void foo() {
    for (int i = 0; i < n; i++) {
      print("foo");
    }
  }

  public void bar() {
    for (int i = 0; i < n; i++) {
      print("bar");
    }
  }
}
```

The same instance of FooBar will be passed to two different threads:
>  同一個 FooBar 實例將傳遞給兩個不同的 thread

* thread A will call foo(), while
* thread B will call bar().
> thread A 將調用 foo() 而 thread B 將調用 bar()

Modify the given program to output "foobar" n times.
> 修改程式碼並且以 "foobar" 輸出 n 次

## 解題思路
今天同事提供一題很不 leetcode 的 leetcode，讓我分享一下我的解題思路。

從題目中可以很明確的知道，是使用兩個 thread 進行 method 的呼叫，然而我們都知道 thread 的併發，我們並不知道哪個會先被啟動，有可能是 thread A 先啟動，也有可能是 thread B 先啟動，當我們思考到這邊的時候，答案就出來了。

也就是說，我們需要進行 lock，讓兩個 thread 中的工作互相等待彼此完成，並且要讓 thread A 先開始。 

## 程式碼
```java
class FooBar {
    private int n;
    private Lock lock;
    private Condition condition;

    private boolean isStarted = false;
    private String state = "foo";

    public FooBar(int n) {
        this.n = n;
        this.lock = new ReentrantLock();
        condition = lock.newCondition();
    }

    public void foo(Runnable printFoo) throws InterruptedException {
        lock.lock();
        isStarted = true;
        condition.signal();
        lock.unlock();

        for (int i = 0; i < n; i++) {
            lock.lock();

            if(state.equals("bar")) {
                condition.await();
            }

            // printFoo.run() outputs "foo". Do not change or remove this line.
            printFoo.run();
            
            state = "bar";
            condition.signal();
            lock.unlock();
        }
    }

    public void bar(Runnable printBar) throws InterruptedException {
        if(!isStarted) {
            lock.lock();
            condition.await();
            lock.unlock();
        }

        for (int i = 0; i < n; i++) {
            lock.lock();

            if(state.equals("foo")) {
                condition.await();
            }

            // printBar.run() outputs "bar". Do not change or remove this line.
        	printBar.run();

            state = "foo";
            condition.signal();
            lock.unlock();
        }
    }
}
```

## Related Topics
因為很不 leetcode 所以沒有 topic :D

## 心得
這題雖然在 medium 等級，但如果熟悉 **lock** 以及 **thread** 細節的夥伴，一定可以快速定位問題，就差如何實現。

我的實現方法使用 ReentrantLock 以及 Condition 機制，讓兩個 thread 工作內容互相等待，以達到 "foobar" 輸出 n 次。
1. 首要目標先確認 thread A 可以先執行，因此在 isStarted 為 false 的時候進行 thread B 的等待。
2. 建立 state 狀態，狀態有 foo、bar 兩種，當執行 bar 的時候， foo 將需要等待，直到 bar 執行完成，將 state 改為 foo 並且由 Condition 通知解除 await。以此類推，將可以得到以 "foobar" 的 n 次輸出。