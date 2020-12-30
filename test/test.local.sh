#!/usr/bin/env bash
set -ex
declare scriptDir=$(cd $(dirname ${BASH_SOURCE:-$0}); pwd)
declare projectDir=$(dirname "${scriptDir}")
cd $projectDir/actions/update-memo/ && bash test.local.sh && cd -
cd $projectDir/actions/create-draft-post/ && bash test.local.sh && cd -
