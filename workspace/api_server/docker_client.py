# -*- coding: utf-8 -*-
import docker
import datetime
import time
from pathlib import Path
import re
import os
from tornado.escape import json_decode
from tornado import gen, ioloop
from concurrent.futures import ThreadPoolExecutor
from tornado.concurrent import run_on_executor
from docker.tls import TLSConfig
from .task_watcher import docker_events_observable, DockerEventObserver


class DockerAPIClient(object):
    """
    Depend on containers number creating multithreading to get container logs.
    """
    def __init__(self, num_containers, version, host=None, tlsverify=None,
                 tlscacert=None, tlscert=None, tlskey=None):
        """
        Initializes ContainerLogsGetter.

        Parameters
        ----------
        num_containers: int
            Number of containers.
        version: str
            The version of the API to use.
        host : str or None
            A URL to connect Docker Engine or Swarm Manager.
            If you set this parameter is None, the value is get from
            environment variable named `DOCKER_HOST`.
        tlsverify : bool or None
            If it sets True, use TLS to connect Docker Engine or Swarm Manager.
            If you set this parameter is None, the value is get from
            environment variable named `DOCKER_TLS_VERIFY`.
        tlscacert : str or None
            A path to CA for verifying TLS Trust certs.
            This parameter is not used when tlsverify is set False.
            If you set this parameter is None, the value is set to
            `DOCKER_CERT_PATH/ca.pem` (DOCKER_CERT_PATH is a environment
            variable and `/.docker` is used if DOCKER_CERT_PATH does
            not exist).
        tlscert : str or None
            A path to TLS certificate file.
            This parameter is not used when tlsverify is set False.
            If you set this parameter is None, the value is set to
            `DOCKER_CERT_PATH/cert.pem` (DOCKER_CERT_PATH is a environment
            variable and `/.docker` is used if DOCKER_CERT_PATH does
            not exist).
        tlskey : str or None
            A path to TLS key file.
            This parameter is not used when tlsverify is set False.
            If you set this parameter is None, the value is set to
            `DOCKER_CERT_PATH/key.pem` (DOCKER_CERT_PATH is a environment
            variable and `/.docker` is used if DOCKER_CERT_PATH does
            not exist).
        """
        m = re.match('tcp://(.*):(.*)', host or os.getenv('DOCKER_HOST', ''))
        if m is None:
            raise ValueError('Cannot get URL of Docker Daemon.')
        hostname = m.group(1)
        port = m.group(2)

        self.client_params = {}
        self.config_client = {}
        use_tls = tlsverify if tlsverify is not None else os.getenv('DOCKER_TLS_VERIFY', '') != ''
        if use_tls:
            self.base_url = 'https://{}:{}'.format(hostname, port)
            default_cert_path = Path(os.getenv(
                'DOCKER_CERT_PATH', '{}/.docker'.format(os.getenv('HOME'))
            ))
            if tlscacert:
                self.client_params['ca_certs'] = tlscacert
            else:
                self.client_params['ca_certs'] = str(default_cert_path / 'ca.pem')

            if tlscert:
                self.client_params['client_cert'] = tlscert
            else:
                self.client_params['client_cert'] = str(default_cert_path / 'cert.pem')

            if tlskey:
                self.client_params['client_key'] = tlskey
            else:
                self.client_params['client_key'] = str(default_cert_path / 'key.pem')

            self.config_client['tls'] = TLSConfig(
                client_cert=(self.client_params['client_cert'],
                             self.client_params['client_key']),
                ca_cert=self.client_params['ca_certs'],
                verify=use_tls
            )
        else:
            self.base_url = 'http://{}:{}'.format(hostname, port)
        self.config_client['version'] = version
        self.config_client['base_url'] = self.base_url
        self.num_containers = num_containers
        self.executor = ThreadPoolExecutor(self.num_containers)
        self.client = docker.DockerClient(**self.config_client)
        self._streams = []


    @run_on_executor
    def running_observable(self, redis_client):
        """
        Run the observable of docker event
        """
        docker_events = self.client.events()
        observable = docker_events_observable(docker_events)
        observable.subscribe(DockerEventObserver(redis_client))
        

    def close(self):
        """
        Close the all connections of Docker Daemon.
        """
        for s in self._streams:
            s.close()
        self.client.close()
