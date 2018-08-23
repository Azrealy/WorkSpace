# -*- coding: utf-8 -*-
from rx import Observable
import rx
from .event import DockerEvent
from tornado.log import app_log

def docker_events_observable(events):

    def receive_event(observer):

        for e in events:
            observer.on_next(e)

    return Observable.create(receive_event)

class DockerEventObserver(rx.Observer):

    ACCEPTABLE_ACTIONS = ['create', 'start', 'die', 'destroy', 'health_status: healthy',
                          'health_status: unhealthy']
    def __init__(self, redis_client):
        self.redis_client = redis_client

    def on_next(self, event):
        #print(event)
        event = DockerEvent(event)

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
        }
        app_log.info('docker event payload: %s', payload)

    def on_error(self, error):

        pass

    def on_completed(self):

        pass
