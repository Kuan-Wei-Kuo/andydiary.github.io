---
title: 前後端分離攜帶 Cookie 的跨域問題
date: "2023-08-24T00:00:00Z"
tags: ['Cookie', 'Frontend']
---

## Introduction
近期在某專案遇見前後端分離攜帶 Cookie 的跨域問題，剛好有一些小心得想要分享一下。

## Solution
在前端中我們很常使用 Axios 來請求 API，在默認的情況下 Axios 是不會攜帶 Cookie 的，我們要將 Axios 中的 withCredentials 設為 True 才可以正常攜帶 Cookie。

但以為這樣就好了嗎? 不，如果要攜帶跨域 Cookie 這樣還不夠，在 Chrome 的規則下，我們需要讓後端配合設定以下 Header

* Access-Control-Allow-Origin: 設定允許跨域的 Domain
* Access-Control-Allow-Credentials: 設定為 True
* Cookie: SameSite 為 None、Secure 為 True

我們需要滿足以上條件，在 Chrome 的政策下才可以正常地攜帶跨域 Cookie。

## Review
現代瀏覽器越來越多安全政策，拿著香蕉因應政策修改著萬惡的系統，看起來是我們不變的使命。