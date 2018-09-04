# -*- coding: utf-8 -*-
from tornado import web, gen, escape
from workspace.model.fields.todo import Todo
from datetime import datetime
from tornado.log import app_log
from workspace.utility import transform_created_time
import time as tm
import requests
import json


class TodoListHandler(web.RequestHandler):

    def initialize(self, psql_pool, **kwargs):
        """
        Initializes BaseRequestHandler.
        """
        self.psql_pool = psql_pool

    @gen.coroutine
    def get(self):
        """
        GET /todo
        """
        result = yield Todo(self.psql_pool).find_all(order_by='id')
        if result:
            self.write(dict(todos=list(map(lambda f: transform_created_time(f), result))))
            app_log.info('get todo succeeded : %s', result)
        else:
            self.write({'todos': None})

    @gen.coroutine
    def post(self):
        """
        POST /todo
        """
        req_data = escape.json_decode(self.request.body)
        text = req_data.get('text')
        id = yield self.generate_next_id()
        time = tm.time()
        result = yield Todo(self.psql_pool, text=text, id=id, created_at=time).save()
        if result:
            self.write({})
        else:
            raise web.HTTPError(400, 'Todo create is failed.')

    @gen.coroutine
    def generate_next_id(self):
        """
        Generate the next id column

        Returns:
        --------
        id : int
            Return the Highest id plus one,
            if table is empty return 1.
        """
        todos = yield Todo(self.psql_pool).find_all()
        if todos:
            return max([int(todo['id']) for todo in todos]) + 1
        else:
            return 1


class TodoInfoHandler(web.RequestHandler):

    def initialize(self, psql_pool, **kwargs):
        """
        Initializes BaseRequestHandler.
        """
        self.psql_pool = psql_pool

    @gen.coroutine
    def put(self, todo_id):
        """
        PUT /todo/<todoId>
        """
        req_data = escape.json_decode(self.request.body)
        text = req_data.get('text')
        is_completed = req_data.get('is_completed')
        comment = req_data.get('comment')
        app_log.info('show the reqdate %s', req_data )
        if comment is not None:
            if comment != '':
                response = json.loads(requests.post("http://apis.paralleldots.com/v3/emotion",  # Give up the ssl protocol
                                    data={"api_key": "LLzFyEAbBiAwBQs1YKKUsS4zV9MZ9QPw6zUWKsmaN6U", "text": comment, "lang_code": "en"}).text)
                emotion = response['emotion']['emotion']
                result = yield Todo(self.psql_pool, id=todo_id, comment=comment, text=text,
                            sentiment=emotion, update_at=tm.time()).update()
            else:
                result = yield Todo(self.psql_pool, id=todo_id, comment=comment, text=text, sentiment='', update_at=tm.time()).update()
        else:
            result = yield Todo(self.psql_pool, id=todo_id, text=text,
                          is_completed=is_completed, update_at=tm.time()).update()
        if result == False:
            raise web.HTTPError(404, 'Todo is not find.')
        self.write({})

    @gen.coroutine
    def delete(self, todo_id):
        """
        DELETE /todo/<todoId>
        """
        result = yield Todo(self.psql_pool, id=todo_id).remove()
        if result == False:
            raise web.HTTPError(404, 'Todo is not find.')
        self.write({})
