---
title: LeetCode 2091. Removing Minimum and Maximum From Array
date: "2023-07-20T00:00:00Z"
tags: ['LeetCode']
---

## 題目位置
https://leetcode.com/problems/removing-minimum-and-maximum-from-array

## 題目描述
You are given a 0-indexed array of distinct integers nums.
> 你會取得一個不重複的整數陣列。

There is an element in nums that has the lowest value and an element that has the highest value. We call them the minimum and maximum respectively. Your goal is to remove both these elements from the array.
> 該陣列中會有最小與最大值，我們稱之為 minimum 與 maximum。你的目標是從陣列刪除他們。

A deletion is defined as either removing an element from the front of the array or removing an element from the back of the array.
> 刪除的定義為從前面或後面刪除一個數。

Return the minimum number of deletions it would take to remove both the minimum and maximum element from the array.
> 回傳刪除最大與最小值的最小刪除次數。

## 解題思路
題目中很明確地告訴我們要刪除最大與最小值，而刪除的定義就是往前或往後刪除。

假設陣列為 [2,10,7,5,4,1,8,6]，最大值為10、最小值為1，若今天我們要刪除他們，有三個情境:

1. 由前往後刪，需要刪除6次
2. 由後往前刪，需要刪除7次
3. 由前往後與由後往前，各刪除至第一個值，共刪除5次

解析到這邊，我們也可以知道，我們情境就這三種，那麼只要依序將這三個情境計算出來就可以了。

## 程式碼
```java
class Solution {

    public int minimumDeletions(int[] nums) {
        int n = nums.length;
        int minIdx = 0;
        int maxIdx = 0;

        int ans = 0;

        if(n <= 2) {
            return n;
        }

        for(int i = 0 ; i < n ; i++) {
            if(nums[minIdx] > nums[i]) {
                minIdx = i;
            }
            if(nums[maxIdx] < nums[i]) {
                maxIdx = i;
            }
        }

        // 最小 index
        int front = Math.min(minIdx, maxIdx);

        // 最大 index
        int back = Math.max(minIdx, maxIdx);

        // 由前往後第一個值
        int mftr = front + 1;

        // 由後往前第一個值
        int mbtr = n - back;

        // 由前往後
        int ftr = back + 1;

        // 由後往前
        int btr = n - front;

        // 由前往後與由後往前的和
        int mtr = mftr + mbtr;

        ans = ftr;

        if(ans > btr) {
            ans = btr;
        } 
        
        if(ans > mtr) {
            ans = mtr;
        }

        return ans;
    }

}
```

## Related Topics
```Array```
```Greedy```

## 心得
這題困難度並不算太困難，只要我們能夠釐清題目的三種情境，應該都很快可以算出來。最困難的大概是窮舉之後的優化，這題的優化很簡單，我們應該要盡量減少 for 迴圈數量，也因為題目的特性，我們其實只需要知道 index 就好，至於最大最小的數值為何，並不重要。