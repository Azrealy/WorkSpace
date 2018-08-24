# -*- coding: utf-8 -*-
import os
from tornado import gen
from tornado.escape import json_encode, json_decode
from tornado.httpclient import HTTPError
from tornado.log import app_log
from workspace.model.fields.container import Container
from concurrent.futures import ThreadPoolExecutor
from tornado.concurrent import run_on_executor
from tornado.ioloop import IOLoop
from .event_manager import JobRunner


class ContainerManager(JobRunner):
    """
    The JobRunner for processing jobs about `create container`
    and `Delete container`
    """
    QUEUE_KEY = 'workspace:job-queue:container-manager'

    def __init__(self, redis_client, docker_client):
        """
        Initializes AAClusterStateUpdater

        Parameters
        ----------
        redis_client : redis.Redis
            A client to get job from Redis and to publish events
            to Redis.
        docker_client : DockerClient
            The docker client to get statuses of containers.
        """
        super().__init__(redis_client)
        self._docker_client = docker_client

    @gen.coroutine
    def run_job(self, job):
        """
        Runs the job about the `Update statuses of Container`
        request.

        Parameters
        ----------
        job : dict
            Job data which is popped from the queue
        """
        operation_type = job['operation']
        container_name = job['container_name']

        app_log.info('start run job: %s', operation_type)


        if operation_type == 'create_container':
            app_log.info('subprocess to compose up: %s', container_name)
        elif operation_type == 'delete_container':
            app_log.info('subprocess to compose down: %s', container_name)
        else:
            app_log.warn('Received invalid job: %s', job)

        app_log.info('end run job: %s', operation_type)


