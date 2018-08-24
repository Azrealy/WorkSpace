# -*- coding: utf-8 -*-
from tornado import web, gen, escape
from workspace.model.fields.todo import Todo
from datetime import datetime
from tornado.log import app_log
import time

class TodoListHandler(web.RequestHandler):


    def initialize(self, database_url, **kwargs):
        """
        Initializes BaseRequestHandler.
        """
        self._database_url = database_url

    def get(self):
        """
        GET /todo
        """
        #self.write(self._database_url)
        result = Todo.find_all()
        if result:
            self.write({'todos': [t for t in result]})
            app_log.info('get todo succeeded : %s', result)
        else:
            raise web.HTTPError(400, 'No task exist.')
    
    def post(self):
        """
        POST /todo
        """
        req_data = escape.json_decode(self.request.body)
        text = req_data.get('text')
        result = Todo(text=text, id=generate_next_id()).save()
        self.write({'hasCreated': result})

class TodoInfoHandler(web.RequestHandler):

    def initialize(self, database_url, **kwargs):
        """
        Initializes BaseRequestHandler.
        """
        self._database_url = database_url

    def put(self, todo_id):
        """
        PUT /todo/<todoId>
        """
        req_data = escape.json_decode(self.request.body)
        text = req_data.get('text')
        result = Todo(id=todo_id, text=text, update_at=time.time()).update()
        self.write({'hasUpdated': result})

    def delete(self, todo_id):
        """
        DELETE /todo/<todoId>
        """
        result = Todo(id=todo_id).remove()
        self.write({'hasDeleted': result})

def generate_next_id():
    """
    Generate the next id column

    Returns:
    --------
    id : int
        Return the Highest id plus one,
        if table is empty return 1.
    """
    todo = Todo.find_all(order_by='id desc', size=1)
    if todo:
        return int(todo[0].id) + 1
    else:
        return 1

    
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
    delta = int(time.time() - epoch_time)
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
