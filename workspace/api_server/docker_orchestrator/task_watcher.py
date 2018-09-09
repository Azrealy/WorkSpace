# -*- coding: utf-8 -*-
from rx import Observable
import rx
from tornado import gen
from .event import DockerEvent
from tornado.log import app_log
from tornado.escape import json_encode
from .event_manager import EventManager
from datetime import timedelta
from tornado.httpclient import HTTPError
from datetime import datetime, timezone


def docker_events(docker_client, reconnect_wait=5.0):
    """
    Creates observable sequence from the real-time events
    stream of the docker daemon.

    Parameters
    ----------
    docker_client : DockerClient
        DockerClient object.
    reconnect_wait : float
        Reconnection wait time on unexpected error occurred.
        (sec)

    Returns
    -------
    observable_ : rx.Observable
        The observable sequence which contains `DockerEvent`s from
        the docker daemon.
    """
    @gen.coroutine
    def receive_event(observer):
        since = datetime.now(timezone.utc).timestamp()
        while True:
            try:
                yield docker_client.events(since=since, on_event=observer.on_next)
            except HTTPError as e:
                app_log.exception('unexpected http error occurred. reconnect...')
                yield gen.sleep(reconnect_wait)

    def wrap_coroutine(observer):
        # wrap coroutine because Observable.subscribe() cannot return Future object.
        receive_event(observer)

    return rx.Observable.create(wrap_coroutine)


class DockerEventObserver(rx.Observer):

    ACCEPTABLE_ACTIONS = ['create', 'start', 'die', 'destroy', 'health_status: healthy',
                          'health_status: unhealthy']
    def __init__(self, redis_client):
        """
        Initialize the Docker Event Observer
        
        Parameters
        ----------
        redis_client:
            The client of redis.
        """
        self.redis_client = redis_client

    @gen.coroutine
    def on_next(self, event):
        """
        Handle docker event which callback from AsyncHTTPClient.

        Parameters
        ----------
        event: DockerEvent
            Information about the docker event.
        """
        if not event.event_type_is_container or event.action not in self.ACCEPTABLE_ACTIONS:
            return

        if event.action == 'create':
            operation = 'create_instance'
        elif event.action == 'destroy':
            operation = 'delete_instance'
        else:
            operation = 'update_instance_status'

        payload = {
            'operation': operation,
            'container_id': event.container_id,
            'container_name': event.name
        }
        app_log.debug('docker event payload has stored in redis: %s', payload)
        self.redis_client.rpush(EventManager.QUEUE_KEY, json_encode(payload))

    def on_error(self, error):

        pass

    def on_completed(self):

        pass
