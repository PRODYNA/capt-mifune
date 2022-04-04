# Sample CAPT MIFUNE deployment with keycloak as OIDC Provider.

## Components
- Keycloak [keycloak](http://localhost:8888)
  - We start Keycloak simply with an H2 Database (for your own happiness please don't use it for production)
  - We initialize Keycloak with an exported realm (mifune) with client for front and backend
  - Admin login is setup over env variables (admin/admin)
  - see docker-compose.yaml for config
- Mifune Server [server](localhost:8081)
  - see docker-compose.yaml for config and keycloak setup
- Mifune UI [UI](localhost:8080)
  - see docker-compose.yaml for config and keycloak setup
  - You need a user in keycloak to have access to mifune now
- Neo4j [Neo4j](localhost:7474)
  - login is setup over env variables (neo4j/password)
    - you can't change the username in the community version over env variables 
  