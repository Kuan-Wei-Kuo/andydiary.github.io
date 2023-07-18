---
title: LeetCode 1179. Find Nearest Point That Has the Same X or Y Coordinate
date: "2023-07-18T00:00:00Z"
tags: ['LeetCode']
---

## 題目位置
https://leetcode.com/problems/find-nearest-point-that-has-the-same-x-or-y-coordinate

## 題目描述
You are given two integers, x and y, which represent your current location on a Cartesian grid: (x, y). You are also given an array points where each points[i] = [ai, bi] represents that a point exists at (ai, bi). A point is valid if it shares the same x-coordinate or the same y-coordinate as your location.
> 你會拿到兩個整數，分別為 x 與 y，其代表你的座標位置。除此之外，你還會獲得一組 point 陣列，每個 points[i] = [ai, bi] 為一個點。如果你的位置有相同的 x 或 y 座標的時候，則代表該點有效。    

Return the index (0-indexed) of the valid point with the smallest Manhattan distance from your current location. If there are multiple, return the valid point with the smallest index. If there are no valid points, return -1.
> 返回最小曼哈頓距離的有效索引，如果有多個，則返回最小索引的有效點。如果沒有則返回 -1。

The Manhattan distance between two points (x1, y1) and (x2, y2) is abs(x1 - x2) + abs(y1 - y2).
> 兩點之間的曼哈頓距離算式為 abs(x1 - x2) + abs(y1 - y2)。

## 解題思路
這題就很簡單，判斷 x 或 y 值是否有相同，並且計算兩點距離即可。

## 程式碼
```java
public class Solution {

    public int nearestValidPoint(int x, int y, int[][] points) {
        int temp = Integer.MAX_VALUE;
        int ans = -1;

        for(int i = 0 ; i < points.length ; i++) {
            int[] point = points[i];
            
            if(x == point[0] && y == point[1]) {
                return i;
            } else if(x == point[0] || y == point[1]) {
                int distance = Math.abs(x - point[0]) + Math.abs(y - point[1]);
                if(distance < temp) {
                    ans = i;
                    temp = distance;
                }
            }
        }

        return ans;
    }

}
```

## Related Topics
```Array```

## 心得
沒啥心得...這題很簡單。