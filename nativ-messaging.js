/**
 * @type {(string)=>string}
 */
const replaceVar = (str = '') =>
  str.indexOf('$\\{')
    ? str.replaceAll('$\\{', '${')
    : str.replaceAll('${', '$\\{');

export const linuxInstallScript =
  replaceVar(String.raw`#!/bin/sh
# Copyright 2021 The Chromium Authors. All rights reserved.
# Use of this source code is governed by a BSD-style license that can be
# found in the LICENSE file.

set -e

DIR="$( cd "$( dirname "$0" )" && pwd )"
if [ "$(uname -s)" = "Darwin" ]; then
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/Library/Google/Chrome/NativeMessagingHosts"
  else
    TARGET_DIR="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts"
  fi
else
  if [ "$(whoami)" = "root" ]; then
    TARGET_DIR="/etc/opt/chrome/native-messaging-hosts"
  else
    TARGET_DIR="$HOME/.config/google-chrome/NativeMessagingHosts"
  fi
fi

HOST_NAME=com.google.chrome.nativ-message.node

# Create directory to store native messaging host.
mkdir -p "$TARGET_DIR"

# Copy native messaging host manifest.
cp "$DIR/$HOST_NAME.json" "$TARGET_DIR"

# Update host path in the manifest.
HOST_PATH=$DIR/native-messaging-example-host
ESCAPED_HOST_PATH=$\{HOST_PATH////\\/}

sed -i -e "s/HOST_PATH/$ESCAPED_HOST_PATH/" "$TARGET_DIR/$HOST_NAME.json"

# Set permissions for the manifest so that all users can read it.
chmod o+r "$TARGET_DIR/$HOST_NAME.json"

echo "Native messaging host $HOST_NAME has been installed."
`);

export const linuxJson = `{
    "name": "com.google.chrome.nativ-message.node",
    "description": "Chrome Native Messaging API Example Host",
    "path": "HOST_PATH",
    "type": "stdio",
    "allowed_origins": [
      "chrome-extension://knldjmfmopnpolahpmmgbagdohdnhkik/"
    ]
  }`;

export const windowsJson = `{
    "name": "com.google.chrome.nativ-message.node",
    "description": "Chrome Native Messaging API Example Host",
    "path": "native-messaging-example-host.bat",
    "type": "stdio",
    "allowed_origins": [
      "chrome-extension://knldjmfmopnpolahpmmgbagdohdnhkik/"
    ]
  }`;

export const windows = {
  installBat: String.raw`:: Change HKCU to HKLM if you want to install globally.
    :: %~dp0 is the directory containing this bat script and ends with a backslash.
    REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.google.chrome.nativ-message.node" /ve /t REG_SZ /d "%~dp0com.google.chrome.nativ-message.node-win.json" /f`,
  uninstallBat: String.raw`:: Deletes the entry created by install_host.bat
    REG DELETE "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.google.chrome.nativ-message.node" /f
    REG DELETE "HKLM\Software\Google\Chrome\NativeMessagingHosts\com.google.chrome.nativ-message.node" /f`,
  path: 'native-messaging.bat',
  hostRunner: `@echo off
  :: Copyright (c) 2013 The Chromium Authors. All rights reserved.
  :: Use of this source code is governed by a BSD-style license that can be
  :: found in the LICENSE file.

  node "%~dp0/native-messaging-example-host" %*`,
};

// os
// user

export const manifest = {
  name: 'com.google.chrome.nativ-message.node',
  description: 'Chrome Native Messaging API Example Host',
  // linux: path: 'HOST_PATH',
  type: 'stdio',
  allowed_origins: [
    'chrome-extension://knldjmfmopnpolahpmmgbagdohdnhkik/',
  ],
};
export const windowsHost = '';

export const install = {
  linux: '',
  windows,
};

export const app = () => {
  const shebang = `#!/usr/bin/env -S node --experimental-module`;
  return shebang;
  // # Read the message length (first 4 bytes).
  // text_length_bytes = sys.stdin.read(4)

  // if len(text_length_bytes) == 0:
  //   if queue:
  //     queue.put(None)
  //   sys.exit(0)

  // # Unpack message length as 4 byte integer.
  // text_length = struct.unpack('i', text_length_bytes)[0]

  // # Read the text (JSON object) of the message.
  // text = sys.stdin.read(text_length).decode('utf-8')
};

// const msg = ('14' + '{ "me": "hi" }').length;

// Uint32Array.from(['14{ "me": "hi" }']);

// const str = '{ "me": "hi" }'
// for (let pos = -1; pos < str.length;) {
//   pos++
//   const cp = str[pos].codePointAt(0);
//   const astral = String.fromCodePoint(cp).length === 2;
// }

// arr.map(char=>char.charRefCode())
// for (let pos = -1; pos < arr.length;) {
//     pos++
//     .codePointAt(pos);
//   }

//Uint32Array.from(Array.from('14{ "me": "hi" }').map(c=>c.codePointAt(0)));
