# -*- coding: utf-8 -*-
from tornado import web, gen, escape
from workspace.model.fields.todo import Todo
from datetime import datetime
from tornado.log import app_log
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
            self.write(dict(todos=list(map(lambda f: self.transform_created_time(f), result))))
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
        print(time)
        result = yield Todo(self.psql_pool, text=text, id=id, created_at=time).save()
        self.write({'hasCreated': result})
    
    def transform_created_time(self, todo):
        """
        Transform created time to string
        """
        todo['created_at']= convert_time_to_message(todo['created_at'])
        todo['update_at'] = float(todo['update_at'])
        if todo['update_at'] != 0:
            todo['update_at'] = convert_time_to_message(todo['update_at'])
        return todo

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
        app_log.info("show the reqdate %s", req_data )
        comment = req_data.get('comment')
        app_log.info("show the comment %s", comment)
        if comment is not None:
            if comment != '':
                response = json.loads(requests.post("https://apis.paralleldots.com/v3/emotion",  # Give up the ssl protocol
                                    data={"api_key": "LLzFyEAbBiAwBQs1YKKUsS4zV9MZ9QPw6zUWKsmaN6U", "text": comment, "lang_code": "en"}).text)
                emotion = response['emotion']['emotion']
                result = yield Todo(self.psql_pool, id=todo_id, comment=comment, text=text,
                            sentiment=emotion, update_at=tm.time()).update()
            else:
                result = yield Todo(self.psql_pool, id=todo_id, comment=comment, text=text, sentiment='', update_at=tm.time()).update()
        else:
            result = yield Todo(self.psql_pool, id=todo_id, text=text,
                          is_completed=is_completed, update_at=tm.time()).update()
        self.write({'hasUpdated': result})

    @gen.coroutine
    def delete(self, todo_id):
        """
        DELETE /todo/<todoId>
        """
        result = yield Todo(self.psql_pool, id=todo_id).remove()
        self.write({'hasDeleted': result})
        

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
