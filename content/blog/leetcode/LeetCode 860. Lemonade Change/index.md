---
title: LeetCode 860. Lemonade Change
date: "2023-07-17T00:00:00Z"
tags: ['LeetCode']
---

## 題目位置
https://leetcode.com/problems/lemonade-change/

## 題目描述

At a lemonade stand, each lemonade costs $5. 
> 在一個檸檬水攤上，每一個檸檬水賣 $5。

Customers are standing in a queue to buy from you and order one at a time (in the order specified by bills).
> 顧客們排隊跟你購買檸檬水，一次只購買一件(按照帳單的順序進行購買)。

Each customer will only buy one lemonade and pay with either a $5, $10, or $20 bill.
> 所有顧客將會買一瓶檸檬水與使用 $5, $10, $20 面額的金額進行付款。

You must provide the correct change to each customer so that the net transaction is that the customer pays $5.
> 你必續提供正確的零錢給每位顧客。

Note that you do not have any change in hand at first.
> 手頭上一開始並沒有任何零錢。

Given an integer array bills where bills[i] is the bill the ith customer pays, return true if you can provide every customer with the correct change, or false otherwise.
> 給一個整數陣列帳單，其中 bills[i] 為顧客所支付的金額，如果你可以正確找零給每位顧客則回傳 true，反之 false。

## 解題思路
這題有點小陷阱，若按照字面上的意思，我們可以很快地寫出答案，畢竟每次都賺五塊，剩餘的就是要找回去，但我們這樣想就會落入陷阱。

在這題中，我們要記得鈔票的面額是不可更換的，10塊錢只能找5塊錢，20塊錢只能找一個10塊以及一個五塊又或者找三個五塊。

## 程式碼
```java
public class Solution {

  public boolean lemonadeChange(int[] bills) {
    int money5 = 0;
    int money10 = 0;
    int money20 = 0;

    for(int i = 0 ; i < bills.length ; i++) {
      int bill = bills[i];

      if(bill == 5) {
        money5++;
      } else if(bill == 10) {
        money10++;
        money5--;
      } else {
        if(money10 > 0) {
          money10--;
          money5--;
        } else {
          money5 -= 3;
        }
      }

      if(money5 < 0 || money10 < 0 || money20 < 0) return false;
    }

    return true;
  }

}
```

## Related Topics
```Array```
```Greedy```

## 心得
這題是真的滿簡單的，但一開始很習慣的增減金額來算，當然是悲劇滿滿，所以題目要看好看滿，Example 不要忘記仔細瞧瞧了。