# WorkSpace
This project is a work space where deploy useful tools for my daily developing.

# About this Project
This project is to create some useful tools which always used by my daily backend development. And integrating those tools at one website. The early stage of this project will implement `Todo` tools and `jupyter notebook`, using the docker, python tornado, React and Postgre.
And maybe at the middle stage I will try to implement `blog` tools and add config options for `jupyter notebook` containers. 

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

After the python virtualenv setup, install `WorlSpace` package to site-packages:
```sh
(dev-workspace)% python setup.py develop 
```
Start the Web API server in the background:
```sh
(dev-workspace)% webapi_server
```
Using this `curl_tests/<bash.sh>` to check the server response.
 
# Architecture of Docker container server

* `ContainerManager` class for handle the `docker run` and `docker rm` cmd to create/remove container by using subprocess.
* `EventManager` class for listen the event stream from `docker event` cmd, depends those events status to update container object.
* `ContainerHandle` class for handle the request of create/remove container request and response a container object to webUI. 

Using redis to connect the `ContainerHandle` class, `EventManager` class and `ContainerManager` class. Browser send a request of create container, `ContainerHandle` receive this request and store as a dict of `operation_type: CREATE` and `container_name: <NAME>` to the redis queue. `ContainerManager` will inherit `TaskWatcher` class to listen redis queue, when the dict stored by the `ContainerHandle` in the queue, take out this dict from queue and depending the `operation_type` to execute `docker` cmd.  

# Build docker image
Use the following command to build jupyter image base on the `Dockerfile`.
```sh
% docker build . -t jupyter
```
check the jupyter images
```sh
% docker images
REPOSITORY               TAG                 IMAGE ID            CREATED             SIZE
jupyter                  latest              e7637b52c526        15 minutes ago      542MB
```

# Run jupyter container
Run the jupyter container  with mapping post of 8888:8888 and mounting the local directory as the `Volume` of jupyter container. We can use '-t' make container execute in background.
```sh
% docker run -it -p 8888:8888 -v "$PWD":/home/jupyter <IMAGE ID> --allow-root
```
Create hashed jupyter password, using the ipython terminal 
```sh
from notebook.auth import passwd
passwd()
```
# Todo
* Implement api server for execute CRUD `todo` and `container` object.
* Implement Docker file use to build jupyter container.
* Implement WorkSpace front end UI for CREUD `todo` object.
* Implement WorkSpace front end UI for Create/Delete `jupyter` container.
