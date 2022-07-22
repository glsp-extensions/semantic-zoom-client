# Semantic Zooming in GLSP (Client)

This is a prototype that demonstrates semantic zooming in GLSP. \
It is based on a fork of the original GLSP client on https://github.com/eclipse-glsp/glsp-client.

![Semantic Zoom](/documentation/video_prot1.gif)

## Running the project with docker

Prerequisites:

- Docker 17.05 or higher
- docker-compose

In the root of this repository, run
```bash
docker-compose up
```
This may take a while. Once the containers has finished building, start the server which is available here: https://github.com/glsp-extensions/semantic-zoom-server. \
NOTE: If the client was started with docker, the server should also be started with docker.

Once the server is running, navigate to http://localhost:8080/diagram.html in your browser.

## Running the project locally
Prerequisites:

-   Node 16 or higher
-   Yarn 1.7.0 or higher

In the root of this repository, run

```bash
yarn install
```

Next, the server has to be started. Follow the instructions here: https://github.com/glsp-extensions/semantic-zoom-server. \
NOTE: If the client was started locally, the server should also be started locally.

Once the server is running, open the `glsp-client/examples/workflow-standalone/app/diagram.html` file in your browser.


## Performance evaluation

Information about the performance evaluation can be found in the branch [performance-evaluation](https://github.com/glsp-extensions/semantic-zoom-client/tree/performance-evaluation).
