import os
from pymongo import MongoClient
from datetime import datetime, timedelta

class MongoDB:
    def __init__(self):
        # MongoDB Atlas connection string provided by user
        self.connection_string = "mongodb+srv://kakotechnology:9w4VSWqNmwonsF@cluster0.dfv4h.mongodb.net/"
        self.client = None
        self.db = None
        self.requests_collection = None
        
    def connect(self):
        try:
            self.client = MongoClient(self.connection_string)
            self.db = self.client.noday_entertainment
            self.requests_collection = self.db.live_requests
            # Test connection
            self.client.admin.command('ping')
            print("Successfully connected to MongoDB Atlas")
            return True
        except Exception as e:
            print(f"Failed to connect to MongoDB: {e}")
            return False
    
    def add_request(self, music_request, requester_name="Anonymous"):
        try:
            request_data = {
                "music": music_request,
                "name": requester_name,
                "timestamp": datetime.utcnow(),
                "created_at": datetime.utcnow()
            }
            result = self.requests_collection.insert_one(request_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"Error adding request: {e}")
            return None
    
    def get_requests(self, limit=50):
        try:
            # Get requests from last 12 hours, sorted by newest first
            twelve_hours_ago = datetime.utcnow() - timedelta(hours=12)
            requests = list(self.requests_collection.find(
                {"timestamp": {"$gte": twelve_hours_ago}},
                {"_id": 0}  # Exclude MongoDB _id field
            ).sort("timestamp", -1).limit(limit))
            
            # Add request numbers
            for i, request in enumerate(requests):
                request["number"] = i + 1
                # Convert datetime to ISO string for JSON serialization
                request["timestamp"] = request["timestamp"].isoformat()
                if "created_at" in request:
                    request["created_at"] = request["created_at"].isoformat()
            
            return requests
        except Exception as e:
            print(f"Error getting requests: {e}")
            return []
    
    def cleanup_old_requests(self):
        try:
            # Remove requests older than 12 hours
            twelve_hours_ago = datetime.utcnow() - timedelta(hours=12)
            result = self.requests_collection.delete_many(
                {"timestamp": {"$lt": twelve_hours_ago}}
            )
            print(f"Cleaned up {result.deleted_count} old requests")
            return result.deleted_count
        except Exception as e:
            print(f"Error cleaning up requests: {e}")
            return 0
    
    def close_connection(self):
        if self.client:
            self.client.close()

# Global MongoDB instance
mongodb = MongoDB()

