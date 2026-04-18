from database import load_data, save_data
from models import create_book, create_user, create_loan

# ── Libros 

def add_book(title, author, genre, year, copies):
    data = load_data()
    book = create_book(title, author, genre, year, copies)
    data["books"].append(book)
    save_data(data)
    return book

def list_books():
    return load_data()["books"]

def search_books(keyword):
    keyword = keyword.lower()
    return [
        b for b in load_data()["books"]
        if keyword in b["title"].lower() or keyword in b["author"].lower()
    ]

def delete_book(book_id):
    data = load_data()
    before = len(data["books"])
    data["books"] = [b for b in data["books"] if b["id"] != book_id]
    save_data(data)
    return len(data["books"]) < before

# ── Usuarios 

def register_user(name, email):
    data = load_data()
    if any(u["email"] == email for u in data["users"]):
        return None  # usuario ya existe
    user = create_user(name, email)
    data["users"].append(user)
    save_data(data)
    return user

def list_users():
    return load_data()["users"]

# ── Préstamos

def loan_book(user_id, book_id):
    data = load_data()
    book = next((b for b in data["books"] if b["id"] == book_id), None)
    user = next((u for u in data["users"] if u["id"] == user_id), None)

    if not book:
        return "ERROR: Libro no encontrado."
    if not user:
        return "ERROR: Usuario no encontrado."
    if book["available"] <= 0:
        return "ERROR: No hay copias disponibles."

    loan = create_loan(user_id, book_id)
    data["loans"].append(loan)
    book["available"] -= 1
    save_data(data)
    return loan

def return_book(loan_id):
    from datetime import datetime
    data = load_data()
    loan = next((l for l in data["loans"] if l["id"] == loan_id), None)

    if not loan:
        return "ERROR: Préstamo no encontrado."
    if loan["status"] == "returned":
        return "ERROR: Este préstamo ya fue devuelto."

    loan["status"] = "returned"
    loan["return_date"] = datetime.now().strftime("%Y-%m-%d")

    book = next((b for b in data["books"] if b["id"] == loan["book_id"]), None)
    if book:
        book["available"] += 1

    save_data(data)
    return loan

def list_loans():
    return load_data()["loans"]