
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
  <a href="https://github.com/PRODYNA/capt-mifune/">
    <img src="./ui/src/assets/Logo-dark.svg?raw=true" alt="Logo" width="150">
  </a>
  <h3 align="center">Captain Mifune</h3>
  <p align="center">
    <b>Rapid prototyping Neo4j graphs</b>
  <br />
  <a href="https://github.com/PRODYNA/capt-mifune/issues">Report Bug</a>
  ·
  <a href="https://github.com/PRODYNA/capt-mifune/issues">Request Feature</a>
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
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

##  About The Project
  
**Features:**

* **Create your graph model**
  * Create and define your domains through graph modelling in the frontend
  * Define nodes and relations inside your graph model
  * Define properties with keys and different data types
  * Upload your CSV files through pipeline jobs
    *   run imports
    *   stop imports
    *   reset database
    *   clear domains
  * Map you CSV data with your created graph model
  * Save your graph model
  * Create a screenshot of your graph model

* **Analyze your graph model**
  * Create custom queries with the "Query Builder"   
  * Choose between various charts
  * Filter inside your query data


<p align="right">(<a href="#top">back to top</a>)</p>

###  Built With
![Neo4j](https://img.shields.io/badge/Neo4j-4.4.0-blue)
![Quarkus](https://img.shields.io/badge/Quarkus-2.7.5-blue)
![React.js](https://img.shields.io/badge/React.js-v17.0.1-blue)
![Openapi-generator](https://img.shields.io/badge/Openapi--generator-v2.3.26-yellow)
![Keycloak](https://img.shields.io/badge/Keycloak-v15.0.2-red)
![D3.js](https://img.shields.io/badge/D3.js-v6.3.1-green)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

##  Getting Started 

You will find some sample docker-compose setups
### [Local](./deployment-sample/mifune-local/README.md)
Local docker-compose setup without security
### [Server](./deployment-sample/mifune-local/README.md)
Sample config with [Keycloak](https://www.keycloak.org/) as OIDC Provider

##  Usage

Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources.


<p align="right">(<a href="#top">back to top</a>)</p>

<!-- ROADMAP -->

##  Roadmap

- [ ] ...

See the [open issues](https://github.com/PRODYNA/capt-mifune/issues) for a full list of proposed features (and known issues).

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

Distributed under the MIT License. See [LICENSE](./LICENSE) for more information.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- ACKNOWLEDGMENTS -->

##  Acknowledgments

Use this space to list resources you find helpful and would like to give credit to. I've included a few of my favorites to kick things off!

* [Img Shields](https://shields.io)

* [GitHub Pages](https://pages.github.com)


<p align="right">(<a href="#top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/PRODYNA/capt-mifune.svg?style=for-the-badge

[contributors-url]: https://github.com/PRODYNA/capt-mifune/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/PRODYNA/capt-mifune.svg?style=for-the-badge

[forks-url]: https://github.com/PRODYNA/capt-mifune/network/members

[stars-shield]: https://img.shields.io/github/stars/PRODYNA/capt-mifune.svg?style=for-the-badge

[stars-url]: https://github.com/PRODYNA/capt-mifune/stargazers

[issues-shield]: https://img.shields.io/github/issues/PRODYNA/capt-mifune.svg?style=for-the-badge

[issues-url]: https://github.com/PRODYNA/capt-mifune/issues

[license-shield]: https://img.shields.io/github/license/PRODYNA/capt-mifune.svg?style=for-the-badge

[license-url]: ./LICENSE

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555

[linkedin-url]: https://www.linkedin.com/company/prodyna

[product-screenshot]: images/screenshot.png
