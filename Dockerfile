FROM maven:3.8.1-adoptopenjdk-16 as builder
COPY . .
RUN mvn clean install

FROM adoptopenjdk:16_36-jre-hotspot-focal

# Configure the JAVA_OPTIONS, you can add -XshowSettings:vm to also display the heap size.
ENV JAVA_OPTIONS="-Dquarkus.http.host=0.0.0.0 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
# We make four distinct layers so if there are application changes the library layers can be re-used
COPY --chown=1001 --from=builder server/target/quarkus-app/lib/ /deployments/lib/
COPY --chown=1001 --from=builder server/target/quarkus-app/*.jar /deployments/
COPY --chown=1001 --from=builder server/target/quarkus-app/app/ /deployments/app/
COPY --chown=1001 --from=builder server/target/quarkus-app/quarkus/ /deployments/quarkus/

RUN CLASSPATH=$(echo \("lib"|"quarkus"|"app"\)/**/*.jar | tr ' ' ':')
RUN echo $CLASSPATH

EXPOSE 8080
USER 1001

ENTRYPOINT [ "java", "-cp", "$CLASSPATH", "-jar", "/deployments/quarkus-run.jar" ]
