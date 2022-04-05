# Sample CAPT MIFUNE deployment with keycloak as OIDC Provider.

## Components
###  [Keycloak](http://localhost:8888)
  - We start Keycloak simply with an H2 Database (for your own happiness please don't use it for production)
  - We initialize Keycloak with an exported realm (mifune) with client for front and backend
  - Admin login is setup over env variables (admin/admin)
  - see docker-compose.yaml for config
### [Mifune](http://localhost:8080/ui/)
  - see docker-compose.yaml for config and keycloak setup
### Neo4j [Neo4j](localhost:7474)
  - login is setup over env variables (neo4j/password)
    - you can't change the username in the community version over env variables 
  