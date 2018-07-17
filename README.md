Planning Poker
==============

Deploying
---------

**Create a Host**

- Amazon Linux
- `micro` size is fine

**Setup**

1. Change hostname in `Ansible/config.ini`.
2. Ensure passwordless ssh works (e.g. append your `id_rsa.pub` to the `ec2-user` user's `~/.ssh/authorized_keys`)

**Deploy**

```sh
./Ansible/deploy.sh
```
