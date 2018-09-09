# -*- coding: utf-8 -*-
import momoko
from tornado import gen
from tornado.locks import Lock
from redis.client import Redis
import time as tm


class RecordIsNotFoundError(Exception):
    """
    Record is not found.
    """
    pass

class Singleton(type):
    """
    Singleton metaclass

    Example:
        class model(object, Singleton):
            pass
    >>> m1 = model()
    >>> m2 = model()
    >>> m1 == m2
    True
    """
    _instance = dict()
    def __call__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance[cls.__name__] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instance[cls.__name__]


class PSQLConnPool(object, metaclass=Singleton):
    """
    A connection pool of the PostgreSQL.

    This wraps the `momoko.Pool` to initialize the connection
    when the first SQL statement is run.
    """

    def __init__(self, pool):
        """
        Initializes PSQLConnPool

        Parameters
        ----------
        pool : momoko.Pool
            A connection pool to run SQL queries.
        """
        self._pool = pool
        self._connected = False
        self._lock = Lock()

    @gen.coroutine
    def _connect(self):
        """
        Open connections in this pool.

        This is safe to call after connections are opened
        """
        if self._connected:
            return

        # Initialize the connection pool with lock because it may run another coroutine same timing
        # but `momoko.Pool.connect()` must call once. (multiple calls generates too many
        # connections)
        with (yield self._lock.acquire()):
            if not self._connected:
                yield self._pool.connect()
                self._connected = True

    @gen.coroutine
    def execute(self, operation, parameters=()):
        """
        Prepare and execute a database operation (query or command).

        Parameters
        ----------
        operation : str
            An SQL query or a command.
        parameters : tuple or list or dict
            A list, tuple or dict with query parameters.
            See `Passing parameters to SQL queries
            <http://initd.org/psycopg/docs/usage.html#query-parameters>`_
            for more information.

        Returns
        -------
        future : tornado.concurrent.Future
            future that resolves to `cursor` object containing result.
        """
        yield self._connect()
        print(operation)
        return (yield self._pool.execute(operation, parameters))


def create_psql_connection_pool(url, io_loop, pool_size=10):
    """
    Creates connection pool of the PostgreSQL for running SQL queries.

    Parameters
    ----------
    url : str
        A URL to connect to PostgreSQL.
    io_loop : tornado.ioloop.IOLoop
        The IOLoop to run sql query in.
    pool_size : int
        Size of connection pool.

    Returns
    -------
    pool : PSQLConnPool
        A connection pool of the PostgreSQL to run SQL queries.
    """
    pool = momoko.Pool(dsn=url, size=pool_size, ioloop=io_loop)
    return PSQLConnPool(pool)


def create_redis_client(url, pool_size=10):
    """
    Creates connection pool for running Redis commands.

    Parameters
    ----------
    url : str
        A URL to connect to redis.
    pool_size : int
        Size of connection pool.

    Returns
    -------
    client : redis.Redis
        A client to run redis command.
    """
    return Redis.from_url(url, max_connections=pool_size)


def transform_created_time(result):
    """
    Transform created time to string
    """
    result['created_at']= convert_time_to_message(result['created_at'])
    result['update_at'] = float(result['update_at'])
    if result['update_at'] != 0:
        result['update_at'] = convert_time_to_message(result['update_at'])
    return result


def convert_time_to_message(epoch_time):
    """
    Convert time to message

    Parameters
    ----------
    epoch_time : float
        Float point number of epoch time
    
    Returns
    -------
    message : str
        Message of elapsed time
    """
    delta = int(tm.time() - float(epoch_time))
    if delta < 60:
        return '1 mins ago'
    if delta < 3600:
        return '%s mins ago' % (delta // 60)
    if delta < 86400:
        return '%s hours ago' % (delta // 3600)
    if delta < 604800:
        return '%s days ago' % (delta // 86400)
    dt = datetime.fromtimestamp(epoch_time)
    return '%s year %s month %s day ago' % (dt.year, dt.month, dt.day)
