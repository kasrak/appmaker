#!/bin/sh

ROOT=/home/kasrak/appmaker
PIDFILE=$ROOT/run.pid
kill `cat $PIDFILE`

$ROOT/env/bin/python $ROOT/saveapps/manage.py runfcgi method=threaded host=127.0.0.1 port=8888 pidfile=$PIDFILE

