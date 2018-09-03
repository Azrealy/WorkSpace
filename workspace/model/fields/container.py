# -*- coding: utf-8 -*-
from workspace.model.model import Model
from workspace.model.field import IntegerField, TextField, BooleanField, FloatField
import time

class Container(Model):
    """
    Container object
    """
    container_name = TextField(column_type='TEXT NOT NULL', default='', primary_key=True)
    container_id = TextField(column_type='TEXT NOT NULL', default='')
    status = TextField(column_type='TEXT NOT NULL', default='')
    health = TextField(column_type='TEXT NOT NULL', default='')
    jupyter_token = TextField(column_type='TEXT NOT NULL', default='')
    jupyter_url = TextField(column_type='TEXT NOT NULL', default='')
    created_at = FloatField(default=time.time())
    update_at = FloatField()
    