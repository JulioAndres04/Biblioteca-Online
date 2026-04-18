var fs = require("fs");
var path = require("path");

// --- Mock de localStorage ---
var almacen = {};
var localStorageMock = {
    getItem: function (clave) {
        return almacen[clave] || null;
    },
    setItem: function (clave, valor) {
        almacen[clave] = String(valor);
    },
    removeItem: function (clave) {
        delete almacen[clave];
    },
    clear: function () {
        almacen = {};
    }
};

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// --- Armar el DOM minimo que necesita app.js ---
function armarDOM() {
    document.body.innerHTML = `
        <form id="formLibro">
            <input id="titulo" value="">
            <input id="autor" value="">
            <input id="genero" value="">
            <input id="anio" value="">
            <input id="copias" value="">
        </form>
        <input id="busqueda" value="">
        <table><tbody id="tablaLibros"></tbody></table>

        <form id="formUsuario">
            <input id="nombre" value="">
            <input id="email" value="">
        </form>
        <table><tbody id="tablaUsuarios"></tbody></table>

        <form id="formPrestamo">
            <select id="selUsuario"><option value="">--</option></select>
            <select id="selLibro"><option value="">--</option></select>
        </form>
        <table><tbody id="tablaPrestamos"></tbody></table>

        <div id="mensaje"></div>

        <div id="libros" class="seccion"></div>
        <div id="usuarios" class="seccion oculto"></div>
        <div id="prestamos" class="seccion oculto"></div>
    `;
}

// --- Cargar app.js en el contexto global ---
function cargarApp() {
    var codigo = fs.readFileSync(path.resolve(__dirname, "..", "app.js"), "utf-8");
    var evalGlobal = eval;
    evalGlobal(codigo);
}

// Antes de cada test: limpiar todo y recargar
beforeEach(function () {
    localStorageMock.clear();
    armarDOM();
    cargarApp();
});

// ==========================================
//  TESTS
// ==========================================

describe("cargarDatos", function () {

    test("retorna objeto vacio si localStorage no tiene nada", function () {
        localStorageMock.clear();
        var datos = cargarDatos();
        expect(datos).toEqual({ libros: [], usuarios: [], prestamos: [] });
    });

    test("retorna los datos guardados en localStorage", function () {
        var datosGuardados = { libros: [{ id: "1", titulo: "Test" }], usuarios: [], prestamos: [] };
        localStorageMock.setItem("biblioteca", JSON.stringify(datosGuardados));
        var datos = cargarDatos();
        expect(datos.libros.length).toBe(1);
        expect(datos.libros[0].titulo).toBe("Test");
    });
});

describe("agregarLibro", function () {

    test("agrega un libro con todos los campos", function () {
        document.getElementById("titulo").value = "Clean Code";
        document.getElementById("autor").value = "Robert Martin";
        document.getElementById("genero").value = "Programacion";
        document.getElementById("anio").value = "2008";
        document.getElementById("copias").value = "3";

        var evento = { preventDefault: jest.fn() };
        agregarLibro(evento);

        var datos = cargarDatos();
        expect(datos.libros.length).toBe(1);

        var libro = datos.libros[0];
        expect(libro.titulo).toBe("Clean Code");
        expect(libro.autor).toBe("Robert Martin");
        expect(libro.genero).toBe("Programacion");
        expect(libro.anio).toBe("2008");
        expect(libro.copias).toBe(3);
        expect(libro.disponibles).toBe(3);
        expect(libro.id).toBeDefined();
    });

    test("llama a preventDefault del evento", function () {
        document.getElementById("titulo").value = "Libro";
        document.getElementById("autor").value = "Autor";
        document.getElementById("genero").value = "Genero";
        document.getElementById("anio").value = "2020";
        document.getElementById("copias").value = "1";

        var evento = { preventDefault: jest.fn() };
        agregarLibro(evento);

        expect(evento.preventDefault).toHaveBeenCalled();
    });
});

describe("registrarUsuario", function () {

    test("registra un usuario nuevo", function () {
        document.getElementById("nombre").value = "Ana Lopez";
        document.getElementById("email").value = "ana@correo.com";

        var evento = { preventDefault: jest.fn() };
        registrarUsuario(evento);

        var datos = cargarDatos();
        expect(datos.usuarios.length).toBe(1);
        expect(datos.usuarios[0].nombre).toBe("Ana Lopez");
        expect(datos.usuarios[0].email).toBe("ana@correo.com");
    });

    test("no permite registrar email duplicado", function () {
        document.getElementById("nombre").value = "Ana Lopez";
        document.getElementById("email").value = "ana@correo.com";
        var evento = { preventDefault: jest.fn() };
        registrarUsuario(evento);

        // intentar registrar otro con el mismo email
        document.getElementById("nombre").value = "Otra Ana";
        document.getElementById("email").value = "ana@correo.com";
        registrarUsuario(evento);

        var datos = cargarDatos();
        expect(datos.usuarios.length).toBe(1);
    });
});

