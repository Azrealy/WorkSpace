# -*- coding: utf-8 -*-
from tornado import web, gen, escape
from workspace.model.fields.todo import Todo
from datetime import datetime
from tornado.log import app_log
import time
import requests
import json


class CommentInfoHandler(web.RequestHandler):

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
        comment = req_data.get('comment')
        response = json.loads(
            requests.post("https://apis.paralleldots.com/v3/sentiment", verify=False, #Give up the ssl protocol
            data={"api_key": "LLzFyEAbBiAwBQs1YKKUsS4zV9MZ9QPw6zUWKsmaN6U", "text": comment, "lang_code": "en"}).text)
        sentiment = response['sentiment']
        result = Todo(id=todo_id, comment=comment, sentiment=sentiment, update_at=time.time()).update()
        if result:
            todo = Todo.find(todo_id)
            self.write(todo[0])
        else:
            raise web.HTTPError(400, 'Comment update failed')
            
