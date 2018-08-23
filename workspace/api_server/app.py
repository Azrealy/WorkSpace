# -*- coding: utf-8 -*-
import signal
import logging
from tornado.log import LogFormatter, app_log, access_log, gen_log
from tornado import web, ioloop, gen
from workspace.api_server.handlers.todo import TodoListHandler, TodoInfoHandler
from tornado.httpserver import HTTPServer
from traitlets import Dict, Integer, Unicode, observe, Float, Bool
from traitlets.config.application import catch_config_error, Application
from .docker_client import DockerAPIClient
from workspace.utility import create_redis_client


class WebAPIServer(Application):
    """
    The main application of WebAPI Server.
    """
    name = 'webapi_server'
    description = 'WebAPI Server'

    aliases = {
        'ip': 'WebAPIServer.ip',
        'port': 'WebAPIServer.port',
        'redis-url': 'WebAPIServer.redis_url',
        'database_url': 'WebAPIServer.database_url',
        'docker-host': 'WebAPIServer.docker_host',
        'docker-tlscacert': 'WebAPIServer.docker_tlscacert',
        'docker-tlscert': 'WebAPIServer.docker_tlscert',
        'docker-tlskey': 'WebAPIServer.docker_tlskey',
        'docker-api-version': 'WebAPIServer.docker_api_version',
    }

    database_url = Unicode(
        '', config=True,
        help='The database url.'
    )
    ip = Unicode(
        '', config=True,
        help='The IP address the server will listen on.'
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

    @observe('ip')
    def _handle_ip_changed(self, change):
        """
        Handles change notification of `ip` option.

        Parameters
        ----------
        change : dict{str: str}
            Information about the change of `ip` option.
        """
        if change['new'] == u'*':
            self.ip = u''

    port = Integer(
        8889, config=True,
        help='The port the server will listen on.'
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

    redis_url = Unicode(
        'redis://localhost:6379/0',
        help='The url of the Redis'
    ).tag(config=True)

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

    def ini_docker_event(self):
        docker_client_ini = {
                'host': self.docker_host,
                'tlsverify': self.docker_tlsverify,
                'tlscacert': self.docker_tlscacert,
                'tlscert': self.docker_tlscert,
                'tlskey': self.docker_tlskey
            }
        redis_client = create_redis_client(self.redis_url)
        container = DockerAPIClient(1, str(self.docker_api_version), **docker_client_ini)
        container.running_observable(redis_client)

    def init_webapp(self):
        """
        Initializes Web Application to launch WebAPI Server.
        """
        self.web_app = WebAPIApp(
            self.database_url,
        )
        self.http_server = HTTPServer(self.web_app)
        self.http_server.listen(self.port)

    @catch_config_error
    def initialize(self, argv=None):
        """
        Initializes the main application of WebAPI Server.
        """
        super().initialize(argv)
        self.ini_docker_event()
        self.init_webapp()
        self.init_logging()

    def start(self):
        """
        Starts the WebAPI Server.
        """
        super().start()

        signal.signal(signal.SIGTERM, self.handle_sigterm)

        self.io_loop = ioloop.IOLoop.current()
        try:
            self.log.info('WebAPI Server starting...')
            self.io_loop.start()
        except KeyboardInterrupt:
            self.log.info('WebAPI Server interrupted...')

    def stop(self):
        """
        Stops the WebAPI Server.
        """
        def _stop():
            self.http_server.stop()
            self.io_loop.stop()
            self.log.info("Stopped WebAPI Server.")

        self.io_loop.add_callback(_stop)

    def handle_sigterm(self, sig, frame):
        """
        Handles `SIGTERM` signal to stop the WebAPI Server
        gracefully.
        """
        self.log.info("received SIGTERM. Stopping WebAPI Server...")
        self.io_loop.add_callback_from_signal(self.stop)

class WebAPIApp(web.Application):
    
    def __init__(self, database_url):
    
        context = {
            'database_url': database_url
        }

        handlers = [
            (r'/todo/([^/]*)', TodoInfoHandler, context),
            (r'/todo', TodoListHandler, context)
        ]

        super().__init__(handlers)

main = launch_new_instance = WebAPIServer.launch_instance