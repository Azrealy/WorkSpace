# -*- coding: utf-8 -*-
from workspace.model.model import Model
from workspace.model.field import IntegerField, TextField, BooleanField, FloatField
import time

class Todo(Model):
    """
    Todo object
    """
    id = IntegerField(column_type='TEXT NOT NULL', primary_key=True)
    text = TextField(column_type='INTEGER NOT NULL', default='')
    is_completed = BooleanField(column_type='BOOLEAN NOT NULL')
    created_at = FloatField(default=time.time())
    update_at = FloatField()
    