# webhook-deplay

轻量 webhook 部署脚本
(配合 gitea webhook)

## 生成/添加 SSH 公钥

1. ssh-keygen -t ed25519 -C "test"
2. cat ~/.ssh/id_ed25519.pub
3. 复制到 gitea
