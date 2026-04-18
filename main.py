from library import (add_book, list_books, search_books, delete_book,
                     register_user, list_users, loan_book, return_book, list_loans)

def print_header(title):
    print("\n" + "="*45)
    print(f"  {title}")
    print("="*45)

def main():
    while True:
        print_header("SISTEMA DE BIBLIOTECA ONLINE")
        print("  1. Agregar libro")
        print("  2. Ver todos los libros")
        print("  3. Buscar libro")
        print("  4. Eliminar libro")
        print("  5. Registrar usuario")
        print("  6. Ver usuarios")
        print("  7. Prestar libro")
        print("  8. Devolver libro")
        print("  9. Ver préstamos")
        print("  0. Salir")
        print("-"*45)
        option = input("  Selecciona una opción: ").strip()

        if option == "1":
            print_header("AGREGAR LIBRO")
            title  = input("Título: ")
            author = input("Autor: ")
            genre  = input("Género: ")
            year   = input("Año: ")
            copies = int(input("Copias disponibles: "))
            book = add_book(title, author, genre, year, copies)
            print(f"\n✅ Libro agregado con ID: {book['id']}")

        elif option == "2":
            print_header("CATÁLOGO DE LIBROS")
            books = list_books()
            if not books:
                print("  No hay libros registrados.")
            for b in books:
                print(f"  [{b['id']}] {b['title']} - {b['author']} ({b['year']}) | Disponibles: {b['available']}/{b['copies']}")

        elif option == "3":
            print_header("BUSCAR LIBRO")
            keyword = input("Buscar por título o autor: ")
            results = search_books(keyword)
            if not results:
                print("  No se encontraron resultados.")
            for b in results:
                print(f"  [{b['id']}] {b['title']} - {b['author']}")

        elif option == "4":
            print_header("ELIMINAR LIBRO")
            book_id = input("ID del libro a eliminar: ")
            if delete_book(book_id):
                print("✅ Libro eliminado.")
            else:
                print("❌ Libro no encontrado.")

        elif option == "5":
            print_header("REGISTRAR USUARIO")
            name  = input("Nombre: ")
            email = input("Email: ")
            user = register_user(name, email)
            if user:
                print(f"✅ Usuario registrado con ID: {user['id']}")
            else:
                print("❌ Ya existe un usuario con ese email.")

        elif option == "6":
            print_header("USUARIOS REGISTRADOS")
            users = list_users()
            if not users:
                print("  No hay usuarios registrados.")
            for u in users:
                print(f"  [{u['id']}] {u['name']} - {u['email']}")

        elif option == "7":
            print_header("PRESTAR LIBRO")
            user_id = input("ID del usuario: ")
            book_id = input("ID del libro: ")
            result = loan_book(user_id, book_id)
            if isinstance(result, dict):
                print(f"✅ Préstamo creado con ID: {result['id']}")
            else:
                print(f"❌ {result}")

        elif option == "8":
            print_header("DEVOLVER LIBRO")
            loan_id = input("ID del préstamo: ")
            result = return_book(loan_id)
            if isinstance(result, dict):
                print("✅ Libro devuelto exitosamente.")
            else:
                print(f"❌ {result}")

        elif option == "9":
            print_header("HISTORIAL DE PRÉSTAMOS")
            loans = list_loans()
            if not loans:
                print("  No hay préstamos registrados.")
            for l in loans:
                estado = "✅ Devuelto" if l["status"] == "returned" else "📖 Activo"
                print(f"  [{l['id']}] Usuario: {l['user_id']} | Libro: {l['book_id']} | {estado}")

        elif option == "0":
            print("\n👋 ¡Hasta luego!\n")
            break
        else:
            print("❌ Opción inválida.")

if __name__ == "__main__":
    main()