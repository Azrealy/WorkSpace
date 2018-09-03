# -*- coding: utf-8 -*-
import docker
import time
from pathlib import Path
import re
import os
import json
from tornado.escape import json_decode
from tornado import gen, ioloop
from tornado.httputil import url_concat
from tornado.log import app_log
from docker.tls import TLSConfig
from .event import DockerEvent
from tornado.httpclient import AsyncHTTPClient


class DockerAPIClient(object):
    """
    AsyncHTTPClient based Docker client.
    """
    def __init__(self, host=None, tlsverify=None, tlscacert=None, tlscert=None, tlskey=None):
        """
        Initializes DockerRunner.

        Parameters
        ----------
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
        self.compose_connection_opts = ['--host', host or os.getenv('DOCKER_HOST', '')]
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

            self.compose_connection_opts.extend(['--tlsverify',
                                                 '--tlscacert', self.client_params['ca_certs'],
                                                 '--tlscert', self.client_params['client_cert'],
                                                 '--tlskey', self.client_params['client_key']])
        else:
            self.base_url = 'http://{}:{}'.format(hostname, port)

    def _make_http_client(self):
        """
        Makes the AsyncHTTPClient.

        Returns
        -------
        http_client : AsyncHTTPClient
            AsyncHTTPClient instance to call the Docker API.
        """
        return AsyncHTTPClient()

    @gen.coroutine
    def _call_api(self, method, path, headers={'Content-Type': 'application/json'},
                  body=None, body_producer=None, **kwargs):
        """
        Calls Docker API

        Parameters
        ----------
        method : str
            HTTP Method.
        path : str
            A Path of API.
        headers : dict{str: str}
            Request Headers.
        body : str or bytes
            Request Body.
        body_producer : func
            Callable used for lazy/asynchronous request bodies.
        kwargs : dict
            Other parameters to pass `AsyncHTTPClient.fetch()`.

        Returns
        -------
        response : tornado.httpclient.HTTPResponse
            A response of Docker API
        """
        api_url = '{}{}'.format(self.base_url, path)
        app_log.debug('call docker api: %s', api_url)
        http_client = self._make_http_client()
        result = yield http_client.fetch(api_url,
                                         method=method,
                                         headers=headers,
                                         body=body,
                                         body_producer=body_producer,
                                         **dict(self.client_params, **kwargs))
        app_log.debug('complete to call docker api: %s', api_url)
        return result

    @gen.coroutine
    def events(self, since=None, until=None, on_event=None):
        """
        Calls 'Get /events'.
        This request will never return response
        unless `until` option is specified.

        Parameters
        ----------
        since : float
            Python timestamp(float/micro sec)
            Show all events created since timestamp
        until : float
            Python timestamp(float/micro sec)
            Show events created until given timestamp
        on_event : function
            Callback function that gets DockerEvent
            object as an argument.
            This function is called whenever each event is emitted.

        Returns
        -------
        response : dict
            API Response as JSON.
            If on_event is given, returns '{"response": ""}'.
        """
        @gen.coroutine
        def _on_event(event):
            yield gen.maybe_future(on_event(DockerEvent(event)))

        query_params = {}
        if since:
            query_params['since'] = int(since)  # Convert timestamp to int/sec for Docker API
        if until:
            query_params['until'] = int(until)  # Convert timestamp to int/sec for Docker API

        streaming_callback = _on_event if on_event else None

        # Set 315360000 (10 years) to request_timeout to avoid timeout
        # before the time specified by `until`,
        # because the default value of request_timeout is 20sec
        response = yield self._call_api('GET', url_concat('/events', query_params),
                                        streaming_callback=streaming_callback,
                                        request_timeout=315360000)
        return dict(response=response.body.decode())

    @gen.coroutine
    def list_containers(self, all=False, filters=None, **kwargs):
        """
        Calls 'GET /containers/json'

        Parameters
        ----------
        all : bool
            Lists all containers if it sets True; otherwise lists
            running containers.
        filters : dict{str: str}
            Settings to filter list of containers.
        kwargs : dict{str: list[str]}
            Other API parameters.

        Returns
        -------
        container_list: list of dict
            API Response as JSON.
        """
        query_params = {}
        query_params.update(kwargs)
        if all:
            query_params['all'] = '1'

        if filters:
            query_params['filters'] = json.dumps(filters)

        response = yield self._call_api('GET', url_concat('/containers/json', query_params))
        return json_decode(response.body)

    @gen.coroutine
    def inspect_container(self, id):
        """
        Calls 'GET /containers/<ID of container>/json'

        Parameters
        ----------
        id : str
            Container ID

        Returns
        -------
        inspect_result : DockerInspectResult
            DockerInspectResult object.
        """
        api_path = '/containers/{}/json'.format(id)
        response = yield self._call_api('GET', api_path)
        return json_decode(response.body)