FROM node:14 as builder
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json
RUN yarn install
COPY public public
COPY src src
RUN yarn build

FROM nginx:1.17.10-alpine
RUN apk update && \
    apk upgrade -U && \
    apk add gettext && \
    apk add jq && \
    rm -rf /var/cache/apk

ADD /docker /
COPY --from=builder build /usr/share/nginx/html/

EXPOSE 80

# run nginx
CMD ["sh", "docker-start.sh"]
