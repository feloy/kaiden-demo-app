#! /bin/sh

# Install redis service
dnf install -y redis

# Install chromium, to be used by playwright
dnf install -y chromium
mkdir -p /opt/google/chrome
ln -sf /usr/bin/chromium-browser /opt/google/chrome/chrome
