# -*- coding: utf-8 -*-
import signal
import logging
from tornado.log import LogFormatter, app_log, access_log, gen_log
from tornado import web, ioloop, gen, autoreload
from workspace.api_server.handlers.todo import TodoListHandler, TodoInfoHandler
from tornado.httpserver import HTTPServer
from traitlets import Dict, Integer, Unicode, observe, Float, Bool
from traitlets.config.application import catch_config_error, Application
from .docker_orchestrator.docker_client import DockerAPIClient
from workspace.utility import create_redis_client, create_psql_connection_pool
from .docker_orchestrator.event_manager import EventManager
from workspace.model.fields.container import Container
from .docker_orchestrator.container_manager import ContainerManager
from .docker_orchestrator.task_watcher import docker_events, DockerEventObserver


class OrchestratorServer(Application):
    """
    The main application of Orchestrator Server.
    """
    name = 'orchestrator_server'
    description = 'Orchestrator Server'

    aliases = {
        'redis-url': 'OrchestratorServer.redis_url',
        'database_url': 'OrchestratorServer.database_url',
        'jupyter-token': 'OrchestratorServer.jupyter_token',
        'jupyter-port': 'OrchestratorServer.jupyter_port',
        'docker-host': 'OrchestratorServer.docker_host',
        'docker-tlscacert': 'OrchestratorServer.docker_tlscacert',
        'docker-tlscert': 'OrchestratorServer.docker_tlscert',
        'docker-tlskey': 'OrchestratorServer.docker_tlskey',
        'docker-from-env': 'OrchestratorServer.docker_from_env',
        'docker-api-version': 'OrchestratorServer.docker_api_version',
        'psql-url': 'OrchestratorServer.psql_url'
    }

    database_url = Unicode(
        '', config=True,
        help='The database url.'
    )


    flags = {
        'debug': (
            {'Application': {'log_level': logging.DEBUG}},
            'set log level to logging.DEBUG (maximize logging output)'
        )
    }

    _log_formatter_cls = LogFormatter

    def _log_level_default(self):
        """
        Gets the default log level.

        Returns
        -------
        level : int
            Default log level.
        """
        return logging.INFO

    def _log_datefmt_default(self):
        """
        Gets the default datetime format in logs.

        Returns
        -------
        datefmt : str
            Default datetime format in logs.
        """
        return '%H:%M:%S'

    def _log_format_default(self):
        """
        Gets the default log format.

        Returns
        -------
        datefmt : str
            Default log format.
        """
        return (u'%(color)s[%(levelname)1.1s %(asctime)s.%(msecs).03d '
                u'%(name)s]%(end_color)s %(message)s')

    jupyter_token = Unicode(
        'c8de56fa4deed24899803e93c227592aef6538f93025fe01', config=True,
        help='jupyter token use to access'
    )

    jupyter_port = Unicode(
        '8893', config=True,
        help='The port the jupyter container to access.'
    )

    docker_host = Unicode(
        '', config=True,
        help='a URL to connect Docker daemon (Docker Engine or Swarm Manager).'
    )

    docker_tlsverify = Bool(
        None, config=True, allow_none=True,
        help='Use TLS to connect Docker daemon.'
    )

    docker_tlscacert = Unicode(
        '', config=True,
        help='Trust certs signed only by this CA if TLS is enabled for connecting Docker daemon.'
    )

    docker_tlscert = Unicode(
        '', config=True,
        help='Path to TLS certificate file for TLS for connecting Docker daemon.'
    )

    docker_tlskey = Unicode(
        '', config=True,
        help='Path to TLS key file for TLS. for connecting Docker daemon.'
    )

    docker_api_version = Float(
        1.24, config=True,
        help='The version of the API to use. Default: ``1.24``'
    )

    docker_from_env = Bool(
        False, config=True,
        help='The version of the API to use. Default: ``1.24``'
    )

    redis_url = Unicode(
        'redis://localhost:6379/0',
        help='The url of the Redis'
    ).tag(config=True)

    psql_url = Unicode(
        'postgres:///workdb', config=True,
        help='The database url.'
    )

    def init_logging(self):
        """
        Initializes logging.
        """
        self.log.propagate = False

        for log in app_log, access_log, gen_log:
            log.name = self.log.name

        logger = logging.getLogger('tornado')
        logger.propagate = True
        logger.parent = self.log
        logger.setLevel(self.log.level)

    def ini_orchestrator_server(self):
        psql_pool = create_psql_connection_pool(
            self.psql_url, ioloop.IOLoop.current())
        docker_client_ini =             {
                'host': self.docker_host,
                'tlsverify': self.docker_tlsverify,
                'tlscacert': self.docker_tlscacert,
                'tlscert': self.docker_tlscert,
                'tlskey': self.docker_tlskey
            }
        docker_client = DockerAPIClient(**docker_client_ini)
        ContainerOrchestratorApp(self.redis_url, docker_client, self.jupyter_token, self.jupyter_port, psql_pool)

    @catch_config_error
    def initialize(self, argv=None):
        """
        Initializes the main application of Orchestrator Server.
        """
        super().initialize(argv)
        self.ini_orchestrator_server()
        self.init_logging()

    def start(self):
        """
        Starts the Orchestrator Server.
        """
        super().start()

        signal.signal(signal.SIGTERM, self.handle_sigterm)

        self.io_loop = ioloop.IOLoop.current()
        try:
            self.log.info('Orchestrator Server starting...')
            self.io_loop.start()
        except KeyboardInterrupt:
            self.log.info('Orchestrator Server interrupted...')

    def stop(self):
        """
        Stops the Orchestrator Server.
        """
        def _stop():
            self.io_loop.stop()
            self.log.info("Stopped Orchestrator Server.")

        self.io_loop.add_callback(_stop)

    def handle_sigterm(self, sig, frame):
        """
        Handles `SIGTERM` signal to stop the Orchestrator Server
        gracefully.
        """
        self.log.info("received SIGTERM. Stopping Orchestrator Server...")
        self.io_loop.add_callback_from_signal(self.stop)

class ContainerOrchestratorApp(object):
    """
    Job Server Application for Orchestrator server
    """
    def __init__(self, redis_url, docker_client, jupyter_token, jupyter_port, psql_pool):
        """
        Initializes OrchestratorApp.

        Parameters
        ----------
        redis_url : str
            The url of the Redis.
        docker_client : str
            The docker client of docker deamon
        """
        redis_client = create_redis_client(redis_url)
        event_manager = EventManager(
            redis_client, docker_client, jupyter_token, jupyter_port, psql_pool)
        container_manager = ContainerManager(
            redis_client, docker_client, jupyter_token, jupyter_port)
        
        ioloop.IOLoop.current().spawn_callback(event_manager.watch_queue)
        ioloop.IOLoop.current().spawn_callback(container_manager.watch_queue)
        docker_events(docker_client).subscribe(DockerEventObserver(redis_client))

main = launch_new_instance = OrchestratorServer.launch_instance
