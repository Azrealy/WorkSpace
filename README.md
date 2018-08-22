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
 
# Todo
* Implement api server for execute CRUD `todo` and `container` object.
* Implement Docker file use to build jupyter container.
* Implement WorkSpace front end UI for CREUD `todo` object.
* Implement WorkSpace front end UI for Create/Delete `jupyter` container.
