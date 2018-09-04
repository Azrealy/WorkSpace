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
        else:
            self.base_url = 'http://{}:{}'.format(hostname, port)

    def _make_asy_http_client(self):
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
                  body=None, **kwargs):
        """
        Calls Docker API use AsyncHTTPClient of tornado

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
        kwargs : dict
            Other parameters to pass `AsyncHTTPClient.fetch()`.
            what can also overwrite the `self.client_params` parameters.

        Returns
        -------
        response : tornado.httpclient.HTTPResponse
            A response of Docker API
        """
        api_url = '{}{}'.format(self.base_url, path)
        app_log.debug('call docker api: %s', api_url)
        http_client = self._make_asy_http_client()
        result = yield http_client.fetch(api_url,
                                         method=method,
                                         headers=headers,
                                         body=body,
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
            Callback function which this is given by obsever.on()

        Returns
        -------
        response : dict
            API Response as JSON.
            If on_event is given, returns '{"response": ""}'.
        """
        @gen.coroutine
        def _on_event(event):
            yield gen.sleep(2)
            yield gen.maybe_future(on_event(DockerEvent(event)))

        query_params = {}
        if since:
            query_params['since'] = int(since)  # Convert timestamp to int/sec for Docker API
        if until:
            query_params['until'] = int(until)  # Convert timestamp to int/sec for Docker API

        streaming_callback = _on_event if on_event else None

        # Set 315360000 (10 years) to request_timeout to avoid timeout
        response = yield self._call_api('GET', url_concat('/events', query_params),
                                        streaming_callback=streaming_callback,
                                        request_timeout=315360000)
        return dict(response=response.body.decode())

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