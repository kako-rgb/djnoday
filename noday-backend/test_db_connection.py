import sys
import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

def test_mongodb_connection(connection_string):
    try:
        print("Attempting to connect to MongoDB...")
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
        
        # Force a connection by pinging the database
        client.admin.command('ping')
        print("✅ Successfully connected to MongoDB!")
        
        # Get database info
        db = client.get_database()
        print(f"\nDatabase name: {db.name}")
        
        # List all collections
        collections = db.list_collection_names()
        print("\nCollections in the database:")
        for collection in collections:
            print(f"- {collection}")
            
        # Count documents in each collection
        print("\nDocument counts:")
        for collection in collections:
            count = db[collection].count_documents({})
            print(f"- {collection}: {count} documents")
            
        return True
        
    except ServerSelectionTimeoutError as sste:
        print(f"❌ Failed to connect to MongoDB (timeout): {sste}")
        return False
    except ConnectionFailure as cfe:
        print(f"❌ MongoDB connection failed: {cfe}")
        return False
    except Exception as e:
        print(f"❌ An error occurred: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    # Get connection string from environment variable or use the default
    connection_string = os.getenv(
        'MONGODB_URI',
        'mongodb+srv://kakotechnology:e8q3f9dRgMxcItXn@cluster0.dfv4h.mongodb.net/noday_entertainment?retryWrites=true&w=majority'
    )
    
    print(f"Using connection string: {connection_string.split('@')[-1]}")
    
    if not test_mongodb_connection(connection_string):
        sys.exit(1)
