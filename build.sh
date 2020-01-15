#!/bin/bash
NODE_ENV=production npx parcel "${@}" --no-minify node_modules/monaco-editor/esm/vs/{language/{json/json,css/css,html/html,typescript/ts},editor/editor}.worker.js index.html documentation.html test/index.html
#powershell.exe -command npx.cmd -args parcel "${@}" node_modules/monaco-editor/esm/vs/{language/{json/json,css/css,html/html,typescript/ts},editor/editor}.worker.js index.html documentation.html test/index.html
