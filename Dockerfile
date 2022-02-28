FROM eclipse-temurin:17 as builder
COPY ./mvnw ./mvnw
COPY .mvn .mvn
COPY ./pom.xml ./pom.xml
COPY ./csv2json ./csv2json
COPY ./server/pom.xml ./server/pom.xml
RUN ./mvnw -f csv2json/pom.xml install -DskipTests
RUN ./mvnw dependency:go-offline
COPY ./server ./server
RUN ./mvnw install -DskipTests


FROM eclipse-temurin:17
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