describe("prestarLibro", function () {

    function crearLibroYUsuario() {
        // agregar libro
        document.getElementById("titulo").value = "El Quijote";
        document.getElementById("autor").value = "Cervantes";
        document.getElementById("genero").value = "Literatura";
        document.getElementById("anio").value = "1605";
        document.getElementById("copias").value = "2";
        agregarLibro({ preventDefault: jest.fn() });

        // agregar usuario
        document.getElementById("nombre").value = "Carlos";
        document.getElementById("email").value = "carlos@correo.com";
        registrarUsuario({ preventDefault: jest.fn() });

        var datos = cargarDatos();
        return { libro: datos.libros[0], usuario: datos.usuarios[0] };
    }

    test("crea prestamo con estado activo", function () {
        var refs = crearLibroYUsuario();

        llenarSelects();
        document.getElementById("selUsuario").value = refs.usuario.id;
        document.getElementById("selLibro").value = refs.libro.id;

        prestarLibro({ preventDefault: jest.fn() });

        var datos = cargarDatos();
        expect(datos.prestamos.length).toBe(1);
        expect(datos.prestamos[0].estado).toBe("activo");
        expect(datos.prestamos[0].idUsuario).toBe(refs.usuario.id);
        expect(datos.prestamos[0].idLibro).toBe(refs.libro.id);
    });

    test("reduce disponibles del libro en 1", function () {
        var refs = crearLibroYUsuario();

        llenarSelects();
        document.getElementById("selUsuario").value = refs.usuario.id;
        document.getElementById("selLibro").value = refs.libro.id;

        prestarLibro({ preventDefault: jest.fn() });

        var datos = cargarDatos();
        var libro = datos.libros[0];
        expect(libro.disponibles).toBe(1); // tenia 2, ahora 1
    });
});

describe("devolverLibro", function () {

    test("cambia estado a devuelto y aumenta disponibles", function () {
        // crear libro con 1 copia
        document.getElementById("titulo").value = "Libro Unico";
        document.getElementById("autor").value = "Autor";
        document.getElementById("genero").value = "Genero";
        document.getElementById("anio").value = "2021";
        document.getElementById("copias").value = "1";
        agregarLibro({ preventDefault: jest.fn() });

        // crear usuario
        document.getElementById("nombre").value = "Pedro";
        document.getElementById("email").value = "pedro@correo.com";
        registrarUsuario({ preventDefault: jest.fn() });

        var datos = cargarDatos();
        var libro = datos.libros[0];
        var usuario = datos.usuarios[0];

        // prestar
        llenarSelects();
        document.getElementById("selUsuario").value = usuario.id;
        document.getElementById("selLibro").value = libro.id;
        prestarLibro({ preventDefault: jest.fn() });

        datos = cargarDatos();
        expect(datos.libros[0].disponibles).toBe(0);

        // devolver
        var idPrestamo = datos.prestamos[0].id;
        devolverLibro(idPrestamo);

        datos = cargarDatos();
        expect(datos.prestamos[0].estado).toBe("devuelto");
        expect(datos.prestamos[0].fechaDevolucion).not.toBeNull();
        expect(datos.libros[0].disponibles).toBe(1);
    });
});

describe("buscarLibros", function () {

    function agregarVariosLibros() {
        var libros = [
            { titulo: "Clean Code", autor: "Robert Martin", genero: "Programacion", anio: "2008", copias: "2" },
            { titulo: "El Quijote", autor: "Cervantes", genero: "Literatura", anio: "1605", copias: "1" },
            { titulo: "Python 101", autor: "David Martin", genero: "Tecnologia", anio: "2020", copias: "3" }
        ];

        for (var i = 0; i < libros.length; i++) {
            document.getElementById("titulo").value = libros[i].titulo;
            document.getElementById("autor").value = libros[i].autor;
            document.getElementById("genero").value = libros[i].genero;
            document.getElementById("anio").value = libros[i].anio;
            document.getElementById("copias").value = libros[i].copias;
            agregarLibro({ preventDefault: jest.fn() });
        }
    }

    test("filtra por titulo", function () {
        agregarVariosLibros();
        document.getElementById("busqueda").value = "clean";
        buscarLibros();

        var filas = document.getElementById("tablaLibros").querySelectorAll("tr");
        expect(filas.length).toBe(1);
    });

    test("filtra por autor", function () {
        agregarVariosLibros();
        document.getElementById("busqueda").value = "martin";
        buscarLibros();

        var filas = document.getElementById("tablaLibros").querySelectorAll("tr");
        expect(filas.length).toBe(2); // Robert Martin y David Martin
    });

    test("muestra todos si busqueda esta vacia", function () {
        agregarVariosLibros();
        document.getElementById("busqueda").value = "";
        buscarLibros();

        var filas = document.getElementById("tablaLibros").querySelectorAll("tr");
        expect(filas.length).toBe(3);
    });

    test("no muestra nada si no hay coincidencias", function () {
        agregarVariosLibros();
        document.getElementById("busqueda").value = "xyz_nada";
        buscarLibros();

        var filas = document.getElementById("tablaLibros").querySelectorAll("tr");
        expect(filas.length).toBe(0);
    });
});
