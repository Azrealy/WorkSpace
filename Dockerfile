# Use the latest ubuntu image as base for 
# create the jupytyer image
FROM ubuntu:latest

# Run system update to get it up to speed
# Then install python3 and pip3
RUN apt-get update && apt-get install -y python3 \
    python3-pip

# Install jupyter
RUN pip3 install jupyter

# Set the container working directory to the user home folder
WORKDIR /home/jupyter

# Copy local requirements.txt to working directory.
ADD requirements.txt /home/jupyter

# Install the requirements package.
RUN pip3 install -r requirements.txt

# install jupyterthemes
RUN pip3 install jupyterthemes

# upgrade to latest version
RUN pip3 install --upgrade jupyterthemes

# jupyter generate a config file
RUN jupyter notebook --generate-config

# Over write the password config by password basing sha1
RUN echo "c.NotebookApp.password='sha1:99b351688831:68b0859fb2e3a2afde311a76cb40871fec3db531'">>/root/.jupyter/jupyter_notebook_config.py

# Start the jupyter notebook
ENTRYPOINT ["jupyter", "notebook", "--ip=*"]

