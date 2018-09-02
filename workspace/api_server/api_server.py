# -*- coding: utf-8 -*-
import signal
import logging
from workspace.model.fields.todo import Todo
from tornado.log import LogFormatter, app_log, access_log, gen_log
from tornado import web, ioloop, gen
from workspace.api_server.handlers.todo import TodoListHandler, TodoInfoHandler
from workspace.api_server.handlers.container import ContainerHandler, ContainerDeleteHandler
from tornado.httpserver import HTTPServer
from traitlets import Dict, Integer, Unicode, observe, Float, Bool
from traitlets.config.application import catch_config_error, Application
from workspace.utility import create_redis_client, create_psql_connection_pool


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
        'psql-url': 'WebAPIServer.psql_url'
    }

    psql_url = Unicode(
        'dbname=workdb', config=True,
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

    @gen.coroutine
    def init_webapp(self):
        """
        Initializes Web Application to launch WebAPI Server.
        """
        psql_pool = create_psql_connection_pool(
            self.psql_url, ioloop.IOLoop.current())
        self.web_app = WebAPIApp(
            psql_pool,
            self.redis_url
        )
        yield Todo(psql_pool).create_table()
        self.http_server = HTTPServer(self.web_app)
        self.http_server.listen(self.port)

    @catch_config_error
    def initialize(self, argv=None):
        """
        Initializes the main application of WebAPI Server.
        """
        super().initialize(argv)
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
    
    def __init__(self, psql_pool, redis_url):
       
        context = {
            'psql_pool': psql_pool,
            'redis_url': redis_url
        }

        handlers = [
            (r'/todo/([^/]*)', TodoInfoHandler, context),
            (r'/todo', TodoListHandler, context),
            (r'/container', ContainerHandler, context),
            (r'/container/([^/]*)', ContainerDeleteHandler, context)
        ]

        super().__init__(handlers)

main = launch_new_instance = WebAPIServer.launch_instance
