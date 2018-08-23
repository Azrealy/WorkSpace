# -*- coding: utf-8 -*-
from workspace.model.model import Model
from workspace.model.field import IntegerField, TextField, BooleanField, FloatField
import time

class Container(Model):
    """
    Container object
    """
    container_id = TextField(column_type='TEXT NOT NULL', primary_key=True)
    container_name = TextField(column_type='INTEGER NOT NULL', default='')
    status = TextField(column_type='BOOLEAN NOT NULL')
    jupyter_token = TextField(column_type='BOOLEAN NOT NULL')
    jupyter_url = TextField(column_type='BOOLEAN NOT NULL')
    created_at = FloatField(default=time.time())
    update_at = FloatField()
    