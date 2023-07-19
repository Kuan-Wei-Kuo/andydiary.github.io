---
title: LeetCode 2413. Smallest Even Multiple
date: "2023-07-19T00:00:00Z"
tags: ['LeetCode']
---

## 題目位置
https://leetcode.com/problems/smallest-even-multiple

## 題目描述
Given a positive integer n, return the smallest positive integer that is a multiple of both 2 and n.
> 取得一個正整數 n，回傳與 n 與 2 的最小公倍數。

## 解題思路
這題就很簡單，只要你記得最小公倍數、最大公約數算法就可以解答出來。

### 最大公約數
因此來看這題，通常與 2 的最小公倍數不是 2 就是 1 可以對他進行整除，這就是最大公約數。那我們在來思考一下何種情況 2 的最大公約數會是 1 或者 2 呢?

其實也很簡單，就是是否能被 2 整除，如果為奇數最大公約數則是 1 反之則為 2。

### 最小公倍數
接下來我們就可以套公式，兩數之間的最小公倍數為 

```(num1 * num2) / 最大公約數```

對此題來說應該會是

```(2 * n) / 最大公約數```

## 程式碼
```java
public class Solution {

    public int smallestEvenMultiple(int n) {
        int gcd = 1;
        if(n % 2 == 0) {
            gcd = 2;
        }
        return (n * 2) / gcd;
    }

}
```

## Related Topics
```Math```
```Number Theory```

## 心得
我很討厭數學題，很多時候不清楚公式或者概念，基本上就會解答不出來。比如這題就是如此，我一時之間是忘記這兩個概念是什麼，畢竟平常工作很少使用到。

這種題目刷與不刷，似乎在一個奇妙的界線，可惜這是遊戲規則，還是多少看一下吧!