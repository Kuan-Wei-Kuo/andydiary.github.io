---
title: LeetCode 1800. Maximum Ascending Subarray Sum
date: "2023-07-19T00:00:00Z"
tags: ['LeetCode']
---

## 題目位置
https://leetcode.com/problems/maximum-ascending-subarray-sum

## 題目描述
Given an array of positive integers nums, return the maximum possible sum of an ascending subarray in nums.
> 給一個正整數的陣列(nums)，回傳在 nums 中的子陣列最大和。

A subarray is defined as a contiguous sequence of numbers in an array.
> 子陣列定義是一個連續的數字陣列。

A subarray [numsl, numsl+1, ..., numsr-1, numsr] is ascending if for all i where l <= i < r, numsi  < numsi+1. Note that a subarray of size 1 is ascending.
> 子陣列必須符合 l <= i < r && nums[i] < nums[i+1]，注意如果子陣列長度為 1 也屬於遞增。

## 解題思路
這題說穿了，就是要在陣列中找出連續的遞增子陣列，並將子陣列的和記錄下來，尋找最大和。

## 程式碼
```java
public class Solution {

    public int maxAscendingSum(int[] nums) {
        int temp = 0;
        int sum = 0;
        int ans = 0;
        for(int i = 0 ; i < nums.length ; i++) {
            if(temp > 0) {
                if(temp >= nums[i]) {
                    if(sum > ans) {
                        ans = sum;
                    }
                    sum = 0;
                }
            }
            temp = nums[i];
            sum += nums[i];
        }
        
        if(sum > ans) {
            ans = sum;
        }
        return ans;
    }

}
```

## Related Topics
```Array```

## 心得
這題困難度不高，也沒什麼好說的了。