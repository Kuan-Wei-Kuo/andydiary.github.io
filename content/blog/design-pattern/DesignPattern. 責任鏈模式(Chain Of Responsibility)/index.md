---
title: DesignPattern. 責任鏈模式(Chain Of Responsibility)
date: "2022-12-03T21:48:00Z"
tags: ['DesignPattern']
---

## 責任鏈模式(Chain Of Responsibility)
責任鏈模式基本上是由一個命令對象與處理對象組成，每一個處理對象都將執行一個命令並且呼叫下一個處理對象，以達到鏈結的效果。

## 例子
我們需要一個處理器介面類別

```java
public interface Handler {
	
	boolean execute();

}
```

接下來，我們需要建立幾個簡單的處理器，並且印出相關字串。

```java
public class OneHandler implements Handler {

	@Override
	public boolean execute() {
		System.out.println("One...");
		return true;
	}
	
}

public class TwoHandler implements Handler {

	@Override
	public boolean execute() {
		System.out.println("Two...");
		return true;
	}
	
}

public class ThreeHandler implements Handler {

	@Override
	public boolean execute() {
		System.out.println("Three...");
		return true;
	}
	
}
```

我們有了One、Two、Three三種處理器，接下來需要創建鏈的基礎類別。

```java
public class Chain {

	public Handler handler;
	
	public Chain nextChain;

	public Chain(Handler handler) {
		this.handler = handler;
	}

	public void setNextChain(Chain nextChain) {
		this.nextChain = nextChain;
	}
	
	public void execute() {
		if(handler.execute()) {
			if(nextChain != null) {
				nextChain.execute();
			}
		}
	}
	
}
```

由鏈的基礎類別我們可以看到，我們使用一個處理器以及一個鏈組成一個責任鏈類別，當然這些類別可以有更多的客製化，例如在execute函數中加入其他參數，又或者處理器可以放在exexute中進行，利用這種方式即可將context進行鏈結。

不過這個範例中，我們用簡單易懂的方式進行即可，基本上就是處理器觸發時，會回傳一個布林值，該值將會影響是否要繼續進行下一個鏈結的觸發。

接下來就讓我們展示如何使用這個鏈結。

```java
public class AppRun {

	public static void main(String[] args) {
		Chain chain1 = new Chain(new OneHandler());		
		Chain chain2 = new Chain(new TwoHandler());
		Chain chain3 = new Chain(new ThreeHandler());

		chain1.setNextChain(chain2);
		chain2.setNextChain(chain3);
		
		chain1.execute();
	}
	
}
```

我們可以觀察到，chain1~chain3都建立了各自的實例，並且以chain1->chain2->chain3的方式進行鏈結，運行結果如下。

```console
One...
Two...
Three...
```

## 結論
儘管責任鏈模式有許多優點，例如鬆散耦合、職責分配靈活、對象簡化等等，可是我們不得不注意一些事項，避免日後造成系統上的問題。
基本上責任鏈模式很容易因為不注意的情況，導致遞迴的狀況發生，要注意使用。
為了保持鏈的一致性，盡量保持一個處理器與命令對象來組成一個鏈。
鏈結過多時，不易進行維護，導致維護成本較高。
由於鏈結過多時，一旦發生Deep stack traces，對於效能是有影響的。

## 參考
https://en.wikipedia.org/wiki/Chain-of-responsibility_pattern

https://www.baeldung.com/chain-of-responsibility-pattern