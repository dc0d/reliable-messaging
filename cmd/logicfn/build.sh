#!/bin/sh

rm logicfn logicfn.zip
GOARCH=amd64 GOOS=linux go build && zip ./logicfn.zip ./logicfn