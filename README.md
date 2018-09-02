# WorkSpace
This project is a work space application where implement some usefull tools at my daily development.

# Requirement
* pip version 9.0.1
* docker version 18.06.0-ce
* python version 3.6
* redis version 4.0.11
* yarn version 1.7.0
* jq version 1.5 (For test the server response)

# About this Project

This project is to create some useful tools which always used by my daily development. And integrating those tools at one website. At the early stage of this project I will implement `Todo List` tools and `jupyter notebook`. Using the docker for deploy `jupyter notebook`, python tornado for the backend server, React and Redux for Front End, Sqlite3 for Database. This is my personal project and the purpose that I building this project is for trainning my full-stack skills where include the programming design skill and coding skill at web development. In the future of this project I will try to improvement `todo` tools with `Deadline` and `Priority` feature and add some config options for creating `jupyter notebook` containers. 

# Setup Back End server

Create Virtualenv for developing backend server
```sh
% mkvirtualenv --clear --no-download -p /usr/bin/python3 dev-workspace
```
If mkvirtualenv doesn't setup before, following this guide to setup it.

  * pip install virtualenvwrapper.
    ```sh
    % pip install virtualenvwrapper
    ```
  * setup mkvirtualenv command.
    ```sh
    % export WORKON_HOME=~/Envs
    % mkdir -p $WORKON_HOME
    % source /usr/local/bin/virtualenvwrapper.sh
    % mkvirtualenv dev-workspace
    ```

After the python virtualenv setup, install `WorkSpace` package to site-packages:
```sh
(dev-workspace)% python setup.py develop 
```
<aside class="notice">
* If failed to implement the setup.py use develop option check the `pip` version and python version whether satisfied the requirement.
</aside>

Running the Web API server and orchestrator server:
```sh
(dev-workspace)% webapi_server
(dev-workspace)% orchestrator_server
```
Using this `curl_tests/<bash.sh>` to check the server response.

# Setup the Front End client

At the frontend I use yarn to manager the package. First move to the dir `workspace-app` and run `yarn` to fetch the package we need.
```sh
(dev-workspace)% cd workspace-app
(dev-workspace)% yarn
```
after the package be installed you can run the client.
```
(dev-workspace)% yarn start
```
if the server is working you can access the port 3000 to see this app.

# Architecture of Docker container server

* `ContainerManager` class for handle the `docker run` and `docker rm` cmd to create/remove container by using subprocess.
* `EventManager` class for listen the event stream from `docker event` cmd, depends those events status to update container object.
* `ContainerHandler` class for handle the request of create/remove container request and response a container object to webUI. 

Using redis to connect the `ContainerHandle` class, `EventManager` class and `ContainerManager` class. Browser send a request of create container, `ContainerHandle` receive this request and store as a dict of `operation_type: CREATE` and `container_name: <NAME>` to the redis queue. `ContainerManager` will inherit `TaskWatcher` class to listen redis queue, when the dict stored by the `ContainerHandle` in the queue, take out this dict from queue and depending the `operation_type` to execute `docker` cmd.

# Architecture of Front End

* Use the middleware of `logic` to connect with server for fetching data, post request etc...
* Use the `rx.observable` to listen the response from the server and dispatch the action.
* Use `redux` state manager to handle the state and props between different component.
* Use `route` handle the route change.

# Container status

Inspect the Container attributes that we will find the container states of tranformation parrten like blow.
The key of status `health` is seted at the docker-compose file, use `curl` cmd to check extra jupyter network connection status of container.
 * `docker run` from `{status: running, health: starting}` to `{status: running, health: healthy}`.

 * `docker delete` from `{status: exited, health: healthy}` to None.

TODO memo: As use the sqlites library, when I implement DB CRUD, the processing will block and wait for the result, If the exception arise, `JobRunner` will keep running but the job after the exception will blocking. 

# Build docker image
Use the following command to build jupyter image base on the `Dockerfile`.
```sh
(dev-workspace)% docker build . -t jupyter
```
check the jupyter images
```sh
(dev-workspace)% docker images
REPOSITORY               TAG                 IMAGE ID            CREATED             SIZE
jupyter                  latest              e7637b52c526        15 minutes ago      542MB
```

# Run jupyter container
Run the jupyter container  with mapping post of 8888:8888 and mounting the local directory as the `Volume` of jupyter container. We can use '-t' make container execute in background.
```sh
(dev-workspace)%  docker run -it -p 8888:8888 -v "$PWD":/home/jupyter <IMAGE ID> --allow-root
```
Create hashed jupyter password, using the ipython terminal 
```sh
(dev-workspace)% python generate_jupyter_token --password='password'
```
# Todo
* <s>Implement api server for execute CRUD `todo` and `container` object.</s>
* <s>Implement container orchestrator server for create/delete/update container.</s>
* <s>Create Dockerfile for building jupyter image.</s>
* <s>Create docker-compose.yml for building cluster jupyter images.</s>
* <s>Implement WorkSpace front end UI for CREUD `todo` object.</s>
* <s>Implement WorkSpace front end UI for Create/Delete `jupyter` container.</s>
