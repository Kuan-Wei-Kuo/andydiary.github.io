---
title: Install RKE on Ubuntu 20.04
date: "2023-05-01T00:00:00Z"
tags: ['Kubernetes', 'RKE']
---

近期 SideProject 需要使用到 RKE 在這邊我稍微紀錄一下安裝方式，順便分享給大家，避免踩到無故的雷。

# 為何使用 RKE
近年來地端 Kubernetes engine 越來越多，在這些的選擇中，我們選擇了使用 RKE，最大的目的終究是看上他的社群發展較多，遇到許多問題我們也許能夠快速排查，再加上企業級支持。

```
在這邊我們選擇的理由非常簡單，就是快，可支援我們快速產生 MVP。
```

# 主機配置
| HOST | IP | DESC |
|------|----|------|
| rke-master-01 | 192.168.144.11 | Management Server |
| rke-node-01 | 192.168.144.12 | Worker |
| rke-node-02 | 192.168.144.13 | Worker |

# 前置動作
在 RKE 基礎下，我們並不需要幫每台 Worker 安裝 RKE，但每台 Worker 都需要安裝 Docker 並且 Management Server 不需要透過密碼，使用 SSH 即可登入主機，並且操作 Docker。

也因此，在這邊的檢核點就是，可以使用 SSH 進行 docker ps 指令，如下顯示
```bash
ssh 192.168.144.12 "docker ps "
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

ssh 192.168.144.13 "docker ps "
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

# Install RKE on Ubuntu 20.04

## Step 1. Download RKE
```bash
wget https://github.com/rancher/rke/releases/download/v1.4.6-rc1/rke_linux-amd64
mv rke_linux-amd64 rke
```

## Step 2. Make the RKE binary that you just downloaded executeable
```bash
chmod +x rke
mv rke /usr/local/bin/rke
```

## Step 3. Get RKE version
```bash
rke --version
rke version v1.4.6-rc1
```

## Step 4. Create SSH Key
```bash
ssh-keygen -t rsa -b 4096
```

# Configuration RKE Cluster

## Step 1. Create cluster.yml
```bash
rke config --name cluster.yml
[+] Cluster Level SSH Private Key Path [~/.ssh/id_rsa]:
[+] Number of Hosts [1]:
[+] SSH Address of host (1) [none]: 192.168.144.12
[+] SSH Port of host (1) [22]:
[+] SSH Private Key Path of host (192.168.144.12) [none]:
[-] You have entered empty SSH key path, trying fetch from SSH key parameter
[+] SSH Private Key of host (192.168.144.12) [none]:
[-] You have entered empty SSH key, defaulting to cluster level SSH key: ~/.ssh/id_rsa
[+] SSH User of host (192.168.144.12) [ubuntu]: andy
[+] Is host (192.168.144.12) a Control Plane host (y/n)? [y]: y
[+] Is host (192.168.144.12) a Worker host (y/n)? [n]: y
[+] Is host (192.168.144.12) an etcd host (y/n)? [n]: y
[+] Override Hostname of host (192.168.144.12) [none]:
[+] Internal IP of host (192.168.144.12) [none]: 
[+] Docker socket path on host (192.168.144.12) [/var/run/docker.sock]:
[+] Network Plugin Type (flannel, calico, weave, canal, aci) [canal]:
[+] Authentication Strategy [x509]:
[+] Authorization Mode (rbac, none) [rbac]:
[+] Kubernetes Docker image [rancher/hyperkube:v1.25.6-rancher4]:
[+] Cluster domain [cluster.local]:
[+] Service Cluster IP Range [10.43.0.0/16]:
[+] Enable PodSecurityPolicy [n]:
[+] Cluster Network CIDR [10.42.0.0/16]:
[+] Cluster DNS Service IP [10.43.0.10]:
[+] Add addon manifest URLs or YAML files [no]:
```

## Step 2. Edit cluster.yml
在這邊大家會看到 nodes 裡面只有方才設定得 144.12 Worker，在這邊因為我們有 144.13，因此我們一樣畫葫蘆的將其建立上去，大致上如下
```bash
vi cluster.yml
- address: "192.168.144.12"
  port: "22"
  role:
  - controlplane
  - worker
  - etcd
  user: andy
  docker_socket: /var/run/docker.sock
  ssh_key: ""
  ssh_key_path: ~/.ssh/id_rsa
  ssh_cert: ""
  ssh_cert_path: ""
- address: "192.168.144.13"
  port: "22"
  role:
  - controlplane
  - worker
  - etcd
  user: andy
  docker_socket: /var/run/docker.sock
  ssh_key: ""
  ssh_key_path: ~/.ssh/id_rsa
  ssh_cert: ""
  ssh_cert_path: ""
```

# Run RKE
當我們上述都完成後，即可用以下指令啟動 RKE
```bash
rke up
```

完成後我們將會看到以下資訊
```bash
...
INFO[0116] [addons] Setting up user addons
INFO[0116] [addons] no user addons defined
INFO[0116] Finished building Kubernetes cluster successfully
```

RKE 至此就已經正式創建完成了，但我們該如何操作 K8S 呢? 當我們使用 rke up 時，該目錄下會產生 kube_config_cluster.yml，這時候我們須叫進行以下操作
```bash
mkdir .kube
cp kube_config_cluster.yml ~/.kube/config
```

接下來就可以讓我們來測試一下 nodes 狀況
```bash
kubectl get nodes
NAME             STATUS   ROLES                      AGE   VERSION
192.168.144.12   Ready    controlplane,etcd,worker   72m   v1.25.6
192.168.144.13   Ready    controlplane,etcd,worker   72m   v1.25.6
```

## 問題排除
```
Failed to get job complete status for job rke-coredns-addon-deploy-job in namespace kube-system
重新 rke up 即可正常
```

## 結論
在這次文章中，我們快速的了解 RKE 怎麼安裝，在過程中我們也可以發現 RKE 安裝的簡易，與傳統安裝 Kubeadm 還要相對的輕鬆，但我們是不是少了什麼? 都使用 RKE 了怎麼可以少了 Rancher GUI 呢? 下次文章就讓我們來看看 RKE 上如何安裝 Rancher。

## 參考
https://ithelp.ithome.com.tw/articles/10259995 <br>
https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/kubernetes-cluster-setup/rke1-for-rancher <br>
https://rke.docs.rancher.com/installation <br>