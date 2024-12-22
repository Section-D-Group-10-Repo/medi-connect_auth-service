# app/routes/api.py
from flask import Blueprint, jsonify, request
# from app.services.some_service import some_function

# Create a blueprint for the routes
api_routes = Blueprint('api_routes', __name__)

# Define a sample GET endpoint
@api_routes.route('/api/hello', methods=['GET'])
def hello_world():
    return jsonify({"message": "Hello, World!"})

# Define a sample POST endpoint
@api_routes.route('/api/data', methods=['POST'])
def post_data():
    data = request.get_json()
    result = "hello" #l a service or helper function
    return jsonify(result)
