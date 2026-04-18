from datetime import datetime
import uuid

def create_book(title, author, genre, year, copies):
    return {
        "id": str(uuid.uuid4())[:8],
        "title": title,
        "author": author,
        "genre": genre,
        "year": year,
        "copies": copies,
        "available": copies
    }

def create_user(name, email):
    return {
        "id": str(uuid.uuid4())[:8],
        "name": name,
        "email": email,
        "registered_at": datetime.now().strftime("%Y-%m-%d")
    }

def create_loan(user_id, book_id):
    return {
        "id": str(uuid.uuid4())[:8],
        "user_id": user_id,
        "book_id": book_id,
        "loan_date": datetime.now().strftime("%Y-%m-%d"),
        "return_date": None,
        "status": "active"
    }