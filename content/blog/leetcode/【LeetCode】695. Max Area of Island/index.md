---
title: 【LeetCode】695. Max Area of Island
date: "2023-01-04T00:37:00Z"
---

## 題目位置
https://leetcode.com/problems/max-area-of-island/description/

## 題目描述

![maxarea1-grid](./maxarea1-grid.jpg)

You are given an ```m x n``` binary matrix ```grid```. An island is a group of 1's (representing land) connected **4-directionally** (horizontal or vertical.) You may assume all four edges of the grid are surrounded by water.<br><br>
The **area** of an island is the number of cells with a value ```1``` in the island.<br><br>
Return the maximum **area** of an island in ```grid```. If there is no island, return ```0```.

給一個 ```m * n``` 的二進制矩陣, 在矩陣中1為陸地，並且島嶼將由```1```組成，且連接至四周。<br><br>
你可以假設網格四周邊緣都被水包圍, 每座島的```面積```，為```1的單元格數目```。<br><br>
回傳```最大島嶼```的面積，若沒有島嶼回傳```0```

## 解題思路
1. 矩陣為 m * n 也代表 m 與 n 有可能不同
2. 每座島嶼代表著由1組成的群組，包含上下左右
3. 回傳最大島嶼面積，若沒有則為傳0

我們可以看到問題描述中，說明 Horizontal or Vertical 都會有1的狀況，直覺的就是使用 BFS 進行搜尋，在這邊我們要注意使用 BFS 搜尋時，要記錄已搜尋的位置，防止重複放入對列，造成無窮迴圈的狀況。

## 程式碼
```java
int[][] grid;
int[][] used;
int m, n;
int ans = 0;

public int maxAreaOfIsland(int[][] grid) {
    this.m = grid.length;
    this.n = grid[0].length;
    this.grid = grid;
    this.used = new int[m][n];
    
    for(int i = 0 ; i < m ; i++) {
        for(int j = 0 ; j < n ; j++) {
            if(grid[i][j] == 1 && used[i][j] == 0) {
                int island = findIsland(new Point(i, j));
                if(island > ans) ans = island;
            }
        }
    }
    return ans;
}

public int findIsland(Point point) {
    int island = 0;
    if(
        point.x >= 0 && point.x < m &&
        point.y >= 0 && point.y < n
    ) {
        if(grid[point.x][point.y] == 1) {
            island += 1;
            used[point.x][point.y] = 1;

            Point top = new Point(point.x - 1, point.y);
            Point bottom = new Point(point.x + 1, point.y);
            Point left = new Point(point.x, point.y - 1);
            Point right = new Point(point.x, point.y + 1);
            
            if(
                top.x >= 0 && top.x < m && 
                top.y >= 0 && top.y < n && used[top.x][top.y] == 0
            ) {
                island += findIsland(top);
            }
            
            if(
                bottom.x >= 0 && bottom.y >= 0 && 
                bottom.x < m && bottom.y < n && used[bottom.x][bottom.y] == 0
            ) {
                island += findIsland(bottom);
            }
            
            if(
                left.x >= 0 && left.y >= 0 && 
                left.x < m && left.y < n && used[left.x][left.y] == 0
            ) {
                island += findIsland(left);
            }
            
            if(
                right.x >= 0 && right.y >= 0 && 
                right.x < m && right.y < n && used[right.x][right.y] == 0
            ) {
                island += findIsland(right);
            }
        }
    }
    return island;
}

private class Point {
    int x, y;
    
    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
```

## Related Topics
```Array```
```Depth-First Search```
```Breadth-First Search```
```Union Find```
```Matrix*```

## 心得
這一題目還算簡單，非常直覺的解決方式，我認為程式碼還有優化可能: 

1. 可以用同一陣列進行記錄，不需要額外儲存比對陣列
2. 程式碼可以進行調整，可更美觀

待後續有空再來重新思考，算 todo ?