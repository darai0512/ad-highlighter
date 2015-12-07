#! /usr/bin/env python

from flask import Flask
from flask.ext.mongoengine import MongoEngine
from flask.ext.mongorest import MongoRest
from flask.ext.mongorest.views import ResourceView
from flask.ext.mongorest.resources import Resource
from flask.ext.mongorest import methods

app = Flask(__name__)

app.config.update(
    MONGODB_HOST = 'localhost',
    MONGODB_PORT = '27017',
    MONGODB_DB = 'ad-highlighter',
)

db = MongoEngine(app)
api = MongoRest(app)

class Ad(db.Document):
    url = db.StringField(max_length=120, required=True)
    ad_url = db.StringField(max_length=120, required=True)
    dom_info = db.StringField(max_length=120)
    image = db.StringField()
    feature = db.DictField()

class AdResource(Resource):
    document = Ad
    related_resources = {}
    filters = {}
    rename_fields = {}

@api.register(name='ads', url='/ads/')
class AdView(ResourceView):
    resource = AdResource
    methods = [methods.Create, methods.Update, methods.Fetch, methods.List]

if __name__ == "__main__":
    app.run("0.0.0.0", debug=True)
