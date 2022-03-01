#!/usr/bin/env bash
cd ./ui || exit
yarn install
yarn generate-backend-api
yarn build
cd .. || exit
cd ./server || exit
./mvnw -f server/pom.xml -P prod clean install -DskipTests
docker build -t prodyna/capt-mifune:latest .

