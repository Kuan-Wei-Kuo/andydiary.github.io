---
title: 玩玩 Completablefuture
date: "2023-04-01T02:30:00Z"
tags: ['Java']
---
* Git項目位置: https://github.com/Kuan-Wei-Kuo/completablefuture-demo

Java 8 開始引入 Completablefuture，基本上就是針對 Future 進行加強，我們可以在非同步任務完成或發生異常時，自動調用 Callback 方法，為何我稱為 Callback 呢 ? 這不得不說...非常的 Functional，接下來讓我們看看原因為何。

## 來一個簡單的玩意
```java
public class Example01 {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(2000);
                System.out.println("future1 -> " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "future1 is done";
        });

        future1.thenAccept(message -> {
            System.out.println("thenAccept1 -> " + message);
        });

        future1.thenAccept(message -> {
            System.out.println("thenAccept2 -> " + message);
        });

        String message = future1.get();
        System.out.println(message);
    }
}
```

在這個範例，我們建立了一個 future1 物件，裡面我們等待了 2 秒，並且丟出相關字串，結果如下

```console
future1 -> ForkJoinPool.commonPool-worker-1
thenAccept1 -> future1 is done
thenAccept2 -> future1 is done
future1 is done
```

接下來讓我們看看細節， thenAccept 是一個同步方法並且會回傳 future1 的結果，也就是 future1 is done，而因為我們針對 future1 建立了兩個 thenAccept 方法，因此我們將會得到上面的答案。

我們知道為何會這樣列印出字串，那如果有一天我們的 thenAccept 需要使用非同步呢? 那麼也很簡單，我們可以改成 thenAcceptAsync 就變成非同步了，讓我們看看結果會變成如何。

```console
future1 -> ForkJoinPool.commonPool-worker-1
future1 is done
thenAccept2 -> future1 is done
thenAccept1 -> future1 is done
```

可以看到我們並沒有按照程式順序執行，也就代表我們非同步成功了，當然 future1 能接的也不只 thenAccept，Completablefuter 提供如 thenApplyAsync、thenRunAsync 等等方式，讓我們可以因應不同情境，建立更好的鏈結。

## Oops! 發生錯誤
```java
public class Example03 {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(2000);
                System.out.println("future1 -> " + Thread.currentThread().getName());

                throw new RuntimeException("future1 is failure");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            return "future1 is done";
        });

        CompletableFuture<String> future2 = future1.exceptionally(e -> {
            System.out.println("exceptionally -> " + e.getMessage());
            return "future1 occur exception";
        });
        
        System.out.println(future2.get());  
    }

}
```

我們也知道，寫程式肯定要包含例外處理，在 Completablefuture 中也提供了一系列的錯誤處理方式，在這邊我們使用最簡單的 exceptionally 來實作，結果如下

```console
future1 -> ForkJoinPool.commonPool-worker-1
exceptionally -> java.lang.RuntimeException: future1 is failure
future1 occur exception
```

程式碼跟剛剛大同小異，但我們丟出了 RuntimeException 來讓我們運行失敗，來讓我們達成效果。而大家還記得我上述有說**鏈結**兩字，所以我們可以看到 future1.exceptionally 會丟出一個 CompletableFuture 物件，我們稱之為 future2，其錯誤處理很簡單的印出字串以及回傳處理結果，這是一個簡潔的使用方式。

## 誰先來的 Either
```java
public class Example04 {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        Random rand = new Random();
        
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(1000 + rand.nextInt(1000));
                System.out.println("future1 -> " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            return "future1 is done";
        });

        CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(1000 + rand.nextInt(1000));
                System.out.println("future2 -> " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "future2 is done";
        });

        CompletableFuture<String> future3 = future1.applyToEitherAsync(future2, message -> {
            return "future3 -> " + message;
        });
        
        System.out.println(future3.get());  
    }
}
```

Either 基本上表示，在任一 CompletionStage 完成，就會往下執行 action，因此我們看看該範例，兩個 Stage Thread Sleep 時間不固定，誰先回來就會顯是誰的回傳值，假設我們跑了兩次，結果可能如下

```console
T0:
future1 -> ForkJoinPool.commonPool-worker-1
future3 -> future1 is done

T1:
future2 -> ForkJoinPool.commonPool-worker-2
future3 -> future2 is done
```

## 全部一起來吧!
```java
public class Example05 {
    public static void main(String[] args) throws InterruptedException, ExecutionException {
        Random rand = new Random();
        
        CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(1000 + rand.nextInt(1000));
                System.out.println("future1 -> " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

            return "future1 is done";
        });

        CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> {
            try {
                Thread.sleep(1000 + rand.nextInt(1000));
                System.out.println("future2 -> " + Thread.currentThread().getName());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            return "future2 is done";
        });

        CompletableFuture<Void> future3 = CompletableFuture.allOf(future1, future2);
        CompletableFuture<Object> future4 = CompletableFuture.anyOf(future1, future2);
        System.out.println(future3.get());
        System.out.println(future4.get());
    }
}
```

有時候我們可能不會一步一步執行，我們可能想要一次執行全部並且等待，這時候就得使用到 allOf 了，若使用 allOf 將會等待所有 Future 回來才進行後續動作。反之，當我們今天想要任一個回來即可，則是使用 anyOf。

按照上述的說明以及程式碼，我們一樣執行兩次看看，結果如下

```console
T0:
future2 -> ForkJoinPool.commonPool-worker-2
future1 -> ForkJoinPool.commonPool-worker-1
null
future2 is done

T1:
future1 -> ForkJoinPool.commonPool-worker-1
future2 -> ForkJoinPool.commonPool-worker-2
null
future1 is done
```

可以看到使用 allOf 確實有等待全部完成，而 anyOf 得到的答案有可能會是不同的，看哪個 Future 先執行完成，則印出該字串。

## 結論
謝謝大家把文章看完，看完之後可以看到整體 Completablefuture 使用了許多 Function 介面來執行，這種方式體現了 Functional 的強大，我們可以利用這種方式建立更簡單明瞭的請求鏈結。

當然，Completablefuture 的功能還不只如此，還有更多組合應用沒有說明到，可見這個特性之強大。

## 參考
https://www.liaoxuefeng.com/wiki/1252599548343744/1306581182447650<br>
https://openhome.cc/Gossip/CodeData/JDK8/CompleteableFuture.html