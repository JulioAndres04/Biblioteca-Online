import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import pytest
from library import add_book, search_books, register_user, loan_book, return_book
from database import save_data

# Limpia la base de datos antes de cada test
@pytest.fixture(autouse=True)
def clean_db():
    save_data({"books": [], "loans": [], "users": []})

def test_add_book():
    book = add_book("Python 101", "John Doe", "Tecnología", "2020", 3)
    assert book["title"] == "Python 101"
    assert book["available"] == 3

def test_search_book():
    add_book("Clean Code", "Robert Martin", "Programación", "2008", 2)
    results = search_books("clean")
    assert len(results) == 1

def test_search_no_results():
    results = search_books("xyz_inexistente")
    assert results == []

def test_register_user():
    user = register_user("Ana López", "ana@email.com")
    assert user["email"] == "ana@email.com"

def test_duplicate_user():
    register_user("Ana López", "ana@email.com")
    result = register_user("Ana Otra", "ana@email.com")
    assert result is None

def test_loan_book():
    book = add_book("El Quijote", "Cervantes", "Literatura", "1605", 1)
    user = register_user("Carlos", "carlos@email.com")
    loan = loan_book(user["id"], book["id"])
    assert isinstance(loan, dict)
    assert loan["status"] == "active"

def test_loan_unavailable():
    book = add_book("Libro Único", "Autor", "Género", "2000", 1)
    user1 = register_user("User1", "u1@email.com")
    user2 = register_user("User2", "u2@email.com")
    loan_book(user1["id"], book["id"])
    result = loan_book(user2["id"], book["id"])
    assert "ERROR" in result

def test_return_book():
    book = add_book("Devolver Este", "Autor", "Género", "2021", 1)
    user = register_user("Pedro", "pedro@email.com")
    loan = loan_book(user["id"], book["id"])
    result = return_book(loan["id"])
    assert result["status"] == "returned"

def test_loan_invalid_user():
    book = add_book("Libro Test", "Autor", "Género", "2022", 2)
    result = loan_book("id_falso", book["id"])
    assert "ERROR" in result

def test_loan_invalid_book():
    user = register_user("Maria", "maria@email.com")
    result = loan_book(user["id"], "id_falso")
    assert "ERROR" in result