#!/usr/bin/env bash

cd $(dirname $(readlink -e $0))

TIMER_START=0

function startTimer {
  S=`date +%-s`000
  N=`date +%-N`
  TIMER_START=$(($N / 1000000 + $S))
}
function showTimer {
  S=`date +%-s`000
  N=`date +%-N`
  TIME=$(($N / 1000000 + $S))
  TIMER=$(($N / 1000000 + $S - $TIMER_START))
  MIN=$(($TIMER / 1000 / 60))
  SEC=$(($TIMER / 1000 - $(($MIN * 60))))
  echo ""
  echo "(Bash command finished in `expr $MIN`min `expr $SEC`s `expr $TIMER % 1000`ms)"
  echo ""
}

function selectAction {
  echo ""
  echo "**********  Payever frontend - UI-kit **********"
  echo ""
  echo "What do we do?"
  echo ""
  echo "0  - npm install"
  echo "1  - Build production"
  echo "2  - Run local"
  echo ""
  echo "q  - Quit completely"
  echo ""
  echo "**********"
  echo ""

  read action
  case $action in
    0)
      echo ""
      echo "npm install"
      echo ""
      startTimer
      echo -e "\e[1;37mrm -rdf $PWD/node_modules/*\e[0m"
      rm -rdf $PWD/node_modules/*
      echo -e "\e[1;37mnpm install\e[0m"
      npm install
      showTimer
      ;;
    1)
      echo ""
      echo "Build production"
      echo ""
      startTimer
      echo -e "\e[1;37mnpm build\e[0m"
      npm run build
      showTimer
      ;;
    2)
      echo ""
      echo "Run local"
      echo ""
      echo -e "\e[1;37mnpm start\e[0m"
      npm start
      ;;

    q)
      exit 0
      ;;
    *)
      echo "Missed!"
      ;;
  esac
  selectAction
}

selectAction
