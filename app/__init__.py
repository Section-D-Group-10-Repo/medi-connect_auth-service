# app/__init__.py
from flask import Flask
from app.routes.api import api_routes

def create_app():
    app = Flask(__name__)

    # Register the blueprint
    app.register_blueprint(api_routes)

    return app
