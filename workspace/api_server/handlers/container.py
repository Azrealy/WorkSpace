# -*- coding: utf-8 -*-
import time
import json
from tornado import web, gen, escape
from workspace.model.fields.container import Container
from datetime import datetime
from tornado.log import app_log
from ..docker_orchestrator.container_manager import ContainerManager
from workspace.utility import create_redis_client


class ContainerHandler(web.RequestHandler):


    def initialize(self, redis_url, **kwargs):
        """
        Initializes BaseRequestHandler.
        """
        self._redis_url = redis_url

    def get(self):
        """
        GET /container
        """
        result = Container.find_all()
        if result:
            self.write({"container": result[0]})
            app_log.info('get todo succeeded : %s', {"container": result[0]})
        else:
            self.write({'container': None})
    
    def post(self):
        """
        POST /container
        """
        req_data = escape.json_decode(self.request.body)
        container_name = req_data.get('container_name')
        payload = {
            'operation': 'create_container',
            'container_name': container_name
        }
        redis_client = create_redis_client(self._redis_url)
        redis_client.rpush(ContainerManager.QUEUE_KEY, escape.json_encode(payload))
        self.set_status(202, 'Accepted')


class ContainerDeleteHandler(web.RequestHandler):


    def initialize(self, redis_url, **kwargs):
        """
        Initializes BaseRequestHandler.
        """
        self._redis_url = redis_url

    def delete(self, container_name):
        """
        DELETE /container
        """
        payload = {
            'operation': 'delete_container',
            'container_name': container_name
        }
        redis_client = create_redis_client(self._redis_url)
        redis_client.rpush(ContainerManager.QUEUE_KEY, escape.json_encode(payload))
        self.set_status(202, 'Accepted')

