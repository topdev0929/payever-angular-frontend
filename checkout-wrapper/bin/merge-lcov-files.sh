rm coverage/lcov.info &> /dev/null
find ./coverage -type f -name lcov.info -empty -print -delete
find ./coverage -name lcov.info | xargs printf -- '-a %s\n' | xargs lcov -o ./coverage/lcov.info
if [ "$?" -ne 0 ]; then
  echo "Please make sure lcov files are generated"
fi