# -*- coding: utf-8 -*-
from tornado.escape import json_decode


class DockerEvent(object):
    """
    Accessor of each event emitted from Docker API 'GET /events'
    """

    def __init__(self, event):
        """
        Initializes DockerEvent
        """
        if isinstance(event, bytes):
            event = json_decode(event)
        self.event = event

    @property
    def name(self):
        """
        Returns the name of Docker container, network or volume.

        Returns
        -------
        name : str
            Container name.
        """
        return self.event['Actor']['Attributes'].get('name')

    @property
    def event_type(self):
        """
        Returns the event type. (e.g. container, network or volume)

        Returns
        -------
        type : str
            Event type.
        """
        return self.event['Type']

    @property
    def event_type_is_container(self):
        """
        Returns whether the event is a container.

        Returns
        -------
        event_type_is_container : bool
            If the events's type is container,
            returns true.
        """
        return self.event_type == 'container'

    @property
    def action(self):
        """
        Returns the event's action. (e.g. create, start, stop, kill, destroy, etc...)
        """
        return self.event['Action']

    @property
    def container_id(self):
        """
        Returns the ID of the Docker container, network or volume.

        Returns
        -------
        id : str
            ID of Docker container, network or volume.
        """
        return self.event['Actor']['ID']

    @property
    def timestamp(self):
        """
        Returns the timestamp of event.

        Returns
        -------
        timestamp : float
            The timestamp of event.
        """
        return self.event['timeNano'] / 1000000000

    def __repr__(self):
        """
        DockerEvent's representation

        Returns
        -------
        repr : str
            DockerEvent's representation.
        """
        repr_format = (
            '<%s {timestamp: %f, event_type: %s, action: %s, container_id: %s, name: %s}>'
        )
        return repr_format % (self.__class__.__name__, self.timestamp, self.event_type,
                              self.action, self.container_id, self.name)
