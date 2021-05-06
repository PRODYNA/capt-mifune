#!/bin/sh


let error=0
echo '##### Check Settings ########################################################################'
if [ -z $BASE_PATH ]
then
  export BASE_PATH='/'
fi
echo 'run server with base path: '$BASE_PATH

if [ -z $API_SERVER ]
then
  echo 'env $API_SERVER not exist'
  error=1
else
  echo 'server use api '$API_SERVER
fi

if [ $error -ne 0 ]
then
  exit $error
fi

echo '##### Update Config #########################################################################'

echo 'create env.json'
echo $(envsubst < env-template.json) > /usr/share/nginx/html/env.json
cat /usr/share/nginx/html/env.json

#
echo 'update nginx config'
sed 's/$BASE_PATH/'${BASE_PATH//\//\\/}'/g' /nginx-default-template.conf > /etc/nginx/conf.d/default.conf
echo '--------nginx config -----------'
cat /etc/nginx/conf.d/default.conf
echo '-------------------'

echo 'update manifest old'
cat /usr/share/nginx/html/manifest.json

echo 'update base url'
sed -i "s/<base href=\".\/\">/<base href=\"${BASE_PATH//\//\\/}\">/" /usr/share/nginx/html/index.html


echo 'new manifest new'
mv /usr/share/nginx/html/manifest.json /usr/share/nginx/html/manifest.backup.json
jq '.start_url="'$BASE_PATH'"' /usr/share/nginx/html/manifest.backup.json > /usr/share/nginx/html/manifest.json
cat /usr/share/nginx/html/manifest.json
rm /usr/share/nginx/html/manifest.backup.json


echo '###### Start nginx ##########################################################################'
exec nginx -g 'daemon off;'
