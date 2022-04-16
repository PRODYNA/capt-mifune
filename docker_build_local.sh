#!/usr/bin/env bash
cd ./ui || exit
yarn install
yarn generate-backend-api
yarn build
cd .. || exit
cd ./backend || exit
./mvnw -f server/pom.xml clean install -DskipTests
cd .. || exit
docker build -t prodyna/capt-mifune:latest .

