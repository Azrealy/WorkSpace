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

    def initialize(self, psql_pool, redis_url, **kwargs):
        """
        Initializes BaseRequestHandler.
        """
        self._redis_url = redis_url
        self._psql_pool = psql_pool

    @gen.coroutine
    def get(self):
        """
        GET /container
        """
        result = yield Container(self._psql_pool).find_all()
        if result:
            result[0]['created_at'] = float(result[0]['created_at'])
            result[0]['update_at'] = float(result[0]['update_at'])
            self.write({'container': result[0]})
            app_log.info('get todo succeeded : %s', {'container': result[0]})
        else:
            self.write({'container': None})
    
    @gen.coroutine
    def post(self):
        """
        POST /container
        """
        req_data = escape.json_decode(self.request.body)
        container_name = req_data.get('container_name')
        yield Container(
            self._psql_pool,
            container_name=container_name,
            status='creating'
        ).save()
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

