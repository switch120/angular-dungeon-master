#!/usr/bin/env bash
apt-get update

#install any binaries for compiling from source
apt-get install -y build-essential

#install git-scm
apt-get install -y git

#install utilities
apt-get install -y unzip

sudo timedatectl set-timezone America/New_York

#install node
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get install -y nodejs

npm install -g @angular/cli

#allow non-root user to invoke a Node server on ports < 1024
sudo apt-get install libcap2-bin
sudo setcap cap_net_bind_service=+ep `readlink -f \`which node\``

cd /var/www
npm install
