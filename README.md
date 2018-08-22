# WorkSpace
This project is a work space where deploy useful tools for my daily developing.

# What is this Project
This project is to create some useful tools which always used by my daily backend development. And integrating those tools at one website. The early stage of this project will implement `Todo` tools and `jupyter notebook`, using the docker, python tornado, React and Postgre.
And maybe at the middle stage I will try to implement `blog` tools and add config options for `jupyter notebook` containers. 

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
