// --- Datos ---

function cargarDatos() {
    var datos = localStorage.getItem("biblioteca");
    if (!datos) {
        return { libros: [], usuarios: [], prestamos: [] };
    }
    return JSON.parse(datos);
}

function guardarDatos(datos) {
    localStorage.setItem("biblioteca", JSON.stringify(datos));
}

function generarId() {
    return Math.random().toString(36).substring(2, 10);
}

function fechaHoy() {
    var f = new Date();
    var dia = ("0" + f.getDate()).slice(-2);
    var mes = ("0" + (f.getMonth() + 1)).slice(-2);
    return f.getFullYear() + "-" + mes + "-" + dia;
}

// --- Mensaje ---

function mostrarMsg(texto, tipo) {
    var el = document.getElementById("mensaje");
    el.textContent = texto;
    el.className = tipo;
    setTimeout(function () {
        el.className = "";
        el.style.display = "none";
    }, 2500);
}

// --- Navegacion ---

function mostrarSeccion(nombre) {
    var secciones = document.querySelectorAll(".seccion");
    for (var i = 0; i < secciones.length; i++) {
        secciones[i].classList.add("oculto");
    }
    document.getElementById(nombre).classList.remove("oculto");

    var tabs = document.querySelectorAll(".tab");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove("activa");
    }
    event.target.classList.add("activa");

    if (nombre === "prestamos") {
        llenarSelects();
    }
    renderizar();
}

// --- Libros ---

function agregarLibro(e) {
    e.preventDefault();
    var datos = cargarDatos();

    var libro = {
        id: generarId(),
        titulo: document.getElementById("titulo").value,
        autor: document.getElementById("autor").value,
        genero: document.getElementById("genero").value,
        anio: document.getElementById("anio").value,
        copias: parseInt(document.getElementById("copias").value),
        disponibles: parseInt(document.getElementById("copias").value)
    };

    datos.libros.push(libro);
    guardarDatos(datos);
    document.getElementById("formLibro").reset();
    mostrarMsg("Libro agregado", "exito");
    renderizar();
}

function eliminarLibro(id) {
    if (!confirm("¿Eliminar este libro?")) return;
    var datos = cargarDatos();
    datos.libros = datos.libros.filter(function (l) { return l.id !== id; });
    guardarDatos(datos);
    mostrarMsg("Libro eliminado", "exito");
    renderizar();
}

function buscarLibros() {
    var texto = document.getElementById("busqueda").value.toLowerCase();
    var datos = cargarDatos();
    var tbody = document.getElementById("tablaLibros");
    tbody.innerHTML = "";

    var filtrados = datos.libros.filter(function (l) {
        return l.titulo.toLowerCase().includes(texto) || l.autor.toLowerCase().includes(texto);
    });

    for (var i = 0; i < filtrados.length; i++) {
        var l = filtrados[i];
        var fila = document.createElement("tr");
        fila.innerHTML =
            "<td>" + l.id + "</td>" +
            "<td>" + l.titulo + "</td>" +
            "<td>" + l.autor + "</td>" +
            "<td>" + l.genero + "</td>" +
            "<td>" + l.anio + "</td>" +
            "<td>" + l.disponibles + "/" + l.copias + "</td>" +
            '<td><button class="btn-eliminar" onclick="eliminarLibro(\'' + l.id + '\')">Eliminar</button></td>';
        tbody.appendChild(fila);
    }
}

function renderLibros() {
    document.getElementById("busqueda").value = "";
    buscarLibros();
}

// --- Usuarios ---

function registrarUsuario(e) {
    e.preventDefault();
    var datos = cargarDatos();

    var correo = document.getElementById("email").value;
    var existe = datos.usuarios.some(function (u) { return u.email === correo; });
    if (existe) {
        mostrarMsg("Ya existe un usuario con ese email", "error");
        return;
    }

    var usuario = {
        id: generarId(),
        nombre: document.getElementById("nombre").value,
        email: correo,
        fecha: fechaHoy()
    };

    datos.usuarios.push(usuario);
    guardarDatos(datos);
    document.getElementById("formUsuario").reset();
    mostrarMsg("Usuario registrado", "exito");
    renderizar();
}

function renderUsuarios() {
    var datos = cargarDatos();
    var tbody = document.getElementById("tablaUsuarios");
    tbody.innerHTML = "";

    for (var i = 0; i < datos.usuarios.length; i++) {
        var u = datos.usuarios[i];
        var fila = document.createElement("tr");
        fila.innerHTML =
            "<td>" + u.id + "</td>" +
            "<td>" + u.nombre + "</td>" +
            "<td>" + u.email + "</td>" +
            "<td>" + u.fecha + "</td>";
        tbody.appendChild(fila);
    }
}

