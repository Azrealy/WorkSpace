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
from tornado.process import Subprocess
from subprocess import CalledProcessError
from tornado.escape import to_unicode


class ContainerManager(JobRunner):
    """
    The JobRunner for processing jobs about `create container`
    and `Delete container`
    """
    QUEUE_KEY = 'workspace:job-queue:container-manager'

    def __init__(self, redis_client, docker_client, jupyter_token, jupyter_port):
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
        self._token = jupyter_token
        self._port = jupyter_port

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

        env = dict(
            os.environ, CONTAINER_TOKEN=self._token, CONTAINER_PORT=self._port,
            CONTAINER_NAME=container_name
        )

        if operation_type == 'create_container':
            app_log.info('subprocess to compose up: %s', container_name)
            result = yield self._run_process(['docker-compose', 'up', '-d'], env=env)
            app_log.info('result of compose up: %s', result)
        elif operation_type == 'delete_container':
            app_log.info('subprocess to compose down: %s', container_name)
            result = yield self._run_process(['docker-compose', 'down'], env=env)
            app_log.info('result of compose down: %s', result)
        else:
            app_log.warn('Received invalid job: %s', job)

        app_log.info('end run job: %s', operation_type)

    @gen.coroutine
    def _run_process(self, cmd, env=None):
        """
        Execute the subprocess of `docker-compose up`
        """
        proc = Subprocess(cmd, stdout=Subprocess.STREAM,
                          stderr=Subprocess.STREAM, env=env)

        app_log.info('read outputs from Subprocess: %s', cmd)
        outputs = yield [proc.stdout.read_until_close(), proc.stderr.read_until_close()]
        try:
            yield proc.wait_for_exit()
        except CalledProcessError:
            app_log.error('Process is exited abnormally. stderr: %s', outputs[1])
            raise

        return {'stdout': to_unicode(outputs[0]), 'stderr': to_unicode(outputs[1])}


