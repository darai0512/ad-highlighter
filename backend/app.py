#! /usr/bin/env python

from flask import Flask
from flask.ext.mongoengine import MongoEngine
from flask.ext.mongorest import MongoRest
from flask.ext.mongorest.views import ResourceView
from flask.ext.mongorest.resources import Resource
from flask.ext.mongorest import operators as ops
from flask.ext.mongorest import methods

app = Flask(__name__)

app.url_map.strict_slashes = False

app.config.update(
    MONGODB_HOST = 'localhost',
    MONGODB_PORT = '27017',
    MONGODB_DB = 'ad-highlighter',
)

db = MongoEngine(app)
api = MongoRest(app)

class Ad(db.Document):
    page_url = db.StringField(required=True)
    ad_url = db.StringField(required=True)
    user_ip = db.StringField(required=True)
    feature = db.DictField()
    action = db.StringField()

class AdResource(Resource):
    document = Ad
    related_resources = {}
    filters = {
        'page_url': [ops.Exact, ops.Startswith, ops.Contains],
        'ad_url': [ops.Exact, ops.Startswith, ops.Contains],
        'user_ip': [ops.Exact],
        'action': [ops.Exact, ops.Startswith, ops.Contains],
    }
    rename_fields = {}

@api.register(name='ads', url='/ads/')
class AdView(ResourceView):
    resource = AdResource
    methods = [methods.Create, methods.Update, methods.Fetch, methods.List]

if __name__ == "__main__":
    app.run("0.0.0.0", debug=True)
