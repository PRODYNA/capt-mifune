FROM nginx:1.17.10-alpine
RUN apk update && \
    apk upgrade -U && \
    apk add gettext && \
    apk add jq && \
    rm -rf /var/cache/apk

ADD /docker /
COPY /build /usr/share/nginx/html/

EXPOSE 80

# run nginx
CMD ["sh", "docker-start.sh"]
