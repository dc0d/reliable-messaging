#!/bin/sh

rm notifierfn notifierfn.zip
GOARCH=amd64 GOOS=linux go build && zip ./notifierfn.zip ./notifierfn