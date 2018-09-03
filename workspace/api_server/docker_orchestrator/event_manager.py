# -*- coding: utf-8 -*-
import os
import time
from tornado import gen
from tornado.escape import json_encode, json_decode
from tornado.httpclient import HTTPError
from tornado.log import app_log
from workspace.model.fields.container import Container
from concurrent.futures import ThreadPoolExecutor
from tornado.concurrent import run_on_executor
from tornado.ioloop import IOLoop


class JobRunner(object):
    """
    Runner for doing jobs which is queued in Redis.
    """
    QUEUE_POP_TIMEOUT = 5

    def __init__(self, redis_client):
        """
        Initializes JobRunner

        Parameters
        ----------
        redis_client : redis.Redis
            A client to pop the job from the queue in Redis.
        """
        self._redis_client = redis_client
        self.executor = ThreadPoolExecutor(1)
        self._is_running = True

    def stop(self):
        """
        Stops the runner.
        """
        self._is_running = False

    @gen.coroutine
    def watch_queue(self):
        """
        Starts watching the queue and run the job in queue.
        """
        while self._is_running:
            job = yield self.get_job()
            if job is None:
                continue

            try:
                yield self.run_job(job)
            except Exception:
                self.stop()
                app_log.exception('Unexpected exception occurred.')

    @run_on_executor
    def get_job(self):
        """
        Gets the Job in queue which name is same as `self.QUEUE_KEY`.

        Returns
        -------
        job : dict or None
            New job data which is popped from the queue.
            `None` is returned when timeout.
        """
        # Without `timeout`, this never stop on `KeyboardInterrupt`
        job_data = self._redis_client.blpop(self.QUEUE_KEY, self.QUEUE_POP_TIMEOUT)
        if job_data is None:
            return None

        try:
            job = json_decode(job_data[1])
            errors = self.validate_job(job)
            if len(errors) > 0:
                raise ValueError(
                    'Validation failed: {}{}'.format(os.linesep, os.linesep.join(errors))
                )

            return job
        except ValueError:
            app_log.exception('Invalid job_data is received: %s', job_data)
            return None

    def validate_job(self, job):
        """
        Validate the job data.

        Parameters
        ----------
        job : dict
            Job data which is popped from the queue.

        Returns
        -------
        errors : list[str]
            Error messages if the validation is failed.
        """
        errors = []
        if 'operation' not in job:
            errors.append('"operation" must not be empty.')

        return errors
        
    @gen.coroutine
    def run_job(self, job):
        """
        Runs the job.

        Parameters
        ----------
        job : dict
            Job data which is popped from the queue.
        """
        raise NotImplementedError()


class EventManager(JobRunner):
    """
    The JobRunner for processing jobs about `Update statuses of
    ServiceInstances` requests.
    """
    QUEUE_KEY = 'workspace:job-queue:even-manager'

    def __init__(self, redis_client, docker_client, jupyter_token, jupyter_port, psql_pool):
        """
        Initializes StateUpdater

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
        self._psql_pool = psql_pool

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
        container_id = job['container_id']
        container_name = job['container_name']

        app_log.info('start run job: %s', operation_type)

        if operation_type == 'create_instance':
            yield self.create_or_update_container(container_id, container_name)
        elif operation_type == 'update_instance_status':
            yield self.create_or_update_container(container_id, container_name)
        elif operation_type == 'delete_instance':
            yield self.delete_container(container_name)
        else:
            app_log.warn('Received invalid job: %s', job)

        app_log.info('end run job: %s', operation_type)


    @gen.coroutine
    def delete_container(self, container_name):
        """
        Delete container.

        Parameters
        ----------

        container_name : str
            Docker container name
        """
        find_result = yield Container(self._psql_pool).find(container_name)
        if find_result is None:
            app_log.info('contianer has been deleted: %s', container_name)
            return
        result = yield Container(
            self._psql_pool,
            container_name=container_name,
        ).remove()
        app_log.info('container has be deleted : %s', result)


    @gen.coroutine
    def _inspect_container_with_retry(self, container_id, retry_count=0, retry_wait=0.1):
        """
        Inspect container with retry.

        Parameters
        ----------
        container_id : str
            Id of the docker container which is related to the
            ServiceInstance.
        retry_count : int
            Retry count.
        retry_wait : float
            Retry wait time on HTTPError occurred. (sec)

        Returns
        -------
        inspect_result : DockerInspectResult
            DockerInspectResult object.

        Raises
        ------
        tornado.httpclient.HTTPError
            When failed to inspect container.
        """
        try:
            return (yield self._docker_client.inspect_container(container_id))
        except HTTPError as e:
            app_log.debug(
                'Failed to inspect container %s. it may cause on deleting container.', container_id
            )
            if e.code == 404:
                return None
            elif retry_count < 10:
                app_log.debug('retry inspect container %s...', container_id)
                yield gen.sleep(retry_wait)
                return (yield self._inspect_container_with_retry(
                    container_id, retry_count + 1, retry_wait
                ))
            else:
                app_log.warn('Retry limit is exceeded. container=%s', container_id)
                raise

    @gen.coroutine
    def create_or_update_container(self, container_id, container_name):
        """
        Creates or updates the state of container.

        Parameters
        ----------
        container_id : str
            Id of the docker container.

        container_name : str
            Docker container name
        """
        inspect_container = yield self._inspect_container_with_retry(container_id)
        if inspect_container is None:
            app_log.info('Container %s is not found.', container_id)
            return
        status = inspect_container['State']['Status']
        health = inspect_container['State'].get('Health', {}).get('Status')
        result = yield Container(
            self._psql_pool,
            container_id=container_id,
            container_name=container_name,
            status=status,
            health=health,
            update_at=time.time(),
            jupyter_token=self._token,
            jupyter_url='http://localhost:{}'.format(self._port)
        ).update()
        app_log.info('container update result : %s', result)
