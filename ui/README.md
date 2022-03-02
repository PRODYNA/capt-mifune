<div id="top"></div>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->

<br />
<div align="center">
  <a href="https://github.com/PRODYNA/capt-mifune-ui/">
    <img src="./src/assets/Logo-dark.svg?raw=true" alt="Logo" width="150">
  </a>
  <h3 align="center">Captain Mifune</h3>
  <p align="center">
    <b>Rapid prototyping Neo4j graphs</b>
  <br />
  <a href="https://github.com/PRODYNA/capt-mifune-ui/">View Demo</a>
  ·
  <a href="https://github.com/PRODYNA/capt-mifune-ui/issues">Report Bug</a>
  ·
  <a href="https://github.com/PRODYNA/capt-mifune-ui/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
    <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
    <a href="#getting-started">Getting Started</a>
    <ul>
      <li><a href="#prerequisites">Prerequisites</a></li>
      <li><a href="#installation">Installation</a></li>
    </ul>
    </li>
    <li><a href="#keycloak">Keycloak</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#available-scripts">Available Scripts</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

##  About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

<p align="right">(<a href="#top">back to top</a>)</p>

###  Built With
![React.js](https://img.shields.io/badge/React.js-v17.0.1-blue)
![Typescript](https://img.shields.io/badge/Typscript-v4.3.5-blue)

![Openapi-generator](https://img.shields.io/badge/Openapi--generator-v2.3.26-yellow)
![Axios](https://img.shields.io/badge/Axios-v0.21.1-orange)
![Keycloak](https://img.shields.io/badge/Keycloak-v15.0.2-red)
  
![D3.js](https://img.shields.io/badge/D3.js-v6.3.1-green)
![Material-ui](https://img.shields.io/badge/Material--ui-v4.12.3-green)
![Nivo](https://img.shields.io/badge/Nivo-v0.79.0-green)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

##  Getting Started 

### Frontend

This gives you instructions on setting up your project locally.

To get a local copy up and running follow these simple steps.

###  Prerequisites

* node
* npm 

```sh

npm install npm@latest -g

```



###  Installation

1. Clone the repo
```sh

git clone https://github.com/your_username_/Project-Name.git

```

2. Install NPM packages
```sh

yarn install

```
3. Generate Backend

```sh

yarn generate-backend-api

```

4. Start project locally

```sh

yarn start

```

<p align="right">(<a href="#top">back to top</a>)</p>

## Keycloak

To enable login, open the file public/env.json and set the field "LOGIN_REQUIRED" to true.

Start keycloak with

```
docker run -p 8888:8080 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin -e DB_VENDOR=H2 jboss/keycloak
```

then go to http://localhost:8888/auth/admin and log in using the credentials provided (admin/admin).
In keycloak, you should

1. create a realm "mifune" (if it doesn't already exist), and select it,
2. create a user by setting up username and password credentials,
3. create a client "mifune-app" with root URL "http://localhost:3000/" (if it doesn't already exist),
4. leave everything else at default.

You can go to http://localhost:8888/auth/realms/mifune/account/ for user account management.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTRIBUTING -->

##  Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project

2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)

3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)

4. Push to the Branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- LICENSE -->

##  License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>


## Project structure

    | public

      | env

    | src

      | assets // images, logos, fonts

      | auth // keycloak setup

      | components // reusable components 

      | context // react context for sharing state over multiple components 

      | helpers // helper functions

      | openapi // configs to generated backend apis and models in typescript 

        | axios-config 

      | pages // application view

      | routes // application routes

      | services // generate by openapi-generator

        | api // all endpoints

        | models // all model types with their schema

      | utils // custom translations and texts

<p align="right">(<a href="#top">back to top</a>)</p>


## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


### `yarn generate-backend-api`

Openapi-generator generates all available api endpoints and models for this project in typescript to the `services` folder


### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/PRODYNA/capt-mifune-ui.svg?style=for-the-badge

[contributors-url]: https://github.com/PRODYNA/capt-mifune-ui/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/PRODYNA/capt-mifune-ui.svg?style=for-the-badge

[forks-url]: https://github.com/PRODYNA/capt-mifune-ui/network/members

[stars-shield]: https://img.shields.io/github/stars/PRODYNA/capt-mifune-ui.svg?style=for-the-badge

[stars-url]: https://github.com/PRODYNA/capt-mifune-ui/stargazers

[issues-shield]: https://img.shields.io/github/issues/PRODYNA/capt-mifune-ui.svg?style=for-the-badge

[issues-url]: https://github.com/PRODYNA/capt-mifune-ui/issues

[license-shield]: https://img.shields.io/github/license/PRODYNA/capt-mifune-ui.svg?style=for-the-badge

[license-url]: ./LICENSE

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555

[linkedin-url]: https://www.linkedin.com/company/prodyna/mycompany/

[product-screenshot]: images/screenshot.png
