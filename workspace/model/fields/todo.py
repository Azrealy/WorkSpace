# -*- coding: utf-8 -*-
from workspace.model.model import Model
from workspace.model.field import IntegerField, TextField, BooleanField, FloatField
import time

class Todo(Model):
    """
    Todo object
    """
    id = IntegerField(column_type='INTEGER NOT NULL', primary_key=True)
    text = TextField(column_type='TEXT NOT NULL', default='')
    is_completed = BooleanField(column_type='BOOLEAN NOT NULL')
    comment = TextField(column_type='TEXT NOT NULL', default='')
    created_at = FloatField()
    sentiment = TextField(column_type='TEXT NOT NULL', default='')
    update_at = FloatField()

    def __init__(self, pool, **kwargs):
        """
        Initializes Todo

        Parameters
        ----------
        pool : PSQLConnPool
            A container of a connection pool to run SQL queries.
        """
        super(Todo, self).__init__(pool, **kwargs)
    