// --- Prestamos ---

function llenarSelects() {
    var datos = cargarDatos();

    var selU = document.getElementById("selUsuario");
    selU.innerHTML = '<option value="">-- Seleccionar usuario --</option>';
    for (var i = 0; i < datos.usuarios.length; i++) {
        var u = datos.usuarios[i];
        var op = document.createElement("option");
        op.value = u.id;
        op.textContent = u.nombre + " (" + u.email + ")";
        selU.appendChild(op);
    }

    var selL = document.getElementById("selLibro");
    selL.innerHTML = '<option value="">-- Seleccionar libro --</option>';
    for (var i = 0; i < datos.libros.length; i++) {
        var l = datos.libros[i];
        if (l.disponibles > 0) {
            var op = document.createElement("option");
            op.value = l.id;
            op.textContent = l.titulo + " - " + l.autor + " (" + l.disponibles + " disp.)";
            selL.appendChild(op);
        }
    }
}

function prestarLibro(e) {
    e.preventDefault();
    var datos = cargarDatos();

    var idUsuario = document.getElementById("selUsuario").value;
    var idLibro = document.getElementById("selLibro").value;

    var libro = null;
    for (var i = 0; i < datos.libros.length; i++) {
        if (datos.libros[i].id === idLibro) {
            libro = datos.libros[i];
            break;
        }
    }

    if (!libro || libro.disponibles <= 0) {
        mostrarMsg("No hay copias disponibles", "error");
        return;
    }

    var prestamo = {
        id: generarId(),
        idUsuario: idUsuario,
        idLibro: idLibro,
        fechaPrestamo: fechaHoy(),
        fechaDevolucion: null,
        estado: "activo"
    };

    libro.disponibles--;
    datos.prestamos.push(prestamo);
    guardarDatos(datos);
    document.getElementById("formPrestamo").reset();
    mostrarMsg("Préstamo registrado", "exito");
    llenarSelects();
    renderPrestamos();
}

function devolverLibro(idPrestamo) {
    var datos = cargarDatos();

    var prestamo = null;
    for (var i = 0; i < datos.prestamos.length; i++) {
        if (datos.prestamos[i].id === idPrestamo) {
            prestamo = datos.prestamos[i];
            break;
        }
    }

    if (!prestamo || prestamo.estado === "devuelto") return;

    prestamo.estado = "devuelto";
    prestamo.fechaDevolucion = fechaHoy();

    for (var i = 0; i < datos.libros.length; i++) {
        if (datos.libros[i].id === prestamo.idLibro) {
            datos.libros[i].disponibles++;
            break;
        }
    }

    guardarDatos(datos);
    mostrarMsg("Libro devuelto", "exito");
    llenarSelects();
    renderPrestamos();
}

function getNombreUsuario(id, datos) {
    for (var i = 0; i < datos.usuarios.length; i++) {
        if (datos.usuarios[i].id === id) return datos.usuarios[i].nombre;
    }
    return "Desconocido";
}

function getTituloLibro(id, datos) {
    for (var i = 0; i < datos.libros.length; i++) {
        if (datos.libros[i].id === id) return datos.libros[i].titulo;
    }
    return "Desconocido";
}

function renderPrestamos() {
    var datos = cargarDatos();
    var tbody = document.getElementById("tablaPrestamos");
    tbody.innerHTML = "";

    for (var i = 0; i < datos.prestamos.length; i++) {
        var p = datos.prestamos[i];
        var fila = document.createElement("tr");

        var btnDevolver = "";
        if (p.estado === "activo") {
            btnDevolver = '<button class="btn-devolver" onclick="devolverLibro(\'' + p.id + '\')">Devolver</button>';
        }

        fila.innerHTML =
            "<td>" + p.id + "</td>" +
            "<td>" + getNombreUsuario(p.idUsuario, datos) + "</td>" +
            "<td>" + getTituloLibro(p.idLibro, datos) + "</td>" +
            "<td>" + p.fechaPrestamo + "</td>" +
            "<td>" + (p.fechaDevolucion || "-") + "</td>" +
            "<td>" + (p.estado === "activo" ? "Activo" : "Devuelto") + "</td>" +
            "<td>" + btnDevolver + "</td>";
        tbody.appendChild(fila);
    }
}

// --- Render general ---

function renderizar() {
    renderLibros();
    renderUsuarios();
    renderPrestamos();
}

// al cargar la pagina
renderizar();
