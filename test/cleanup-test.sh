#!/usr/bin/env bash
set -ex
declare scriptDir=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
declare projectDir=$(dirname "${scriptDir}")
rm -rf "$projectDir/docs/_posts"
rm -rf "$projectDir/docs/img"
rm -rf "$projectDir/data"
rm -rf "$projectDir/tags.json"
