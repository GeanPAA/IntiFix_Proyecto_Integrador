import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8081/api/auth";
const ADMIN_URL = "http://localhost:8081/api/admin";
const PROFILE_URL = "http://localhost:8081/api/profile";
const TECHNICIANS_URL = "http://localhost:8081/api/technicians";
const SOLICITUDES_URL = "http://localhost:8081/api/solicitudes";
const COTIZACIONES_URL = "http://localhost:8081/api/cotizaciones";
const ADMIN_USERS_URL = "http://localhost:8081/api/admin/users";
const CODE_SECONDS = 300;

const SPECIALTIES = [
  "Laptop y PC",
  "Celulares",
  "Electrodomésticos",
  "Electricidad",
  "Gasfitería",
  "Cerrajería",
  "Aire acondicionado",
  "Cámaras de seguridad",
  "Internet y redes",
  "Mantenimiento general",
];

const AVAILABILITY = [
  "Mañana",
  "Tarde",
  "Noche",
  "Fines de semana",
  "Tiempo completo",
];

const estadoClass = (tipo) =>
  tipo === "exito" ? "ayuda-campo exito-texto" : "ayuda-campo error-texto";

const ayudaPasswordClass = (password) => {
  if (password.length === 0) return "ayuda-campo info-texto";
  if (password.length >= 6) return "ayuda-campo exito-texto";
  return "ayuda-campo error-texto";
};

const ayudaPasswordTexto = (password) => {
  if (password.length === 0) return "Mínimo 6 caracteres.";
  if (password.length >= 6) return "✓ Contraseña válida.";
  return "✕ La contraseña debe tener mínimo 6 caracteres.";
};

function App() {
  const [modo, setModo] = useState("registro");
  const [step, setStep] = useState(1);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const [usuarioActual, setUsuarioActual] = useState(null);
  const [authHeader, setAuthHeader] = useState("");
  const [vistaDashboard, setVistaDashboard] = useState("inicio");

  const [tecnicosPendientes, setTecnicosPendientes] = useState([]);
  const [tecnicosAprobados, setTecnicosAprobados] = useState([]);
  const [filtroTecnico, setFiltroTecnico] = useState("");

  const [perfil, setPerfil] = useState(null);
  const [perfilForm, setPerfilForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImageUrl: "",
    specialties: "",
    serviceZone: "",
    availability: "",
  });

  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [usuariosAdmin, setUsuariosAdmin] = useState([]);
  const [usuarioAdminSeleccionado, setUsuarioAdminSeleccionado] =
    useState(null);
  const [filtroUsuarioAdmin, setFiltroUsuarioAdmin] = useState("");
  const [filtroRolAdmin, setFiltroRolAdmin] = useState("TODOS");
  const [filtroEstadoAdmin, setFiltroEstadoAdmin] = useState("TODOS");

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState("TODOS");
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [resultadoSeguimiento, setResultadoSeguimiento] = useState(null);
  const [estadoNuevoSolicitud, setEstadoNuevoSolicitud] =
    useState("EN_REVISION");
  const [comentarioEstado, setComentarioEstado] = useState("");

  const [solicitudForm, setSolicitudForm] = useState({
    equipo: "",
    titulo: "",
    descripcion: "",
    modalidad: "TALLER",
    direccion: "",
    tecnicoId: null,
  });

  const [emailEstado, setEmailEstado] = useState({ texto: "", tipo: "" });
  const [dniEstado, setDniEstado] = useState({ texto: "", tipo: "" });
  const [phoneEstado, setPhoneEstado] = useState({ texto: "", tipo: "" });

  const [modalCodigo, setModalCodigo] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(CODE_SECONDS);

  // ── Chat (nuevo) ────────────────────────────────
  const [chatMensajes, setChatMensajes] = useState([]);
  const [chatTexto, setChatTexto] = useState("");
  const [chatCargando, setChatCargando] = useState(false);
  const [chatNoLeidos, setChatNoLeidos] = useState({});
  const chatEndRef = React.useRef(null);

  // ── Foto perfil (nuevo) ──────────────────────────
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoSubiendo, setFotoSubiendo] = useState(false);

  // ── Cotizaciones (EP-05) ──────────────────────────
  const [cotizaciones, setCotizaciones] = useState([]);
  const [cotizacionForm, setCotizacionForm] = useState({
    precio: "",
    tiempoHoras: "",
  });
  const [enviandoCotizacion, setEnviandoCotizacion] = useState(false);

  const [formData, setFormData] = useState({
    role: "CLIENTE",
    name: "",
    dni: "",
    email: "",
    phone: "",
    password: "",
    verificationMethod: "EMAIL",
    specialties: [],
    locationType: "LIMA",
    serviceZone: "",
    provinceRegion: "",
    provinceName: "",
    provinceDistrict: "",
    availability: [],
    code: "",
    recoveryCode: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  useEffect(() => {
    if (!modalCodigo) return;

    const intervalo = setInterval(() => {
      setSegundosRestantes((actual) => {
        if (actual <= 1) {
          clearInterval(intervalo);
          return 0;
        }

        return actual - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [modalCodigo]);

  useEffect(() => {
    if (modo !== "registro") return;

    const email = formData.email.trim().toLowerCase();

    if (email === "") {
      setEmailEstado({ texto: "", tipo: "" });
      return;
    }

    if (!email.includes("@")) {
      setEmailEstado({ texto: "Ingresa un correo válido.", tipo: "error" });
      return;
    }

    const delay = setTimeout(() => {
      validarEmailDisponible(email);
    }, 600);

    return () => clearTimeout(delay);
  }, [formData.email, modo]);

  useEffect(() => {
    if (modo !== "registro") return;

    if (formData.dni.trim() === "") {
      setDniEstado({ texto: "", tipo: "" });
      return;
    }

    if (!/^[0-9]{8}$/.test(formData.dni)) {
      setDniEstado({ texto: "El DNI debe tener 8 números.", tipo: "error" });
      return;
    }

    const delay = setTimeout(() => {
      validarDniDisponible(formData.dni);
    }, 600);

    return () => clearTimeout(delay);
  }, [formData.dni, modo]);

  useEffect(() => {
    if (modo !== "registro") return;

    if (formData.phone.trim() === "") {
      setPhoneEstado({ texto: "", tipo: "" });
      return;
    }

    if (!/^9[0-9]{8}$/.test(formData.phone)) {
      setPhoneEstado({
        texto: "El teléfono debe tener 9 dígitos y empezar con 9.",
        tipo: "error",
      });
      return;
    }

    const delay = setTimeout(() => {
      validarPhoneDisponible(formData.phone);
    }, 600);

    return () => clearTimeout(delay);
  }, [formData.phone, modo]);

  const crearAuthHeader = (email, password) => {
    return `Basic ${window.btoa(`${email}:${password}`)}`;
  };

  const leerRespuesta = async (respuesta) => {
    const texto = await respuesta.text();

    try {
      return JSON.parse(texto);
    } catch {
      return texto;
    }
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      setFormData({
        ...formData,
        dni: value.replace(/\D/g, "").slice(0, 8),
      });
      return;
    }

    if (name === "phone") {
      setFormData({
        ...formData,
        phone: value.replace(/\D/g, "").slice(0, 9),
      });
      return;
    }

    if (name === "code") {
      setFormData({
        ...formData,
        code: value.replace(/\D/g, "").slice(0, 6),
      });
      return;
    }

    if (name === "recoveryCode") {
      setFormData({
        ...formData,
        recoveryCode: value.replace(/\D/g, "").slice(0, 6),
      });
      return;
    }

    if (name === "email") {
      setFormData({
        ...formData,
        email: value.trim().toLowerCase(),
      });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const mostrarMensaje = (texto, tipo) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
  };

  const limpiarTodo = () => {
    setStep(1);
    setRecoveryStep(1);

    setFormData({
      role: "CLIENTE",
      name: "",
      dni: "",
      email: "",
      phone: "",
      password: "",
      verificationMethod: "EMAIL",
      specialties: [],
      locationType: "LIMA",
      serviceZone: "",
      provinceRegion: "",
      provinceName: "",
      provinceDistrict: "",
      availability: [],
      code: "",
      recoveryCode: "",
      newPassword: "",
      confirmNewPassword: "",
    });

    setEmailEstado({ texto: "", tipo: "" });
    setDniEstado({ texto: "", tipo: "" });
    setPhoneEstado({ texto: "", tipo: "" });
  };

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setMensaje("");
    setTipoMensaje("");
    setModalCodigo(false);
    setRecoveryStep(1);
    limpiarTodo();
  };

  const irARecuperacion = () => {
    setModo("recuperacion");
    setMensaje("");
    setTipoMensaje("");
    setRecoveryStep(1);

    setFormData((prev) => ({
      ...prev,
      recoveryCode: "",
      newPassword: "",
      confirmNewPassword: "",
    }));
  };

  const toggleArrayItem = (field, value) => {
    const actual = formData[field];

    setFormData({
      ...formData,
      [field]: actual.includes(value)
        ? actual.filter((item) => item !== value)
        : [...actual, value],
    });
  };

  const validarEmailDisponible = async (email) => {
    try {
      setEmailEstado({ texto: "Validando correo...", tipo: "validando" });

      const respuesta = await fetch(
        `${API_URL}/check-email?email=${encodeURIComponent(email)}`,
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setEmailEstado({
          texto: "No se pudo validar el correo.",
          tipo: "error",
        });
        return;
      }

      setEmailEstado(
        data.exists
          ? { texto: "Este correo ya está registrado.", tipo: "error" }
          : { texto: "Correo disponible.", tipo: "exito" },
      );
    } catch {
      setEmailEstado({
        texto:
          "No se pudo validar el correo. Revisa si el backend está encendido.",
        tipo: "error",
      });
    }
  };

  const validarDniDisponible = async (dni) => {
    try {
      setDniEstado({ texto: "Validando DNI...", tipo: "validando" });

      const respuesta = await fetch(
        `${API_URL}/check-dni?dni=${encodeURIComponent(dni)}`,
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setDniEstado({
          texto: "No se pudo validar el DNI.",
          tipo: "error",
        });
        return;
      }

      setDniEstado(
        data.exists
          ? { texto: "Este DNI ya está registrado.", tipo: "error" }
          : { texto: "DNI disponible.", tipo: "exito" },
      );
    } catch {
      setDniEstado({
        texto:
          "No se pudo validar el DNI. Revisa si el backend está encendido.",
        tipo: "error",
      });
    }
  };

  const validarPhoneDisponible = async (phone) => {
    try {
      setPhoneEstado({ texto: "Validando teléfono...", tipo: "validando" });

      const respuesta = await fetch(
        `${API_URL}/check-phone?phone=${encodeURIComponent(phone)}`,
      );

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setPhoneEstado({
          texto: "No se pudo validar el teléfono.",
          tipo: "error",
        });
        return;
      }

      setPhoneEstado(
        data.exists
          ? { texto: "Este teléfono ya está registrado.", tipo: "error" }
          : { texto: "Teléfono disponible.", tipo: "exito" },
      );
    } catch {
      setPhoneEstado({
        texto:
          "No se pudo validar el teléfono. Revisa si el backend está encendido.",
        tipo: "error",
      });
    }
  };

  const validarStepActual = () => {
    if (step === 1) {
      if (formData.role !== "CLIENTE" && formData.role !== "TECNICO") {
        throw new Error("Selecciona el tipo de cuenta.");
      }
    }

    if (step === 2) {
      if (formData.name.trim().length < 3) {
        throw new Error("Ingresa un nombre válido.");
      }

      if (!/^[0-9]{8}$/.test(formData.dni)) {
        throw new Error("El DNI debe tener 8 números.");
      }

      // Si hay error al validar DNI, mostrar advertencia pero permitir continuar
      if (dniEstado.tipo === "error") {
        if (
          !window.confirm(
            "⚠️ " + dniEstado.texto + "\n¿Deseas continuar de todas formas?",
          )
        ) {
          throw new Error(dniEstado.texto);
        }
      }

      if (!formData.email.includes("@")) {
        throw new Error("Ingresa un correo válido.");
      }

      // Si hay error al validar email, mostrar advertencia pero permitir continuar
      if (emailEstado.tipo === "error") {
        if (
          !window.confirm(
            "⚠️ " + emailEstado.texto + "\n¿Deseas continuar de todas formas?",
          )
        ) {
          throw new Error(emailEstado.texto);
        }
      }

      if (!/^9[0-9]{8}$/.test(formData.phone)) {
        throw new Error("El teléfono debe tener 9 dígitos y empezar con 9.");
      }

      // Si hay error al validar phone, mostrar advertencia pero permitir continuar
      if (phoneEstado.tipo === "error") {
        if (
          !window.confirm(
            "⚠️ " + phoneEstado.texto + "\n¿Deseas continuar de todas formas?",
          )
        ) {
          throw new Error(phoneEstado.texto);
        }
      }

      if (formData.password.length < 6) {
        throw new Error("La contraseña debe tener mínimo 6 caracteres.");
      }
    }

    if (step === 3) {
      if (
        formData.verificationMethod !== "EMAIL" &&
        formData.verificationMethod !== "SMS"
      ) {
        throw new Error("Selecciona un método de verificación.");
      }
    }

    if (step === 4 && formData.role === "TECNICO") {
      if (formData.specialties.length === 0) {
        throw new Error("Selecciona al menos una especialidad.");
      }

      if (
        formData.locationType !== "LIMA" &&
        formData.locationType !== "PROVINCIA"
      ) {
        throw new Error("Selecciona el tipo de ubicación.");
      }

      if (
        formData.locationType === "LIMA" &&
        formData.serviceZone.trim().length < 2
      ) {
        throw new Error("Ingresa el distrito de atención.");
      }

      if (formData.locationType === "PROVINCIA") {
        if (
          formData.provinceRegion.trim().length < 2 ||
          formData.provinceName.trim().length < 2 ||
          formData.provinceDistrict.trim().length < 2
        ) {
          throw new Error("Completa región, provincia y distrito.");
        }
      }

      if (formData.availability.length === 0) {
        throw new Error("Selecciona al menos una disponibilidad.");
      }
    }
  };

  const siguientePaso = () => {
    setMensaje("");
    setTipoMensaje("");

    try {
      validarStepActual();

      if (formData.role === "CLIENTE" && step === 3) {
        solicitarCodigoRegistro();
        return;
      }

      if (formData.role === "TECNICO" && step === 4) {
        solicitarCodigoRegistro();
        return;
      }

      setStep(step + 1);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const pasoAnterior = () => {
    setMensaje("");
    setTipoMensaje("");

    if (step > 1) {
      setStep(step - 1);
    }
  };

  const construirZonaServicio = () => {
    if (formData.role !== "TECNICO") return "";

    if (formData.locationType === "LIMA") {
      return `Lima - Lima Metropolitana - ${formData.serviceZone}`;
    }

    return `${formData.provinceRegion} - ${formData.provinceName} - ${formData.provinceDistrict}`;
  };

  const construirBodyRegistro = () => ({
    name: formData.name.trim(),
    dni: formData.dni,
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone,
    password: formData.password,
    role: formData.role,
    verificationMethod: formData.verificationMethod,
    specialties:
      formData.role === "TECNICO" ? formData.specialties.join(", ") : "",
    locationType: formData.role === "TECNICO" ? formData.locationType : "",
    serviceZone: construirZonaServicio(),
    availability:
      formData.role === "TECNICO" ? formData.availability.join(", ") : "",
  });

  const solicitarCodigoRegistro = async () => {
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      const respuesta = await fetch(`${API_URL}/register/request-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(construirBodyRegistro()),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto || "No se pudo enviar el código.");
      }

      setFormData({
        ...formData,
        code: "",
      });

      mostrarMensaje("✅ " + texto, "exito");
      setSegundosRestantes(CODE_SECONDS);
      setModalCodigo(true);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const confirmarCodigo = async () => {
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      if (!/^[0-9]{6}$/.test(formData.code)) {
        throw new Error("El código debe tener 6 números.");
      }

      const respuesta = await fetch(`${API_URL}/register/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: formData.code,
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto || "No se pudo confirmar el registro.");
      }

      setModalCodigo(false);
      mostrarMensaje("✅ " + texto, "exito");
      limpiarTodo();
      setModo("login");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const reenviarCodigo = async () => {
    await solicitarCodigoRegistro();
  };

  const solicitarCodigoRecuperacion = async (e) => {
    if (e) e.preventDefault();

    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      if (!formData.email || !formData.email.includes("@")) {
        throw new Error("Ingresa un correo electrónico válido.");
      }

      const respuesta = await fetch(`${API_URL}/password/request-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto || "No se pudo enviar el código.");
      }

      setFormData({
        ...formData,
        recoveryCode: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      setRecoveryStep(2);
      mostrarMensaje("✅ " + texto, "exito");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const validarCodigoRecuperacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      if (!/^[0-9]{6}$/.test(formData.recoveryCode)) {
        throw new Error("El código debe tener 6 números.");
      }

      const respuesta = await fetch(`${API_URL}/password/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: formData.recoveryCode,
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto || "No se pudo validar el código.");
      }

      setRecoveryStep(3);
      mostrarMensaje("✅ " + texto, "exito");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const cambiarPasswordRecuperacion = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      if (formData.newPassword.length < 6) {
        throw new Error("La nueva contraseña debe tener mínimo 6 caracteres.");
      }

      if (formData.newPassword !== formData.confirmNewPassword) {
        throw new Error("Las contraseñas no coinciden.");
      }

      const respuesta = await fetch(`${API_URL}/password/change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: formData.recoveryCode,
          newPassword: formData.newPassword,
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto || "No se pudo cambiar la contraseña.");
      }

      setRecoveryStep(4);
      mostrarMensaje("✅ " + texto, "exito");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      const emailLogin = formData.email.trim().toLowerCase();
      const passwordLogin = formData.password;

      const respuesta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailLogin,
          password: passwordLogin,
        }),
      });

      const texto = await respuesta.text();
      let data;

      try {
        data = JSON.parse(texto);
      } catch {
        data = { message: texto };
      }

      if (!respuesta.ok) {
        throw new Error(data.message || texto || "No se pudo iniciar sesión.");
      }

      const header = crearAuthHeader(emailLogin, passwordLogin);

      setAuthHeader(header);
      setUsuarioActual(data);
      setVistaDashboard("inicio");

      mostrarMensaje(
        "✅ " + (data.message || "Inicio de sesión correcto."),
        "exito",
      );

      if (data.role === "ADMIN") {
        cargarTecnicosPendientes();
      }

      if (data.role === "CLIENTE") {
        cargarTecnicosAprobados();
      }

      cargarPerfil(header);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setUsuarioActual(null);
    setAuthHeader("");
    setPerfil(null);
    setTecnicosAprobados([]);
    setTecnicosPendientes([]);
    setSolicitudes([]);
    setSolicitudSeleccionada(null);
    setResultadoSeguimiento(null);
    setFiltroTecnico("");
    setFiltroEstadoSolicitud("TODOS");
    setCodigoSeguimiento("");
    setVistaDashboard("inicio");
    limpiarTodo();
    setModo("login");
    setMensaje("");
    setTipoMensaje("");
  };

  const cargarTecnicosPendientes = async () => {
    try {
      const respuesta = await fetch(`${ADMIN_URL}/technicians/pending`);
      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los técnicos pendientes.");
      }

      setTecnicosPendientes(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const aprobarTecnico = async (id) => {
    try {
      const respuesta = await fetch(`${ADMIN_URL}/technicians/${id}/approve`, {
        method: "POST",
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto || "No se pudo aprobar el técnico.");
      }

      mostrarMensaje("✅ " + texto, "exito");
      cargarTecnicosPendientes();
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const rechazarTecnico = async (id) => {
    try {
      const respuesta = await fetch(`${ADMIN_URL}/technicians/${id}/reject`, {
        method: "POST",
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto || "No se pudo rechazar el técnico.");
      }

      mostrarMensaje("✅ " + texto, "exito");
      cargarTecnicosPendientes();
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const cargarTecnicosAprobados = async () => {
    try {
      const respuesta = await fetch(`${TECHNICIANS_URL}/approved`);
      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los técnicos aprobados.");
      }

      setTecnicosAprobados(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const cargarPerfil = async (headerManual = authHeader) => {
    if (!headerManual) return;

    try {
      const respuesta = await fetch(PROFILE_URL, {
        method: "GET",
        headers: {
          Authorization: headerManual,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo cargar el perfil.",
        );
      }

      setPerfil(data);
      setPerfilForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        profileImageUrl: data.profileImageUrl || "",
        specialties: data.specialties || "",
        serviceZone: data.serviceZone || "",
        availability: data.availability || "",
      });
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const actualizarPerfil = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      if (perfilForm.name.trim().length < 3) {
        throw new Error("Ingresa un nombre válido.");
      }

      if (!perfilForm.email.includes("@")) {
        throw new Error("Ingresa un correo válido.");
      }

      if (!/^9[0-9]{8}$/.test(perfilForm.phone.trim())) {
        throw new Error("El teléfono debe tener 9 dígitos y empezar con 9.");
      }

      const respuesta = await fetch(PROFILE_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          name: perfilForm.name.trim(),
          email: perfilForm.email.trim().toLowerCase(),
          phone: perfilForm.phone.trim(),
          address: perfilForm.address.trim(),
          profileImageUrl: perfilForm.profileImageUrl.trim(),
          specialties: perfilForm.specialties.trim(),
          serviceZone: perfilForm.serviceZone.trim(),
          availability: perfilForm.availability.trim(),
        }),
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo actualizar el perfil.",
        );
      }

      mostrarMensaje("✅ Perfil actualizado correctamente.", "exito");
      cargarPerfil();
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const eliminarMiCuenta = async () => {
    const confirmar = window.confirm(
      "¿Seguro que deseas desactivar tu cuenta? Se cerrará tu sesión automáticamente.",
    );

    if (!confirmar) return;

    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      const respuesta = await fetch(PROFILE_URL, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo desactivar la cuenta.",
        );
      }

      alert("Cuenta desactivada correctamente.");
      cerrarSesion();
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const cargarMisSolicitudes = async (estado = filtroEstadoSolicitud) => {
    try {
      const query = estado && estado !== "TODOS" ? `?estado=${estado}` : "";

      const respuesta = await fetch(
        `${SOLICITUDES_URL}/mis-solicitudes${query}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
          },
        },
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "No se pudieron cargar las solicitudes.",
        );
      }

      const lista = Array.isArray(data) ? data : [];
      setSolicitudes(lista);
      // Cargar badges de mensajes no leídos para cada solicitud
      lista.forEach((sol) => cargarNoLeidos(sol.id));
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const cargarSolicitudesGestion = async (estado = filtroEstadoSolicitud) => {
    try {
      const query = estado && estado !== "TODOS" ? `?estado=${estado}` : "";

      const respuesta = await fetch(`${SOLICITUDES_URL}${query}`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "No se pudieron cargar las solicitudes.",
        );
      }

      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const registrarSolicitud = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      if (solicitudForm.equipo.trim().length < 3) {
        throw new Error("Ingresa el equipo correctamente.");
      }

      if (solicitudForm.titulo.trim().length < 5) {
        throw new Error("Ingresa un título válido para la falla.");
      }

      if (solicitudForm.descripcion.trim().length < 10) {
        throw new Error("La descripción debe tener mínimo 10 caracteres.");
      }

      if (
        solicitudForm.modalidad === "DOMICILIO" &&
        solicitudForm.direccion.trim().length < 5
      ) {
        throw new Error(
          "La dirección es obligatoria para atención a domicilio.",
        );
      }

      const respuesta = await fetch(SOLICITUDES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          equipo: solicitudForm.equipo.trim(),
          titulo: solicitudForm.titulo.trim(),
          descripcion: solicitudForm.descripcion.trim(),
          modalidad: solicitudForm.modalidad,
          direccion:
            solicitudForm.modalidad === "DOMICILIO"
              ? solicitudForm.direccion.trim()
              : "",
          tecnicoId: solicitudForm.tecnicoId || null,
        }),
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "No se pudo registrar la solicitud.",
        );
      }

      mostrarMensaje(
        `✅ Solicitud registrada correctamente. Código: ${data.codigo}`,
        "exito",
      );

      setSolicitudForm({
        equipo: "",
        titulo: "",
        descripcion: "",
        modalidad: "TALLER",
        direccion: "",
        tecnicoId: null,
      });

      setCodigoSeguimiento(data.codigo || "");
      setVistaDashboard("historial");
      await cargarMisSolicitudes("TODOS");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const verDetalleSolicitud = async (id) => {
    try {
      const respuesta = await fetch(`${SOLICITUDES_URL}/${id}`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo cargar el detalle.",
        );
      }

      setSolicitudSeleccionada(data);
      setEstadoNuevoSolicitud(data.estado || "EN_REVISION");
      setComentarioEstado("");
      setChatMensajes([]);
      setCotizaciones([]);
      setVistaDashboard("detalleSolicitud");
      cargarChat(id);
      cargarCotizaciones(id);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  // ── Cotizaciones (EP-05) ────────────────────────────
  const cargarCotizaciones = async (solicitudId) => {
    try {
      const respuesta = await fetch(
        `${COTIZACIONES_URL}/solicitud/${solicitudId}/listar`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
          },
        },
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "No se pudieron cargar cotizaciones.",
        );
      }

      setCotizaciones(data);
    } catch (error) {
      console.warn("Error cargando cotizaciones:", error.message);
      setCotizaciones([]);
    }
  };

  const enviarCotizacion = async (e) => {
    e.preventDefault();

    if (!solicitudSeleccionada) {
      mostrarMensaje("❌ Selecciona una solicitud.", "error");
      return;
    }

    if (
      !cotizacionForm.precio ||
      cotizacionForm.precio < 1 ||
      cotizacionForm.precio > 10000
    ) {
      mostrarMensaje("❌ Precio debe estar entre 1 y 10000.", "error");
      return;
    }

    if (
      !cotizacionForm.tiempoHoras ||
      cotizacionForm.tiempoHoras < 1 ||
      cotizacionForm.tiempoHoras > 168
    ) {
      mostrarMensaje("❌ Tiempo debe estar entre 1 y 168 horas.", "error");
      return;
    }

    setEnviandoCotizacion(true);

    try {
      const respuesta = await fetch(
        `${COTIZACIONES_URL}/solicitud/${solicitudSeleccionada.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            precio: Number(cotizacionForm.precio),
            tiempoHoras: Number(cotizacionForm.tiempoHoras),
          }),
        },
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "Error al enviar cotización.",
        );
      }

      mostrarMensaje("✅ Cotización enviada correctamente.", "exito");
      setCotizacionForm({ precio: "", tiempoHoras: "" });
      cargarCotizaciones(solicitudSeleccionada.id);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setEnviandoCotizacion(false);
    }
  };

  const aceptarCotizacion = async (cotizacionId) => {
    try {
      const respuesta = await fetch(
        `${COTIZACIONES_URL}/${cotizacionId}/aceptar`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
          },
        },
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "Error al aceptar cotización.",
        );
      }

      mostrarMensaje("✅ Cotización aceptada. Técnico asignado.", "exito");
      verDetalleSolicitud(solicitudSeleccionada.id);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const subirEvidencia = async (e) => {
    e.preventDefault();

    if (!solicitudSeleccionada) {
      mostrarMensaje("❌ Selecciona una solicitud.", "error");
      return;
    }

    if (!archivoEvidencia) {
      mostrarMensaje("❌ Selecciona una imagen.", "error");
      return;
    }

    setCargando(true);

    try {
      const formDataArchivo = new FormData();
      formDataArchivo.append("archivo", archivoEvidencia);

      const respuesta = await fetch(
        `${SOLICITUDES_URL}/${solicitudSeleccionada.id}/evidencias`,
        {
          method: "POST",
          headers: {
            Authorization: authHeader,
          },
          body: formDataArchivo,
        },
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo subir la evidencia.",
        );
      }

      mostrarMensaje("✅ Evidencia subida correctamente.", "exito");
      setArchivoEvidencia(null);
      setSolicitudSeleccionada(data);
      await verDetalleSolicitud(solicitudSeleccionada.id);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const consultarEstadoSolicitud = async (e) => {
    e.preventDefault();
    setResultadoSeguimiento(null);

    try {
      if (codigoSeguimiento.trim().length < 5) {
        throw new Error("Ingresa un código válido.");
      }

      const respuesta = await fetch(
        `${SOLICITUDES_URL}/seguimiento/${codigoSeguimiento.trim().toUpperCase()}`,
        { method: "GET" },
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se encontró la solicitud.",
        );
      }

      setResultadoSeguimiento(data);
      mostrarMensaje("✅ Estado consultado correctamente.", "exito");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const actualizarEstadoSolicitud = async (e) => {
    e.preventDefault();

    if (!solicitudSeleccionada) {
      mostrarMensaje("❌ Selecciona una solicitud.", "error");
      return;
    }

    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      const respuesta = await fetch(
        `${SOLICITUDES_URL}/${solicitudSeleccionada.id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            estadoNuevo: estadoNuevoSolicitud,
            comentario: comentarioEstado.trim(),
          }),
        },
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo actualizar el estado.",
        );
      }

      mostrarMensaje("✅ Estado actualizado correctamente.", "exito");
      setSolicitudSeleccionada(data);
      setComentarioEstado("");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  // ── Chat functions ───────────────────────────────────────────────
  const cargarChat = async (solicitudId) => {
    try {
      const res = await fetch(`${SOLICITUDES_URL}/${solicitudId}/chat`, {
        headers: { Authorization: authHeader },
      });
      if (res.ok) {
        const data = await res.json();
        setChatMensajes(Array.isArray(data) ? data : []);
        setTimeout(
          () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          80,
        );
        setChatNoLeidos((prev) => ({ ...prev, [solicitudId]: 0 }));
      }
    } catch {}
  };

  // Carga el perfil público de un técnico usando el endpoint seguro
  const cargarPerfilPublicoTecnico = async (tecnicoId) => {
    try {
      const res = await fetch(`${PROFILE_URL}/${tecnicoId}/publico`, {
        headers: { Authorization: authHeader },
      });
      if (res.ok) {
        const data = await res.json();
        setTecnicoSeleccionado(data);
      }
    } catch {}
  };

  const cargarNoLeidos = async (solicitudId) => {
    try {
      const res = await fetch(
        `${SOLICITUDES_URL}/${solicitudId}/chat/no-leidos`,
        {
          headers: { Authorization: authHeader },
        },
      );
      if (res.ok) {
        const data = await res.json();
        if (data.noLeidos > 0) {
          setChatNoLeidos((prev) => ({
            ...prev,
            [solicitudId]: data.noLeidos,
          }));
        }
      }
    } catch {}
  };

  const enviarMensajeChat = async () => {
    if (!chatTexto.trim() || !solicitudSeleccionada) return;
    setChatCargando(true);
    try {
      const res = await fetch(
        `${SOLICITUDES_URL}/${solicitudSeleccionada.id}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({ contenido: chatTexto.trim() }),
        },
      );
      if (res.ok) {
        setChatTexto("");
        await cargarChat(solicitudSeleccionada.id);
      }
    } catch {}
    setChatCargando(false);
  };

  // ── Foto perfil functions ────────────────────────────────────────
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFotoArchivo(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const subirFotoPerfil = async () => {
    if (!fotoArchivo) return;
    setFotoSubiendo(true);
    try {
      const fd = new FormData();
      fd.append("foto", fotoArchivo);
      const res = await fetch(`${PROFILE_URL}/foto`, {
        method: "POST",
        headers: { Authorization: authHeader },
        body: fd,
      });
      const resData = await res.json().catch(() => ({}));
      if (res.ok) {
        mostrarMensaje(
          "✅ " + (resData.mensaje || "Foto actualizada correctamente."),
          "exito",
        );
        setFotoArchivo(null);
        setFotoPreview(null);
        await cargarPerfil();
      } else {
        mostrarMensaje(
          "❌ " + (resData.message || "No se pudo subir la foto."),
          "error",
        );
      }
    } catch {
      mostrarMensaje("❌ Error al subir la foto.", "error");
    }
    setFotoSubiendo(false);
  };

  const reactivarCuenta = async () => {
    setCargando(true);
    setMensaje("");
    setTipoMensaje("");

    try {
      const emailLogin = formData.email.trim().toLowerCase();
      const passwordLogin = formData.password;

      if (!emailLogin || !emailLogin.includes("@")) {
        throw new Error("Ingresa tu correo para reactivar la cuenta.");
      }

      if (!passwordLogin || passwordLogin.length < 6) {
        throw new Error("Ingresa tu contraseña para reactivar la cuenta.");
      }

      const header = crearAuthHeader(emailLogin, passwordLogin);

      const respuesta = await fetch(`${PROFILE_URL}/reactivate`, {
        method: "PUT",
        headers: {
          Authorization: header,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo reactivar la cuenta.",
        );
      }

      mostrarMensaje(
        "✅ Cuenta reactivada correctamente. Ahora inicia sesión.",
        "exito",
      );
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const cargarUsuariosAdmin = async (
    rol = filtroRolAdmin,
    estado = filtroEstadoAdmin,
    busqueda = filtroUsuarioAdmin,
  ) => {
    try {
      const params = new URLSearchParams();
      if (rol && rol !== "TODOS") params.append("role", rol);
      if (estado && estado !== "TODOS") params.append("estado", estado);
      if (busqueda && busqueda.trim()) params.append("buscar", busqueda.trim());

      const respuesta = await fetch(`${ADMIN_USERS_URL}?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "No se pudieron cargar los usuarios.",
        );
      }

      setUsuariosAdmin(Array.isArray(data) ? data : []);
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const verPerfilUsuarioAdmin = async (id) => {
    try {
      const respuesta = await fetch(`${ADMIN_USERS_URL}/${id}`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo cargar el usuario.",
        );
      }

      setUsuarioAdminSeleccionado(data);
      setVistaDashboard("detalleUsuarioAdmin");
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const cambiarEstadoUsuarioAdmin = async (id, estado, textoConfirmacion) => {
    if (textoConfirmacion && !window.confirm(textoConfirmacion)) return;

    const rutasPorEstado = {
      APROBADO: "activar",
      INACTIVO: "desactivar",
      BANEADO: "banear",
      ELIMINADO: "eliminar",
    };

    const accion = rutasPorEstado[estado];

    if (!accion) {
      mostrarMensaje("❌ Estado no válido.", "error");
      return;
    }

    try {
      const respuesta = await fetch(`${ADMIN_USERS_URL}/${id}/${accion}`, {
        method: "PUT",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo actualizar el usuario.",
        );
      }

      mostrarMensaje("✅ Usuario actualizado correctamente.", "exito");
      await cargarUsuariosAdmin();
      if (usuarioAdminSeleccionado?.id === id) {
        await verPerfilUsuarioAdmin(id);
      }
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const verDetalleTecnico = (tecnico) => {
    setTecnicoSeleccionado(tecnico); // datos iniciales del listado
    setVistaDashboard("detalleTecnico");
    // Reemplaza con datos del endpoint /publico (enmascarado y seguro)
    cargarPerfilPublicoTecnico(tecnico.id);
  };

  const tecnicosFiltrados = tecnicosAprobados.filter((tecnico) => {
    const texto = `${tecnico.name || ""} ${tecnico.email || ""} ${
      tecnico.phone || ""
    } ${tecnico.specialties || ""} ${tecnico.serviceZone || ""} ${
      tecnico.availability || ""
    }`.toLowerCase();

    return texto.includes(filtroTecnico.toLowerCase());
  });

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const totalSteps = formData.role === "TECNICO" ? 4 : 3;

  if (usuarioActual) {
    // ── Logo SVG ─────────────────────────────────────────────────────
    const LogoSVG = ({ size = 42 }) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 42 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="42" height="42" rx="12" fill="#1A6BFF" />
        <rect x="11" y="11" width="5" height="20" rx="2.5" fill="white" />
        <rect x="11" y="11" width="15" height="5" rx="2.5" fill="white" />
        <rect x="11" y="19" width="11" height="4" rx="2" fill="white" />
        <circle cx="30" cy="30" r="5" fill="#7AB3FF" />
        <circle cx="30" cy="30" r="2.5" fill="white" />
      </svg>
    );

    const inicialUsuario = usuarioActual.name
      ? usuarioActual.name.charAt(0).toUpperCase()
      : "U";

    // ── Nav SVG icons by key ──────────────────────────────────────────
    const NAV_ICONS = {
      inicio: [
        "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
        "M9 22V12h6v10",
      ],
      perfil: [
        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2",
        "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      ],
      tecnicos: [
        "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
      ],
      nuevaSolicitud: [
        "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
        "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
      ],
      historial: [
        "M9 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9",
        "M17 2v5h5",
        "M9 12h6",
        "M9 16h6",
      ],
      seguimiento: [
        "M21 21l-4.35-4.35",
        "M17 11A6 6 0 1 0 5 11a6 6 0 0 0 12 0z",
      ],
      solicitudesGestion: [
        "M9 2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9",
        "M17 2v5h5",
        "M9 12h6",
        "M9 16h6",
      ],
      usuariosAdmin: [
        "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
        "M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
        "M23 21v-2a4 4 0 0 0-3-3.87",
        "M16 3.13a4 4 0 0 1 0 7.75",
      ],
      pendientes: ["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"],
    };

    const NavIcon = ({ name }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {(NAV_ICONS[name] || ["M12 12h.01"]).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
    );

    const navItems = {
      CLIENTE: [
        { key: "inicio", label: "Inicio" },
        { key: "perfil", label: "Mi perfil", cb: () => cargarPerfil() },
        {
          key: "tecnicos",
          label: "Técnicos",
          cb: () => cargarTecnicosAprobados(),
        },
        { key: "nuevaSolicitud", label: "Nueva solicitud" },
        {
          key: "historial",
          label: "Historial",
          cb: () => cargarMisSolicitudes(),
        },
        { key: "seguimiento", label: "Seguimiento" },
      ],
      TECNICO: [
        { key: "inicio", label: "Inicio" },
        { key: "perfil", label: "Mi perfil", cb: () => cargarPerfil() },
        {
          key: "solicitudesGestion",
          label: "Solicitudes",
          cb: () => cargarSolicitudesGestion(),
        },
      ],
      ADMIN: [
        { key: "inicio", label: "Inicio" },
        { key: "perfil", label: "Mi perfil", cb: () => cargarPerfil() },
        {
          key: "solicitudesGestion",
          label: "Solicitudes",
          cb: () => cargarSolicitudesGestion(),
        },
        {
          key: "usuariosAdmin",
          label: "Usuarios",
          cb: () => cargarUsuariosAdmin(),
        },
        {
          key: "pendientes",
          label: "Aprobaciones",
          cb: () => cargarTecnicosPendientes(),
        },
      ],
    };

    const currentNavItems = navItems[usuarioActual.role] || [];

    return (
      <div className="dashboard-layout">
        {/* ════════ SIDEBAR ════════ */}
        <aside className="sidebar-pro">
          <div className="sidebar-logo">
            <LogoSVG size={42} />
            <div>
              <h1>
                <span style={{ color: "#fff" }}>Inti</span>
                <span style={{ color: "#7AB3FF" }}>Fix</span>
              </h1>
              <p>Servicios técnicos</p>
            </div>
          </div>

          <nav className="sidebar-menu">
            {currentNavItems.map((item) => (
              <button
                key={item.key}
                className={
                  vistaDashboard === item.key ||
                  (item.key === "usuariosAdmin" &&
                    vistaDashboard === "detalleUsuarioAdmin")
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setVistaDashboard(item.key);
                  if (item.cb) item.cb();
                }}
              >
                <span className="nav-icon">
                  <NavIcon name={item.key} />
                </span>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-help">
            <h4>IntiFix Pro</h4>
            <p>Gestiona servicios técnicos de forma ordenada y segura.</p>
          </div>

          <div className="sidebar-footer">
            <button className="logout-side" onClick={cerrarSesion}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* ════════ MAIN ════════ */}
        <main className="main-pro">
          {/* TOPBAR */}
          <header className="topbar-pro">
            <div>
              <p className="topbar-label">Centro de servicios</p>
              <h2>
                Hola, <span>{usuarioActual.name}</span>
              </h2>
            </div>
            <div className="topbar-actions user-menu-area">
              <button
                className="user-chip user-chip-button"
                type="button"
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
              >
                {perfil?.profileImageUrl ? (
                  <img
                    className="avatar-img"
                    src={perfil.profileImageUrl}
                    alt="Perfil"
                  />
                ) : (
                  <div className="avatar-user">{inicialUsuario}</div>
                )}
                <div>
                  <strong>{usuarioActual.name}</strong>
                  <small>{usuarioActual.role}</small>
                </div>
              </button>
              {menuUsuarioAbierto && (
                <div className="user-dropdown">
                  <button
                    type="button"
                    onClick={() => {
                      setVistaDashboard("perfil");
                      setMenuUsuarioAbierto(false);
                      cargarPerfil();
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Mi perfil
                  </button>
                  <button type="button" onClick={cerrarSesion}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* ══ INICIO CLIENTE ══ */}
          {vistaDashboard === "inicio" && usuarioActual.role === "CLIENTE" && (
            <section className="content-pro">
              <div className="hero-dashboard">
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span className="section-badge">Área del cliente</span>
                  <h1>
                    Tu equipo en buenas
                    <br />
                    manos, siempre.
                  </h1>
                  <p>
                    Técnicos verificados por IntiFix listos para atenderte en
                    Lima y provincias. Rápido, seguro y con seguimiento en
                    tiempo real.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="btn-pro primary"
                      onClick={() => {
                        setVistaDashboard("tecnicos");
                        cargarTecnicosAprobados();
                      }}
                    >
                      Ver técnicos disponibles
                    </button>
                    <button
                      className="btn-pro secondary"
                      onClick={() => setVistaDashboard("nuevaSolicitud")}
                    >
                      Registrar solicitud
                    </button>
                  </div>
                </div>
                <div className="hero-card">
                  <div className="hero-card-icon">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7AB3FF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <h3>Servicio rápido</h3>
                  <p>Técnicos validados disponibles ahora</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div
                    className="stat-icon-wrap"
                    style={{ background: "#EEF4FF" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1A6BFF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <h3>{tecnicosAprobados.length}</h3>
                    <p>Técnicos activos</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div
                    className="stat-icon-wrap"
                    style={{ background: "#F0FDF9" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00B87A"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22,4 12,14.01 9,11.01" />
                    </svg>
                  </div>
                  <div>
                    <h3>{solicitudes.length}</h3>
                    <p>Mis solicitudes</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div
                    className="stat-icon-wrap"
                    style={{ background: "#FFF8EB" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F5A623"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                    </svg>
                  </div>
                  <div>
                    <h3>4.9</h3>
                    <p>Calificación media</p>
                  </div>
                </div>
              </div>

              <div className="cards-pro-grid">
                <div className="feature-card">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: "#EEF4FF" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1A6BFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </div>
                  <h3>Registrar reparación</h3>
                  <p>
                    Describe la falla, elige el tipo de atención y recibe un
                    código único para rastrear tu servicio.
                  </p>
                  <button
                    className="btn-pro primary"
                    onClick={() => setVistaDashboard("nuevaSolicitud")}
                  >
                    Nueva solicitud
                  </button>
                </div>
                <div className="feature-card">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: "#F0FDF9" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00B87A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="2" width="6" height="4" rx="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <line x1="9" y1="12" x2="15" y2="12" />
                      <line x1="9" y1="16" x2="15" y2="16" />
                    </svg>
                  </div>
                  <h3>Mis solicitudes</h3>
                  <p>
                    Revisa el historial de tus reparaciones, adjunta evidencias
                    y sigue el estado de cada servicio.
                  </p>
                  <button
                    className="btn-pro secondary"
                    onClick={() => {
                      setVistaDashboard("historial");
                      cargarMisSolicitudes();
                    }}
                  >
                    Ver historial
                  </button>
                </div>
                <div className="feature-card">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: "#F5F0FF" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C3AED"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <h3>Seguimiento</h3>
                  <p>
                    Consulta el estado de tu reparación con el código único. Ve
                    en qué fase está tu solicitud.
                  </p>
                  <button
                    className="btn-pro secondary"
                    onClick={() => setVistaDashboard("seguimiento")}
                  >
                    Consultar estado
                  </button>
                </div>
                <div className="feature-card">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: "#FFF4F4" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#E53E3E"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  </div>
                  <h3>Técnicos disponibles</h3>
                  <p>
                    Explora el directorio de técnicos verificados por IntiFix.
                    Filtra por especialidad y zona.
                  </p>
                  <button
                    className="btn-pro secondary"
                    onClick={() => {
                      setVistaDashboard("tecnicos");
                      cargarTecnicosAprobados();
                    }}
                  >
                    Ver directorio
                  </button>
                </div>
              </div>

              <div className="how-it-works">
                <h2>¿Cómo funciona IntiFix?</h2>
                <div className="steps-grid">
                  <div className="step-item">
                    <div className="step-num">1</div>
                    <div className="step-content-block">
                      <h4>Registra tu solicitud</h4>
                      <p>
                        Describe el equipo y el problema. Elige taller o
                        atención a domicilio.
                      </p>
                    </div>
                  </div>
                  <div className="step-divider" />
                  <div className="step-item">
                    <div className="step-num">2</div>
                    <div className="step-content-block">
                      <h4>Un técnico lo revisa</h4>
                      <p>
                        IntiFix asigna un técnico calificado según tu tipo de
                        equipo y ubicación.
                      </p>
                    </div>
                  </div>
                  <div className="step-divider" />
                  <div className="step-item">
                    <div className="step-num">3</div>
                    <div className="step-content-block">
                      <h4>Sigue el avance</h4>
                      <p>
                        Usa tu código único para ver en qué fase está y chatea
                        con el técnico.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══ INICIO TÉCNICO ══ */}
          {vistaDashboard === "inicio" && usuarioActual.role === "TECNICO" && (
            <section className="content-pro">
              <div className="hero-dashboard">
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span className="section-badge">Área técnica</span>
                  <h1>
                    Gestiona tus servicios
                    <br />
                    de reparación
                  </h1>
                  <p>
                    Revisa las solicitudes asignadas, actualiza estados y
                    comunícate con clientes desde la plataforma.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="btn-pro primary"
                      onClick={() => {
                        setVistaDashboard("solicitudesGestion");
                        cargarSolicitudesGestion();
                      }}
                    >
                      Ver solicitudes
                    </button>
                    <button
                      className="btn-pro secondary"
                      onClick={() => {
                        setVistaDashboard("perfil");
                        cargarPerfil();
                      }}
                    >
                      Editar mi perfil
                    </button>
                  </div>
                </div>
                <div className="hero-card">
                  <div className="hero-card-icon">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7AB3FF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3>Perfil técnico</h3>
                  <p>Mantén tu información actualizada</p>
                </div>
              </div>
              <div className="cards-pro-grid">
                <div className="feature-card">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: "#EEF4FF" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1A6BFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="2" width="6" height="4" rx="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <line x1="9" y1="12" x2="15" y2="12" />
                    </svg>
                  </div>
                  <h3>Solicitudes asignadas</h3>
                  <p>
                    Gestiona las reparaciones de tus clientes y actualiza el
                    estado de cada servicio.
                  </p>
                  <button
                    className="btn-pro primary"
                    onClick={() => {
                      setVistaDashboard("solicitudesGestion");
                      cargarSolicitudesGestion();
                    }}
                  >
                    Gestionar
                  </button>
                </div>
                <div className="feature-card">
                  <div
                    className="feature-icon-wrap"
                    style={{ background: "#F0FDF9" }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00B87A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h3>Mi perfil técnico</h3>
                  <p>
                    Actualiza tus especialidades, zona de atención y
                    disponibilidad.
                  </p>
                  <button
                    className="btn-pro secondary"
                    onClick={() => {
                      setVistaDashboard("perfil");
                      cargarPerfil();
                    }}
                  >
                    Editar perfil
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ══ INICIO ADMIN ══ */}
          {vistaDashboard === "inicio" && usuarioActual.role === "ADMIN" && (
            <section className="content-pro">
              <div className="hero-dashboard">
                <div style={{ position: "relative", zIndex: 1 }}>
                  <span className="section-badge">Administración</span>
                  <h1>
                    Panel de control
                    <br />
                    IntiFix
                  </h1>
                  <p>
                    Administra técnicos, clientes y solicitudes. Aprueba
                    registros y mantén la plataforma en orden.
                  </p>
                  <div className="hero-actions">
                    <button
                      className="btn-pro primary"
                      onClick={() => {
                        setVistaDashboard("pendientes");
                        cargarTecnicosPendientes();
                      }}
                    >
                      Revisar aprobaciones
                    </button>
                    <button
                      className="btn-pro secondary"
                      onClick={() => {
                        setVistaDashboard("solicitudesGestion");
                        cargarSolicitudesGestion();
                      }}
                    >
                      Gestionar solicitudes
                    </button>
                  </div>
                </div>
                <div className="hero-card">
                  <div className="hero-card-icon">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7AB3FF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3>Administrador</h3>
                  <p>Control total de la plataforma</p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div
                    className="stat-icon-wrap"
                    style={{ background: "#FFF8EB" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#F5A623"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <h3>{tecnicosPendientes.length}</h3>
                    <p>Pendientes de aprobación</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div
                    className="stat-icon-wrap"
                    style={{ background: "#EEF4FF" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#1A6BFF"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <h3>Admin</h3>
                    <p>Rol activo</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div
                    className="stat-icon-wrap"
                    style={{ background: "#F0FDF9" }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#00B87A"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <div>
                    <h3>Seguro</h3>
                    <p>Acceso protegido</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══ PERFIL ══ */}
          {vistaDashboard === "perfil" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Cuenta</span>
                  <h1>Mi perfil</h1>
                  <p>Actualiza tu información y foto de perfil.</p>
                </div>
              </div>
              <div className="profile-layout">
                <form className="profile-form" onSubmit={actualizarPerfil}>
                  <h3>Editar información</h3>
                  <div className="form-row-pro">
                    <label>Nombre completo</label>
                    <input
                      type="text"
                      value={perfilForm.name}
                      onChange={(e) =>
                        setPerfilForm({ ...perfilForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-row-pro">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      value={perfilForm.email}
                      onChange={(e) =>
                        setPerfilForm({
                          ...perfilForm,
                          email: e.target.value.trim().toLowerCase(),
                        })
                      }
                    />
                  </div>
                  <div className="form-row-pro">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={perfilForm.phone}
                      onChange={(e) =>
                        setPerfilForm({
                          ...perfilForm,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 9),
                        })
                      }
                    />
                  </div>
                  <div className="form-row-pro">
                    <label>Dirección</label>
                    <input
                      type="text"
                      placeholder="Av. Los Olivos 123, Lima"
                      value={perfilForm.address}
                      onChange={(e) =>
                        setPerfilForm({
                          ...perfilForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  {usuarioActual.role === "TECNICO" && (
                    <>
                      <div className="form-row-pro">
                        <label>Especialidades</label>
                        <input
                          type="text"
                          value={perfilForm.specialties}
                          onChange={(e) =>
                            setPerfilForm({
                              ...perfilForm,
                              specialties: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-row-pro">
                        <label>Zona de atención</label>
                        <input
                          type="text"
                          value={perfilForm.serviceZone}
                          onChange={(e) =>
                            setPerfilForm({
                              ...perfilForm,
                              serviceZone: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="form-row-pro">
                        <label>Disponibilidad</label>
                        <input
                          type="text"
                          value={perfilForm.availability}
                          onChange={(e) =>
                            setPerfilForm({
                              ...perfilForm,
                              availability: e.target.value,
                            })
                          }
                        />
                      </div>
                    </>
                  )}
                  <button
                    className="btn-pro primary full"
                    type="submit"
                    disabled={cargando}
                  >
                    {cargando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </form>

                <div className="profile-summary">
                  <div className="foto-upload-area">
                    {fotoPreview ? (
                      <img
                        className="profile-avatar-large"
                        src={fotoPreview}
                        alt="Preview"
                        style={{ objectFit: "cover" }}
                      />
                    ) : perfil?.profileImageUrl ? (
                      <img
                        className="profile-photo-large"
                        src={perfil.profileImageUrl}
                        alt="Perfil"
                      />
                    ) : (
                      <div className="profile-avatar-large">
                        {inicialUsuario}
                      </div>
                    )}
                    <div className="foto-upload-btns">
                      <label className="btn-upload-label">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17,8 12,3 7,8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Elegir foto
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          style={{ display: "none" }}
                        />
                      </label>
                      {fotoArchivo && (
                        <button
                          type="button"
                          className="btn-pro primary"
                          onClick={subirFotoPerfil}
                          disabled={fotoSubiendo}
                          style={{ padding: "8px 14px", fontSize: 12 }}
                        >
                          {fotoSubiendo ? "Subiendo..." : "Guardar foto"}
                        </button>
                      )}
                    </div>
                    {fotoArchivo && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text3)",
                          textAlign: "center",
                        }}
                      >
                        {fotoArchivo.name}
                      </p>
                    )}
                  </div>
                  <h3>{perfil?.name || usuarioActual.name}</h3>
                  <p>{perfil?.email || usuarioActual.email}</p>
                  <div className="profile-info-list">
                    <div>
                      <span>Teléfono</span>
                      <strong>{perfil?.phone || "—"}</strong>
                    </div>
                    <div>
                      <span>Dirección</span>
                      <strong>{perfil?.address || "—"}</strong>
                    </div>
                    <div>
                      <span>Rol</span>
                      <strong>{perfil?.role || usuarioActual.role}</strong>
                    </div>
                    <div>
                      <span>Estado</span>
                      <strong>{perfil?.accountStatus || "APROBADO"}</strong>
                    </div>
                    {usuarioActual.role === "TECNICO" && (
                      <>
                        <div>
                          <span>Especialidades</span>
                          <strong>{perfil?.specialties || "—"}</strong>
                        </div>
                        <div>
                          <span>Zona</span>
                          <strong>{perfil?.serviceZone || "—"}</strong>
                        </div>
                        <div>
                          <span>Disponibilidad</span>
                          <strong>{perfil?.availability || "—"}</strong>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    className="btn-pro secondary full"
                    type="button"
                    onClick={() => cargarPerfil()}
                  >
                    Actualizar datos
                  </button>
                  {usuarioActual.role !== "ADMIN" && (
                    <button
                      className="btn-pro danger full danger-margin"
                      type="button"
                      onClick={eliminarMiCuenta}
                      disabled={cargando}
                    >
                      Desactivar mi cuenta
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ══ TÉCNICOS ══ */}
          {vistaDashboard === "tecnicos" &&
            usuarioActual.role === "CLIENTE" && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Directorio técnico</span>
                    <h1>Técnicos disponibles</h1>
                    <p>Técnicos verificados por IntiFix.</p>
                  </div>
                  <button
                    className="btn-pro primary"
                    type="button"
                    onClick={cargarTecnicosAprobados}
                  >
                    Actualizar
                  </button>
                </div>
                <div className="search-panel-pro">
                  <label>Buscar técnico</label>
                  <input
                    type="text"
                    placeholder="Nombre, zona, especialidad..."
                    value={filtroTecnico}
                    onChange={(e) => setFiltroTecnico(e.target.value)}
                  />
                </div>
                <div className="technicians-grid-pro">
                  {tecnicosFiltrados.length === 0 && (
                    <div className="empty-state-pro">
                      <div>👷</div>
                      <h3>Sin técnicos disponibles</h3>
                      <p>Cuando el admin apruebe técnicos aparecerán aquí.</p>
                    </div>
                  )}
                  {tecnicosFiltrados.map((tecnico) => (
                    <div className="technician-pro-card" key={tecnico.id}>
                      <div className="technician-head">
                        <div className="avatar-tech">
                          {tecnico.profileImageUrl ? (
                            <img
                              src={tecnico.profileImageUrl}
                              alt={tecnico.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "14px",
                              }}
                            />
                          ) : (
                            tecnico.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <h3>{tecnico.name}</h3>
                          <span>Disponible</span>
                        </div>
                      </div>
                      <div className="tech-info">
                        <p>
                          <strong>Especialidades:</strong>{" "}
                          {tecnico.specialties || "—"}
                        </p>
                        <p>
                          <strong>Zona:</strong> {tecnico.serviceZone || "—"}
                        </p>
                        <p>
                          <strong>Disponibilidad:</strong>{" "}
                          {tecnico.availability || "—"}
                        </p>
                      </div>
                      <button
                        className="btn-pro primary full"
                        type="button"
                        onClick={() => verDetalleTecnico(tecnico)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ══ DETALLE TÉCNICO ══ */}
          {vistaDashboard === "detalleTecnico" && tecnicoSeleccionado && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Perfil técnico</span>
                  <h1>{tecnicoSeleccionado.name}</h1>
                  <p>Información profesional del técnico.</p>
                </div>
                <button
                  className="btn-pro secondary"
                  type="button"
                  onClick={() => setVistaDashboard("tecnicos")}
                >
                  Volver
                </button>
              </div>
              <div className="profile-layout">
                <div className="profile-summary tecnico-detail-card">
                  {tecnicoSeleccionado.profileImageUrl ? (
                    <img
                      className="profile-photo-large"
                      src={tecnicoSeleccionado.profileImageUrl}
                      alt="Técnico"
                    />
                  ) : (
                    <div className="profile-avatar-large">
                      {tecnicoSeleccionado.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3>{tecnicoSeleccionado.name}</h3>
                  <div className="profile-info-list">
                    <div>
                      <span>Especialidades</span>
                      <strong>{tecnicoSeleccionado.specialties || "—"}</strong>
                    </div>
                    <div>
                      <span>Zona</span>
                      <strong>{tecnicoSeleccionado.serviceZone || "—"}</strong>
                    </div>
                    <div>
                      <span>Disponibilidad</span>
                      <strong>{tecnicoSeleccionado.availability || "—"}</strong>
                    </div>
                  </div>
                </div>
                <div className="profile-form">
                  <h3>Solicitar atención con este técnico</h3>
                  <p className="info-texto" style={{ marginBottom: 12 }}>
                    Al crear la solicitud con este técnico, el backend validará
                    que su especialidad sea compatible con el equipo que
                    reportes.
                  </p>
                  <button
                    className="btn-pro primary full"
                    type="button"
                    onClick={() => {
                      setSolicitudForm({
                        ...solicitudForm,
                        titulo: `Servicio con ${tecnicoSeleccionado.name}`,
                        tecnicoId: tecnicoSeleccionado.id,
                      });
                      setVistaDashboard("nuevaSolicitud");
                    }}
                  >
                    Crear solicitud para este técnico
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ══ NUEVA SOLICITUD ══ */}
          {vistaDashboard === "nuevaSolicitud" &&
            usuarioActual.role === "CLIENTE" && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Solicitud</span>
                    <h1>Registrar reparación</h1>
                    <p>Completa los datos del equipo y describe la falla.</p>
                  </div>
                </div>
                <form
                  className="profile-form solicitud-form-pro"
                  onSubmit={registrarSolicitud}
                >
                  <div className="request-type-grid">
                    {[
                      { t: "Laptop", i: "💻" },
                      { t: "Celular", i: "📱" },
                      { t: "Impresora", i: "🖨️" },
                      { t: "PC", i: "🖥️" },
                      { t: "Tablet", i: "📲" },
                      { t: "Otro", i: "🧰" },
                    ].map(({ t, i }) => (
                      <button
                        key={t}
                        type="button"
                        className={
                          solicitudForm.equipo
                            .toLowerCase()
                            .includes(t.toLowerCase())
                            ? "request-type-card selected"
                            : "request-type-card"
                        }
                        onClick={() =>
                          setSolicitudForm({ ...solicitudForm, equipo: t })
                        }
                      >
                        <span>{i}</span>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="form-row-pro">
                    <label>Equipo tecnológico</label>
                    <input
                      type="text"
                      placeholder="Laptop Lenovo, celular Samsung, impresora HP..."
                      value={solicitudForm.equipo}
                      onChange={(e) =>
                        setSolicitudForm({
                          ...solicitudForm,
                          equipo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row-pro">
                    <label>Título de la falla</label>
                    <input
                      type="text"
                      placeholder="No enciende, pantalla rota, equipo lento..."
                      value={solicitudForm.titulo}
                      onChange={(e) =>
                        setSolicitudForm({
                          ...solicitudForm,
                          titulo: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row-pro">
                    <label>Descripción del problema</label>
                    <textarea
                      placeholder="Describe qué pasó, desde cuándo ocurre y qué intentaste hacer."
                      value={solicitudForm.descripcion}
                      onChange={(e) =>
                        setSolicitudForm({
                          ...solicitudForm,
                          descripcion: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-row-pro">
                    <label>Modalidad del servicio</label>
                    <div className="modalidad-cards">
                      {[
                        {
                          m: "TALLER",
                          i: "🏪",
                          t: "Llevar al taller",
                          s: "El cliente lleva el equipo al punto de atención.",
                        },
                        {
                          m: "DOMICILIO",
                          i: "🏠",
                          t: "Atención a domicilio",
                          s: "El técnico atiende en la dirección indicada.",
                        },
                      ].map(({ m, i, t, s }) => (
                        <button
                          key={m}
                          type="button"
                          className={
                            solicitudForm.modalidad === m
                              ? "modalidad-card selected"
                              : "modalidad-card"
                          }
                          onClick={() =>
                            setSolicitudForm({ ...solicitudForm, modalidad: m })
                          }
                        >
                          <span>{i}</span>
                          <strong>{t}</strong>
                          <small>{s}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                  {solicitudForm.modalidad === "DOMICILIO" && (
                    <div className="form-row-pro">
                      <label>Dirección de atención</label>
                      <input
                        type="text"
                        placeholder="Av. Los Próceres 123, San Juan de Lurigancho"
                        value={solicitudForm.direccion}
                        onChange={(e) =>
                          setSolicitudForm({
                            ...solicitudForm,
                            direccion: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}
                  {solicitudForm.tecnicoId && (
                    <div
                      style={{
                        background: "var(--blue-soft)",
                        border: "1.5px solid rgba(26,107,255,0.2)",
                        borderRadius: "var(--r-md)",
                        padding: "10px 14px",
                        fontSize: 13,
                        color: "var(--blue)",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>
                        ✓ Técnico preferido seleccionado — el backend valida
                        compatibilidad de especialidad
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSolicitudForm({
                            ...solicitudForm,
                            tecnicoId: null,
                          })
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--red)",
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <button
                    className="btn-pro primary full"
                    type="submit"
                    disabled={cargando}
                  >
                    {cargando
                      ? "Registrando..."
                      : solicitudForm.tecnicoId
                        ? "Registrar con técnico preferido"
                        : "Registrar solicitud"}
                  </button>
                </form>
              </section>
            )}

          {/* ══ HISTORIAL ══ */}
          {vistaDashboard === "historial" &&
            usuarioActual.role === "CLIENTE" && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Historial</span>
                    <h1>Mis solicitudes</h1>
                    <p>Revisa el estado de todas tus reparaciones.</p>
                  </div>
                  <button
                    className="btn-pro primary"
                    type="button"
                    onClick={() => cargarMisSolicitudes()}
                  >
                    Actualizar
                  </button>
                </div>
                <div className="search-panel-pro">
                  <label>Filtrar por estado</label>
                  <select
                    value={filtroEstadoSolicitud}
                    onChange={(e) => {
                      setFiltroEstadoSolicitud(e.target.value);
                      cargarMisSolicitudes(e.target.value);
                    }}
                  >
                    <option value="TODOS">Todos</option>
                    {[
                      "REGISTRADA",
                      "EN_REVISION",
                      "ASIGNADA",
                      "EN_PROCESO",
                      "FINALIZADA",
                      "CANCELADA",
                    ].map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="technicians-grid-pro">
                  {solicitudes.length === 0 && (
                    <div className="empty-state-pro">
                      <div>📭</div>
                      <h3>Sin solicitudes</h3>
                      <p>Cuando registres una reparación aparecerá aquí.</p>
                    </div>
                  )}
                  {solicitudes.map((sol) => (
                    <div
                      className="technician-pro-card solicitud-card"
                      key={sol.id}
                    >
                      <div className="technician-head">
                        <div className="avatar-tech" style={{ fontSize: 20 }}>
                          🧾
                        </div>
                        <div>
                          <h3>{sol.titulo}</h3>
                          <span className={`estado-badge estado-${sol.estado}`}>
                            {sol.estado}
                          </span>
                        </div>
                      </div>
                      <div className="tech-info">
                        <p>
                          <strong>Código:</strong> {sol.codigo}
                        </p>
                        <p>
                          <strong>Equipo:</strong> {sol.equipo}
                        </p>
                        <p>
                          <strong>Modalidad:</strong> {sol.modalidad}
                        </p>
                        <p>
                          <strong>Fecha:</strong>{" "}
                          {sol.fechaRegistro
                            ? new Date(sol.fechaRegistro).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-pro primary"
                          style={{ flex: 1, position: "relative" }}
                          type="button"
                          onClick={() => verDetalleSolicitud(sol.id)}
                        >
                          Ver detalle
                        </button>
                        <button
                          className="btn-pro secondary"
                          style={{
                            position: "relative",
                            width: 44,
                            flexShrink: 0,
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          type="button"
                          title="Abrir chat"
                          onClick={() => verDetalleSolicitud(sol.id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          {chatNoLeidos[sol.id] > 0 && (
                            <span
                              style={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                background: "var(--red)",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 17,
                                height: 17,
                                fontSize: 10,
                                fontWeight: 800,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {chatNoLeidos[sol.id]}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ══ SEGUIMIENTO ══ */}
          {vistaDashboard === "seguimiento" &&
            usuarioActual.role === "CLIENTE" && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Seguimiento</span>
                    <h1>Rastrear solicitud</h1>
                    <p>
                      Ingresa tu código para ver en qué fase está tu reparación.
                    </p>
                  </div>
                </div>
                <form
                  className="profile-form"
                  style={{ maxWidth: 500 }}
                  onSubmit={consultarEstadoSolicitud}
                >
                  <div className="form-row-pro">
                    <label>Código de solicitud</label>
                    <input
                      type="text"
                      placeholder="IFX-1234ABCD"
                      value={codigoSeguimiento}
                      onChange={(e) => setCodigoSeguimiento(e.target.value)}
                    />
                  </div>
                  <button className="btn-pro primary full" type="submit">
                    Consultar estado
                  </button>
                </form>

                {resultadoSeguimiento &&
                  (() => {
                    const pasoActual = resultadoSeguimiento.pasoActual || 1;
                    const fases = [
                      {
                        label: "Sin revisar",
                        desc: "Tu solicitud fue registrada y está en espera.",
                        Ic: () => (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12,6 12,12 16,14" />
                          </svg>
                        ),
                      },
                      {
                        label: "Revisado",
                        desc: "Un técnico revisó y será asignado pronto.",
                        Ic: () => (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        ),
                      },
                      {
                        label: "En atención",
                        desc: "Tu equipo está siendo reparado ahora mismo.",
                        Ic: () => (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                          </svg>
                        ),
                      },
                    ];
                    return (
                      <div className="seguimiento-resultado">
                        <div className="seg-header">
                          <div>
                            <span
                              className="section-badge"
                              style={{
                                background: "rgba(0,184,122,0.1)",
                                borderColor: "rgba(0,184,122,0.2)",
                                color: "var(--green)",
                              }}
                            >
                              Resultado
                            </span>
                            <h3>{resultadoSeguimiento.titulo}</h3>
                            <p style={{ color: "var(--text3)", fontSize: 13 }}>
                              {resultadoSeguimiento.codigo}
                            </p>
                            {/* Fase del backend: faseEtiqueta y faseDescripcion */}
                            {resultadoSeguimiento.faseEtiqueta && (
                              <div
                                style={{
                                  marginTop: 8,
                                  padding: "8px 12px",
                                  background: "var(--blue-soft)",
                                  borderRadius: "var(--r-md)",
                                  display: "inline-flex",
                                  gap: 8,
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: 13,
                                    color: "var(--blue)",
                                  }}
                                >
                                  {resultadoSeguimiento.faseIcono}{" "}
                                  {resultadoSeguimiento.faseEtiqueta}
                                </span>
                                {resultadoSeguimiento.faseDescripcion && (
                                  <span
                                    style={{
                                      fontSize: 12,
                                      color: "var(--text2)",
                                    }}
                                  >
                                    {resultadoSeguimiento.faseDescripcion}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexDirection: "column",
                              alignItems: "flex-end",
                            }}
                          >
                            {resultadoSeguimiento.finalizada && (
                              <span className="estado-badge estado-FINALIZADA">
                                ✓ Finalizada
                              </span>
                            )}
                            {resultadoSeguimiento.cancelada && (
                              <span className="estado-badge estado-CANCELADA">
                                ✕ Cancelada
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="fases-tracker">
                          {fases.map((f, idx) => {
                            const isActive = pasoActual === idx + 1;
                            const isDone = pasoActual > idx + 1;
                            return (
                              <React.Fragment key={idx}>
                                <div
                                  className={`fase-step${isDone ? " done" : ""}${isActive ? " active" : ""}`}
                                >
                                  <div className="fase-circle">
                                    {isDone ? (
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <polyline points="20,6 9,17 4,12" />
                                      </svg>
                                    ) : (
                                      <f.Ic />
                                    )}
                                  </div>
                                  <span className="fase-label">{f.label}</span>
                                  {(isDone || isActive) && (
                                    <span className="fase-desc">{f.desc}</span>
                                  )}
                                </div>
                                {idx < 2 && (
                                  <div
                                    className={`fase-line${pasoActual > idx + 1 ? " done" : ""}`}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                        <div
                          className="profile-info-list"
                          style={{ marginTop: 8 }}
                        >
                          <div>
                            <span>Equipo</span>
                            <strong>{resultadoSeguimiento.equipo}</strong>
                          </div>
                          <div>
                            <span>Modalidad</span>
                            <strong>{resultadoSeguimiento.modalidad}</strong>
                          </div>
                          {resultadoSeguimiento.tecnicoNombre && (
                            <div>
                              <span>Técnico asignado</span>
                              <strong>
                                {resultadoSeguimiento.tecnicoNombre}
                              </strong>
                            </div>
                          )}
                          <div>
                            <span>Última actualización</span>
                            <strong>
                              {resultadoSeguimiento.fechaActualizacion
                                ? new Date(
                                    resultadoSeguimiento.fechaActualizacion,
                                  ).toLocaleString()
                                : "—"}
                            </strong>
                          </div>
                        </div>

                        {/* Botón para ir al detalle completo con chat */}
                        <div
                          style={{
                            marginTop: 16,
                            padding: "14px 16px",
                            background: "rgba(26,107,255,0.06)",
                            border: "1.5px solid rgba(26,107,255,0.15)",
                            borderRadius: "var(--r-lg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--blue)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <div>
                              <p
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: "var(--text)",
                                }}
                              >
                                ¿Tienes dudas sobre tu reparación?
                              </p>
                              <p
                                style={{ fontSize: 12, color: "var(--text3)" }}
                              >
                                Ve al historial para chatear directamente con el
                                técnico asignado.
                              </p>
                            </div>
                          </div>
                          <button
                            className="btn-pro primary"
                            style={{
                              flexShrink: 0,
                              width: "auto",
                              padding: "10px 18px",
                              fontSize: 13,
                            }}
                            onClick={() => {
                              setVistaDashboard("historial");
                              cargarMisSolicitudes();
                            }}
                          >
                            Ver historial y chatear
                          </button>
                        </div>
                      </div>
                    );
                  })()}
              </section>
            )}

          {/* ══ SOLICITUDES GESTIÓN ══ */}
          {vistaDashboard === "solicitudesGestion" &&
            (usuarioActual.role === "ADMIN" ||
              usuarioActual.role === "TECNICO") && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Gestión</span>
                    <h1>Solicitudes de reparación</h1>
                    <p>
                      Revisa, filtra y actualiza el avance de cada servicio.
                    </p>
                  </div>
                  <button
                    className="btn-pro primary"
                    type="button"
                    onClick={() => cargarSolicitudesGestion()}
                  >
                    Actualizar
                  </button>
                </div>
                <div className="search-panel-pro">
                  <label>Filtrar por estado</label>
                  <select
                    value={filtroEstadoSolicitud}
                    onChange={(e) => {
                      setFiltroEstadoSolicitud(e.target.value);
                      cargarSolicitudesGestion(e.target.value);
                    }}
                  >
                    <option value="TODOS">Todos</option>
                    {[
                      "REGISTRADA",
                      "EN_REVISION",
                      "ASIGNADA",
                      "EN_PROCESO",
                      "FINALIZADA",
                      "CANCELADA",
                    ].map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="technicians-grid-pro">
                  {solicitudes.length === 0 && (
                    <div className="empty-state-pro">
                      <div>📭</div>
                      <h3>Sin solicitudes</h3>
                      <p>
                        Cuando los clientes registren servicios aparecerán aquí.
                      </p>
                    </div>
                  )}
                  {solicitudes.map((sol) => (
                    <div
                      className="technician-pro-card solicitud-card"
                      key={sol.id}
                    >
                      <div className="technician-head">
                        <div className="avatar-tech" style={{ fontSize: 20 }}>
                          🧾
                        </div>
                        <div>
                          <h3>{sol.titulo}</h3>
                          <span className={`estado-badge estado-${sol.estado}`}>
                            {sol.estado}
                          </span>
                        </div>
                      </div>
                      <div className="tech-info">
                        <p>
                          <strong>Código:</strong> {sol.codigo}
                        </p>
                        <p>
                          <strong>Cliente:</strong> {sol.clienteNombre}
                        </p>
                        <p>
                          <strong>Equipo:</strong> {sol.equipo}
                        </p>
                        <p>
                          <strong>Modalidad:</strong> {sol.modalidad}
                        </p>
                      </div>
                      <button
                        className="btn-pro primary full"
                        type="button"
                        onClick={() => verDetalleSolicitud(sol.id)}
                      >
                        Gestionar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ══ DETALLE SOLICITUD ══ */}
          {vistaDashboard === "detalleSolicitud" && solicitudSeleccionada && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Detalle</span>
                  <h1>{solicitudSeleccionada.titulo}</h1>
                  <code
                    style={{
                      background: "var(--surface2)",
                      padding: "3px 10px",
                      borderRadius: 6,
                      fontSize: 13,
                      fontFamily: "monospace",
                    }}
                  >
                    {solicitudSeleccionada.codigo}
                  </code>
                </div>
                <button
                  className="btn-pro secondary"
                  type="button"
                  onClick={() => {
                    if (usuarioActual.role === "CLIENTE") {
                      setVistaDashboard("historial");
                      cargarMisSolicitudes();
                    } else {
                      setVistaDashboard("solicitudesGestion");
                      cargarSolicitudesGestion();
                    }
                  }}
                >
                  ← Volver
                </button>
              </div>

              <div className="detalle-grid">
                <div>
                  <div
                    className="profile-summary detalle-solicitud"
                    style={{ textAlign: "left", alignItems: "flex-start" }}
                  >
                    <span
                      className={`estado-badge estado-${solicitudSeleccionada.estado}`}
                      style={{ fontSize: 13, padding: "5px 14px" }}
                    >
                      {solicitudSeleccionada.estado}
                    </span>
                    <h3 style={{ marginTop: 8 }}>
                      {solicitudSeleccionada.equipo}
                    </h3>
                    <div
                      className="profile-info-list"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <span>Cliente</span>
                        <strong>
                          {solicitudSeleccionada.clienteNombre || "—"}
                        </strong>
                      </div>
                      <div>
                        <span>Correo</span>
                        <strong>
                          {solicitudSeleccionada.clienteCorreo || "—"}
                        </strong>
                      </div>
                      <div>
                        <span>Modalidad</span>
                        <strong>{solicitudSeleccionada.modalidad}</strong>
                      </div>
                      <div>
                        <span>Dirección</span>
                        <strong>
                          {solicitudSeleccionada.direccion || "No aplica"}
                        </strong>
                      </div>
                    </div>
                    <div
                      className="detalle-descripcion"
                      style={{ width: "100%" }}
                    >
                      {solicitudSeleccionada.descripcion}
                    </div>
                  </div>
                  <div className="profile-form" style={{ marginTop: 16 }}>
                    <h3>Historial de cambios</h3>
                    {(!solicitudSeleccionada.historial ||
                      solicitudSeleccionada.historial.length === 0) && (
                      <p className="info-texto">Sin historial registrado.</p>
                    )}
                    {solicitudSeleccionada.historial?.map((item) => (
                      <div className="historial-item" key={item.id}>
                        <strong>
                          {item.estadoAnterior || "INICIO"} → {item.estadoNuevo}
                        </strong>
                        <p>{item.comentario}</p>
                        <small>
                          Responsable: {item.responsable} |{" "}
                          {item.fechaCambio
                            ? new Date(item.fechaCambio).toLocaleString()
                            : ""}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detalle-right">
                  <div className="profile-form">
                    {usuarioActual.role === "CLIENTE" && (
                      <>
                        <h3>Adjuntar evidencia</h3>
                        <form onSubmit={subirEvidencia}>
                          <div className="form-row-pro">
                            <label>Imagen del problema</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                setArchivoEvidencia(e.target.files[0])
                              }
                            />
                          </div>
                          <button
                            className="btn-pro primary full"
                            type="submit"
                            disabled={cargando}
                          >
                            {cargando ? "Subiendo..." : "Subir evidencia"}
                          </button>
                        </form>
                      </>
                    )}
                    {(usuarioActual.role === "ADMIN" ||
                      usuarioActual.role === "TECNICO") && (
                      <>
                        <h3>Actualizar estado</h3>
                        <form onSubmit={actualizarEstadoSolicitud}>
                          <div className="form-row-pro">
                            <label>Nuevo estado</label>
                            <select
                              value={estadoNuevoSolicitud}
                              onChange={(e) =>
                                setEstadoNuevoSolicitud(e.target.value)
                              }
                            >
                              {[
                                "REGISTRADA",
                                "EN_REVISION",
                                "ASIGNADA",
                                "EN_PROCESO",
                                "FINALIZADA",
                                "CANCELADA",
                              ].map((e) => (
                                <option key={e} value={e}>
                                  {e}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-row-pro">
                            <label>Comentario</label>
                            <textarea
                              placeholder="Describe el cambio de estado..."
                              value={comentarioEstado}
                              onChange={(e) =>
                                setComentarioEstado(e.target.value)
                              }
                            />
                          </div>
                          <button
                            className="btn-pro success full"
                            type="submit"
                            disabled={cargando}
                          >
                            {cargando
                              ? "Guardando..."
                              : "Guardar cambio de estado"}
                          </button>
                        </form>
                      </>
                    )}
                    <h3 style={{ marginTop: 16 }}>Evidencias</h3>
                    {(!solicitudSeleccionada.adjuntos ||
                      solicitudSeleccionada.adjuntos.length === 0) && (
                      <p className="info-texto">Sin evidencias adjuntas.</p>
                    )}
                    {solicitudSeleccionada.adjuntos?.map((adj) => (
                      <div className="evidencia-item" key={adj.id}>
                        <span>🖼️ {adj.nombreArchivo}</span>
                        <a
                          href={`http://localhost:8081${adj.urlArchivo}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver imagen
                        </a>
                      </div>
                    ))}
                  </div>

                  {(usuarioActual.role === "CLIENTE" ||
                    usuarioActual.role === "TECNICO" ||
                    usuarioActual.role === "ADMIN") && (
                    <div className="cotizaciones-box">
                      <div className="cotizaciones-header">
                        <div>
                          <h3>Cotizaciones</h3>
                          <p>
                            {usuarioActual.role === "TECNICO"
                              ? "Envía tu propuesta económica para esta solicitud."
                              : "Compara propuestas y elige al técnico que atenderá el servicio."}
                          </p>
                        </div>
                        <span className="cotizaciones-count">
                          {cotizaciones.length}
                        </span>
                      </div>

                      {usuarioActual.role === "TECNICO" &&
                        ["REGISTRADA", "EN_REVISION"].includes(
                          solicitudSeleccionada.estado,
                        ) && (
                          <form
                            className="cotizacion-form"
                            onSubmit={enviarCotizacion}
                          >
                            <div className="form-row-pro">
                              <label>Precio estimado (S/)</label>
                              <input
                                type="number"
                                min="1"
                                max="10000"
                                value={cotizacionForm.precio}
                                onChange={(e) =>
                                  setCotizacionForm({
                                    ...cotizacionForm,
                                    precio: e.target.value,
                                  })
                                }
                                placeholder="Ej. 120"
                              />
                            </div>
                            <div className="form-row-pro">
                              <label>Tiempo estimado (horas)</label>
                              <input
                                type="number"
                                min="1"
                                max="168"
                                value={cotizacionForm.tiempoHoras}
                                onChange={(e) =>
                                  setCotizacionForm({
                                    ...cotizacionForm,
                                    tiempoHoras: e.target.value,
                                  })
                                }
                                placeholder="Ej. 24"
                              />
                            </div>
                            <button
                              className="btn-pro primary full"
                              type="submit"
                              disabled={enviandoCotizacion}
                            >
                              {enviandoCotizacion
                                ? "Enviando..."
                                : "Enviar cotizacion"}
                            </button>
                          </form>
                        )}

                      {cotizaciones.length === 0 ? (
                        <div className="cotizaciones-empty">
                          Sin cotizaciones disponibles.
                        </div>
                      ) : (
                        <div className="cotizaciones-list">
                          {cotizaciones.map((cot) => (
                            <div className="cotizacion-card" key={cot.id}>
                              <div>
                                <strong>{cot.tecnicoNombre}</strong>
                                <span
                                  className={`estado-badge estado-${cot.estado}`}
                                >
                                  {cot.estado}
                                </span>
                              </div>
                              <div className="cotizacion-meta">
                                <span>S/ {cot.precio}</span>
                                <span>{cot.tiempoHoras} h</span>
                                <span>
                                  Vence:{" "}
                                  {cot.fechaExpiracion
                                    ? new Date(
                                        cot.fechaExpiracion,
                                      ).toLocaleString()
                                    : "-"}
                                </span>
                              </div>
                              {usuarioActual.role === "CLIENTE" &&
                                cot.estado === "ACTIVA" &&
                                ["REGISTRADA", "EN_REVISION"].includes(
                                  solicitudSeleccionada.estado,
                                ) && (
                                  <button
                                    className="btn-pro success full"
                                    type="button"
                                    onClick={() => aceptarCotizacion(cot.id)}
                                  >
                                    Aceptar cotizacion
                                  </button>
                                )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CHAT */}
                  <div className="chat-box">
                    <div className="chat-header">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <h3>Chat con el técnico</h3>
                      <button
                        type="button"
                        className="chat-refresh"
                        onClick={() => cargarChat(solicitudSeleccionada.id)}
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="23,4 23,10 17,10" />
                          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                      </button>
                    </div>
                    <div className="chat-messages">
                      {chatMensajes.length === 0 && (
                        <div className="chat-empty">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--text3)"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ marginBottom: 8 }}
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <p style={{ fontWeight: 600, color: "var(--text2)" }}>
                            Sin mensajes aún
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "var(--text3)",
                              marginTop: 4,
                            }}
                          >
                            Escribe abajo para comunicarte con el técnico o
                            admin asignado a esta solicitud.
                          </p>
                        </div>
                      )}
                      {chatMensajes.map((msg) => {
                        const esPropio =
                          msg.remitenteNombre === usuarioActual.name;
                        return (
                          <div
                            key={msg.id}
                            className={`chat-msg ${esPropio ? "chat-msg-own" : "chat-msg-other"}`}
                          >
                            {!esPropio && (
                              <div className="chat-msg-author">
                                {msg.remitenteNombre} · {msg.remitenteRol}
                              </div>
                            )}
                            <div className="chat-bubble">{msg.contenido}</div>
                            <div className="chat-time">
                              {msg.fechaEnvio
                                ? new Date(msg.fechaEnvio).toLocaleTimeString(
                                    [],
                                    { hour: "2-digit", minute: "2-digit" },
                                  )
                                : ""}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="chat-input-area">
                      <input
                        type="text"
                        placeholder="Escribe al técnico o admin..."
                        autoFocus
                        value={chatTexto}
                        onChange={(e) => setChatTexto(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            enviarMensajeChat();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={enviarMensajeChat}
                        disabled={chatCargando || !chatTexto.trim()}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22,2 15,22 11,13 2,9" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ══ USUARIOS ADMIN ══ */}
          {vistaDashboard === "usuariosAdmin" &&
            usuarioActual.role === "ADMIN" && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Administración</span>
                    <h1>Gestión de usuarios</h1>
                    <p>Visualiza, activa, desactiva o banea cuentas.</p>
                  </div>
                  <button
                    className="btn-pro primary"
                    type="button"
                    onClick={() => cargarUsuariosAdmin()}
                  >
                    Actualizar
                  </button>
                </div>
                <div className="search-panel-pro admin-users-filter">
                  <div className="form-row-pro">
                    <label>Buscar</label>
                    <input
                      type="text"
                      placeholder="Nombre, correo, DNI..."
                      value={filtroUsuarioAdmin}
                      onChange={(e) => setFiltroUsuarioAdmin(e.target.value)}
                    />
                  </div>
                  <div className="form-row-pro">
                    <label>Rol</label>
                    <select
                      value={filtroRolAdmin}
                      onChange={(e) => setFiltroRolAdmin(e.target.value)}
                    >
                      <option value="TODOS">Todos</option>
                      <option value="CLIENTE">Clientes</option>
                      <option value="TECNICO">Técnicos</option>
                      <option value="ADMIN">Admins</option>
                    </select>
                  </div>
                  <div className="form-row-pro">
                    <label>Estado</label>
                    <select
                      value={filtroEstadoAdmin}
                      onChange={(e) => setFiltroEstadoAdmin(e.target.value)}
                    >
                      <option value="TODOS">Todos</option>
                      <option value="APROBADO">Activo</option>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="INACTIVO">Inactivo</option>
                      <option value="BANEADO">Baneado</option>
                    </select>
                  </div>
                  <button
                    className="btn-pro primary"
                    type="button"
                    onClick={() =>
                      cargarUsuariosAdmin(
                        filtroRolAdmin,
                        filtroEstadoAdmin,
                        filtroUsuarioAdmin,
                      )
                    }
                  >
                    Filtrar
                  </button>
                </div>
                <div className="users-table-pro">
                  {usuariosAdmin.length === 0 && (
                    <div className="empty-state-pro">
                      <div>👥</div>
                      <h3>Sin usuarios</h3>
                      <p>Cambia los filtros para ver resultados.</p>
                    </div>
                  )}
                  {usuariosAdmin.map((user) => (
                    <div className="user-admin-row" key={user.id}>
                      <div className="user-admin-main">
                        {user.profileImageUrl ? (
                          <img
                            className="avatar-img"
                            src={user.profileImageUrl}
                            alt="Usuario"
                          />
                        ) : (
                          <div className="avatar-user">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3>{user.name}</h3>
                          <p>{user.email}</p>
                          <small>
                            DNI: {user.dni} | Tel: {user.phone}
                          </small>
                        </div>
                      </div>
                      <div className="user-admin-tags">
                        <span>{user.role}</span>
                        <span
                          className={`estado-badge estado-${user.accountStatus}`}
                        >
                          {user.accountStatus}
                        </span>
                      </div>
                      <div className="user-admin-actions">
                        <button
                          className="btn-pro secondary"
                          type="button"
                          onClick={() => verPerfilUsuarioAdmin(user.id)}
                        >
                          Ver perfil
                        </button>
                        <button
                          className="btn-pro success"
                          type="button"
                          onClick={() =>
                            cambiarEstadoUsuarioAdmin(user.id, "APROBADO")
                          }
                        >
                          Activar
                        </button>
                        <button
                          className="btn-pro secondary"
                          type="button"
                          onClick={() =>
                            cambiarEstadoUsuarioAdmin(user.id, "INACTIVO")
                          }
                        >
                          Desactivar
                        </button>
                        <button
                          className="btn-pro danger"
                          type="button"
                          onClick={() =>
                            cambiarEstadoUsuarioAdmin(
                              user.id,
                              "BANEADO",
                              "¿Banear esta cuenta?",
                            )
                          }
                        >
                          Banear
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* ══ DETALLE USUARIO ADMIN ══ */}
          {vistaDashboard === "detalleUsuarioAdmin" &&
            usuarioActual.role === "ADMIN" &&
            usuarioAdminSeleccionado && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Perfil de usuario</span>
                    <h1>{usuarioAdminSeleccionado.name}</h1>
                  </div>
                  <button
                    className="btn-pro secondary"
                    type="button"
                    onClick={() => setVistaDashboard("usuariosAdmin")}
                  >
                    ← Volver
                  </button>
                </div>
                <div className="profile-layout">
                  <div className="profile-summary">
                    {usuarioAdminSeleccionado.profileImageUrl ? (
                      <img
                        className="profile-photo-large"
                        src={usuarioAdminSeleccionado.profileImageUrl}
                        alt="Usuario"
                      />
                    ) : (
                      <div className="profile-avatar-large">
                        {usuarioAdminSeleccionado.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h3>{usuarioAdminSeleccionado.name}</h3>
                    <p>{usuarioAdminSeleccionado.email}</p>
                    <div className="profile-info-list">
                      <div>
                        <span>DNI</span>
                        <strong>{usuarioAdminSeleccionado.dni}</strong>
                      </div>
                      <div>
                        <span>Teléfono</span>
                        <strong>{usuarioAdminSeleccionado.phone}</strong>
                      </div>
                      <div>
                        <span>Rol</span>
                        <strong>{usuarioAdminSeleccionado.role}</strong>
                      </div>
                      <div>
                        <span>Estado</span>
                        <strong>
                          {usuarioAdminSeleccionado.accountStatus}
                        </strong>
                      </div>
                      <div>
                        <span>Especialidades</span>
                        <strong>
                          {usuarioAdminSeleccionado.specialties || "—"}
                        </strong>
                      </div>
                      <div>
                        <span>Zona</span>
                        <strong>
                          {usuarioAdminSeleccionado.serviceZone || "—"}
                        </strong>
                      </div>
                    </div>
                  </div>
                  <div className="profile-form">
                    <h3>Acciones administrativas</h3>
                    <button
                      className="btn-pro success full"
                      type="button"
                      onClick={() =>
                        cambiarEstadoUsuarioAdmin(
                          usuarioAdminSeleccionado.id,
                          "APROBADO",
                        )
                      }
                    >
                      Activar cuenta
                    </button>
                    <button
                      className="btn-pro secondary full danger-margin"
                      type="button"
                      onClick={() =>
                        cambiarEstadoUsuarioAdmin(
                          usuarioAdminSeleccionado.id,
                          "INACTIVO",
                        )
                      }
                    >
                      Desactivar cuenta
                    </button>
                    <button
                      className="btn-pro danger full danger-margin"
                      type="button"
                      onClick={() =>
                        cambiarEstadoUsuarioAdmin(
                          usuarioAdminSeleccionado.id,
                          "BANEADO",
                          "¿Banear esta cuenta?",
                        )
                      }
                    >
                      Banear cuenta
                    </button>
                    <button
                      className="btn-pro danger full danger-margin"
                      type="button"
                      onClick={() =>
                        cambiarEstadoUsuarioAdmin(
                          usuarioAdminSeleccionado.id,
                          "ELIMINADO",
                          "¿Eliminar esta cuenta?",
                        )
                      }
                    >
                      Eliminar cuenta
                    </button>
                  </div>
                </div>
              </section>
            )}

          {/* ══ PENDIENTES ══ */}
          {vistaDashboard === "pendientes" &&
            usuarioActual.role === "ADMIN" && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Revisión</span>
                    <h1>Técnicos pendientes</h1>
                    <p>
                      Aprueba o rechaza solicitudes de técnicos registrados.
                    </p>
                  </div>
                  <button
                    className="btn-pro primary"
                    type="button"
                    onClick={cargarTecnicosPendientes}
                  >
                    Actualizar
                  </button>
                </div>
                <div className="technicians-grid-pro">
                  {tecnicosPendientes.length === 0 && (
                    <div className="empty-state-pro">
                      <div>✅</div>
                      <h3>Sin pendientes</h3>
                      <p>Cuando un técnico se registre aparecerá aquí.</p>
                    </div>
                  )}
                  {tecnicosPendientes.map((tecnico) => (
                    <div className="technician-pro-card" key={tecnico.id}>
                      <div className="technician-head">
                        <div className="avatar-tech">
                          {tecnico.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3>{tecnico.name}</h3>
                          <span
                            style={{
                              color: "var(--amber)",
                              fontWeight: 700,
                              fontSize: 12,
                            }}
                          >
                            Pendiente
                          </span>
                        </div>
                      </div>
                      <div className="tech-info">
                        <p>
                          <strong>DNI:</strong> {tecnico.dni}
                        </p>
                        <p>
                          <strong>Correo:</strong> {tecnico.email}
                        </p>
                        <p>
                          <strong>Teléfono:</strong> {tecnico.phone}
                        </p>
                        <p>
                          <strong>Especialidades:</strong> {tecnico.specialties}
                        </p>
                        <p>
                          <strong>Zona:</strong> {tecnico.serviceZone}
                        </p>
                      </div>
                      <div className="approval-actions">
                        <button
                          className="btn-pro success"
                          type="button"
                          onClick={() => aprobarTecnico(tecnico.id)}
                        >
                          Aprobar
                        </button>
                        <button
                          className="btn-pro danger"
                          type="button"
                          onClick={() => rechazarTecnico(tecnico.id)}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* TOAST */}
          {mensaje && (
            <div
              className={
                tipoMensaje === "exito" ? "mensaje exito" : "mensaje error"
              }
              style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                maxWidth: 380,
                zIndex: 9999,
              }}
            >
              {mensaje}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="pagina auth-page">
      <div className="app-shell">
        <main className="auth-panel">
          <div className="brand-mini">
            <div className="brand-badge">IF</div>

            <div className="brand-text">
              <h1>IntiFix</h1>
              <p>Plataforma de servicios técnicos</p>
            </div>
          </div>

          <div className="auth-header">
            <div>
              <span className="eyebrow">
                {modo === "registro"
                  ? `Paso ${step} de ${totalSteps}`
                  : modo === "recuperacion"
                    ? `Recuperación paso ${recoveryStep}`
                    : "Acceso seguro"}
              </span>

              <h2>
                {modo === "registro"
                  ? "Crear cuenta"
                  : modo === "recuperacion"
                    ? "Recuperar contraseña"
                    : "Iniciar sesión"}
              </h2>

              {modo === "recuperacion" && (
                <button
                  type="button"
                  className="back-link"
                  onClick={() => cambiarModo("login")}
                >
                  ← Volver al login
                </button>
              )}
            </div>

            <div className="status-pill">
              <span></span>
              Seguro
            </div>
          </div>

          {modo !== "recuperacion" && (
            <div className="tabs solo-dos">
              <button
                type="button"
                className={modo === "registro" ? "tab activo" : "tab"}
                onClick={() => cambiarModo("registro")}
              >
                Registro
              </button>

              <button
                type="button"
                className={modo === "login" ? "tab activo" : "tab"}
                onClick={() => cambiarModo("login")}
              >
                Login
              </button>
            </div>
          )}

          {modo === "registro" && (
            <div className="formulario">
              {step === 1 && (
                <div className="step-content">
                  <div className="step-title">
                    <h3>Elige tu tipo de cuenta</h3>
                    <p>Selecciona cómo usarás IntiFix.</p>
                  </div>

                  <div className="role-cards">
                    <button
                      type="button"
                      className={
                        formData.role === "CLIENTE"
                          ? "role-card selected"
                          : "role-card"
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          role: "CLIENTE",
                          specialties: [],
                          locationType: "LIMA",
                          serviceZone: "",
                          provinceRegion: "",
                          provinceName: "",
                          provinceDistrict: "",
                          availability: [],
                        })
                      }
                    >
                      <div className="role-icon">👤</div>

                      <h4>Cliente</h4>

                      <p>Quiero solicitar servicios técnicos.</p>
                    </button>

                    <button
                      type="button"
                      className={
                        formData.role === "TECNICO"
                          ? "role-card selected"
                          : "role-card"
                      }
                      onClick={() =>
                        setFormData({ ...formData, role: "TECNICO" })
                      }
                    >
                      <div className="role-icon">🛠</div>

                      <h4>Técnico</h4>

                      <p>Quiero ofrecer mis servicios.</p>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="step-content">
                  <div className="step-title">
                    <h3>Datos personales</h3>
                    <p>Validaremos tus datos antes de enviar el código.</p>
                  </div>

                  <div className="form-grid">
                    <div className="grupo full">
                      <label>Nombre completo</label>

                      <input
                        type="text"
                        name="name"
                        placeholder="Ejemplo: Carlos Carbajal"
                        value={formData.name}
                        onChange={manejarCambio}
                      />
                    </div>

                    <div className="grupo">
                      <label>DNI</label>

                      <input
                        type="text"
                        name="dni"
                        placeholder="8 dígitos"
                        value={formData.dni}
                        onChange={manejarCambio}
                        maxLength="8"
                      />

                      {dniEstado.texto && (
                        <small className={estadoClass(dniEstado.tipo)}>
                          {dniEstado.tipo === "exito" ? "✓ " : "✕ "}
                          {dniEstado.texto}
                        </small>
                      )}
                    </div>

                    <div className="grupo">
                      <label>Teléfono</label>

                      <input
                        type="text"
                        name="phone"
                        placeholder="Ejemplo: 987654321"
                        value={formData.phone}
                        onChange={manejarCambio}
                        maxLength="9"
                      />

                      {phoneEstado.texto && (
                        <small className={estadoClass(phoneEstado.tipo)}>
                          {phoneEstado.tipo === "exito" ? "✓ " : "✕ "}
                          {phoneEstado.texto}
                        </small>
                      )}
                    </div>

                    <div className="grupo full">
                      <label>Correo electrónico</label>

                      <input
                        type="email"
                        name="email"
                        placeholder="ejemplo@gmail.com"
                        value={formData.email}
                        onChange={manejarCambio}
                      />

                      {emailEstado.texto && (
                        <small className={estadoClass(emailEstado.tipo)}>
                          {emailEstado.tipo === "exito" ? "✓ " : "✕ "}
                          {emailEstado.texto}
                        </small>
                      )}
                    </div>

                    <div className="grupo full">
                      <label>Crear contraseña</label>

                      <input
                        type="password"
                        name="password"
                        placeholder="Ingresa tu contraseña"
                        value={formData.password}
                        onChange={manejarCambio}
                      />

                      <small className={ayudaPasswordClass(formData.password)}>
                        {ayudaPasswordTexto(formData.password)}
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="step-content">
                  <div className="step-title">
                    <h3>Método de verificación</h3>
                    <p>Elige dónde deseas recibir tu código.</p>
                  </div>

                  <div className="verification-cards">
                    <button
                      type="button"
                      className={
                        formData.verificationMethod === "EMAIL"
                          ? "verify-card selected"
                          : "verify-card"
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          verificationMethod: "EMAIL",
                        })
                      }
                    >
                      <div className="verify-icon">✉</div>

                      <h4>Correo electrónico</h4>

                      <p>
                        Recibirás el código en {formData.email || "tu correo"}.
                      </p>
                    </button>

                    <button
                      type="button"
                      className={
                        formData.verificationMethod === "SMS"
                          ? "verify-card selected"
                          : "verify-card"
                      }
                      onClick={() =>
                        setFormData({
                          ...formData,
                          verificationMethod: "SMS",
                        })
                      }
                    >
                      <div className="verify-icon">📱</div>

                      <h4>SMS</h4>

                      <p>Modo prueba: el código aparece en la consola.</p>
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && formData.role === "TECNICO" && (
                <div className="step-content">
                  <div className="step-title">
                    <h3>Perfil técnico</h3>
                    <p>Selecciona tus servicios sin llenar textos largos.</p>
                  </div>

                  <div className="wizard-section">
                    <label className="section-label">Especialidades</label>

                    <div className="chip-grid">
                      {SPECIALTIES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={
                            formData.specialties.includes(item)
                              ? "chip selected"
                              : "chip"
                          }
                          onClick={() => toggleArrayItem("specialties", item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="wizard-section">
                    <label className="section-label">
                      Ubicación de atención
                    </label>

                    <div className="location-switch">
                      <button
                        type="button"
                        className={
                          formData.locationType === "LIMA"
                            ? "switch-btn selected"
                            : "switch-btn"
                        }
                        onClick={() =>
                          setFormData({
                            ...formData,
                            locationType: "LIMA",
                            provinceRegion: "",
                            provinceName: "",
                            provinceDistrict: "",
                          })
                        }
                      >
                        Lima Metropolitana
                      </button>

                      <button
                        type="button"
                        className={
                          formData.locationType === "PROVINCIA"
                            ? "switch-btn selected"
                            : "switch-btn"
                        }
                        onClick={() =>
                          setFormData({
                            ...formData,
                            locationType: "PROVINCIA",
                            serviceZone: "",
                          })
                        }
                      >
                        Provincia
                      </button>
                    </div>

                    {formData.locationType === "LIMA" && (
                      <div className="form-grid province-grid">
                        <div className="grupo">
                          <label>Región</label>

                          <input
                            type="text"
                            value="Lima"
                            disabled
                            className="input-disabled"
                          />
                        </div>

                        <div className="grupo">
                          <label>Provincia</label>

                          <input
                            type="text"
                            value="Lima Metropolitana"
                            disabled
                            className="input-disabled"
                          />
                        </div>

                        <div className="grupo full">
                          <label>Distrito</label>

                          <input
                            type="text"
                            name="serviceZone"
                            placeholder="Ejemplo: Los Olivos"
                            value={formData.serviceZone}
                            onChange={manejarCambio}
                          />
                        </div>
                      </div>
                    )}

                    {formData.locationType === "PROVINCIA" && (
                      <div className="form-grid province-grid">
                        <div className="grupo">
                          <label>Región</label>

                          <input
                            type="text"
                            name="provinceRegion"
                            placeholder="Ejemplo: Cusco"
                            value={formData.provinceRegion}
                            onChange={manejarCambio}
                          />
                        </div>

                        <div className="grupo">
                          <label>Provincia</label>

                          <input
                            type="text"
                            name="provinceName"
                            placeholder="Ejemplo: Cusco"
                            value={formData.provinceName}
                            onChange={manejarCambio}
                          />
                        </div>

                        <div className="grupo full">
                          <label>Distrito</label>

                          <input
                            type="text"
                            name="provinceDistrict"
                            placeholder="Ejemplo: Wanchaq"
                            value={formData.provinceDistrict}
                            onChange={manejarCambio}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="wizard-section">
                    <label className="section-label">Disponibilidad</label>

                    <div className="chip-grid">
                      {AVAILABILITY.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={
                            formData.availability.includes(item)
                              ? "chip selected"
                              : "chip"
                          }
                          onClick={() => toggleArrayItem("availability", item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="wizard-actions">
                {step > 1 && (
                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={pasoAnterior}
                    disabled={cargando}
                  >
                    Atrás
                  </button>
                )}

                <button
                  type="button"
                  className="boton-principal"
                  onClick={siguientePaso}
                  disabled={cargando}
                >
                  {cargando
                    ? "Procesando..."
                    : formData.role === "CLIENTE" && step === 3
                      ? "Enviar código"
                      : formData.role === "TECNICO" && step === 4
                        ? "Enviar solicitud y código"
                        : "Continuar"}
                </button>
              </div>
            </div>
          )}

          {modo === "login" && (
            <form className="formulario" onSubmit={iniciarSesion}>
              <div className="step-title">
                <h3>Accede a tu cuenta</h3>

                <p>Clientes y técnicos aprobados pueden ingresar.</p>
              </div>

              <div className="grupo">
                <label>Correo electrónico</label>

                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@gmail.com"
                  value={formData.email}
                  onChange={manejarCambio}
                  required
                />
              </div>

              <div className="grupo">
                <label>Contraseña</label>

                <input
                  type="password"
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={manejarCambio}
                  required
                />
              </div>

              <button
                className="boton-principal"
                type="submit"
                disabled={cargando}
              >
                {cargando ? "Ingresando..." : "Ingresar"}
              </button>

              <button
                type="button"
                className="boton-secundario"
                onClick={reactivarCuenta}
                disabled={cargando}
              >
                Reactivar cuenta
              </button>

              <button
                type="button"
                className="link-recuperacion"
                onClick={irARecuperacion}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
          )}

          {modo === "recuperacion" && (
            <div className="formulario recovery-box">
              {recoveryStep === 1 && (
                <form onSubmit={solicitarCodigoRecuperacion}>
                  <div className="step-title">
                    <h3>Solicita tu código</h3>

                    <p>
                      Ingresa tu correo registrado. Te enviaremos un código de 6
                      dígitos para cambiar tu contraseña.
                    </p>
                  </div>

                  <div className="grupo">
                    <label>Correo electrónico</label>

                    <input
                      type="email"
                      name="email"
                      placeholder="ejemplo@gmail.com"
                      value={formData.email}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <button
                    className="boton-principal"
                    type="submit"
                    disabled={cargando}
                  >
                    {cargando ? "Enviando..." : "Enviar código"}
                  </button>
                </form>
              )}

              {recoveryStep === 2 && (
                <form onSubmit={validarCodigoRecuperacion}>
                  <div className="step-title">
                    <h3>Valida el código</h3>

                    <p>Revisa tu correo e ingresa el código recibido.</p>
                  </div>

                  <div className="grupo">
                    <label>Código de recuperación</label>

                    <input
                      className="codigo-input inline-code"
                      type="text"
                      name="recoveryCode"
                      placeholder="000000"
                      value={formData.recoveryCode}
                      onChange={manejarCambio}
                      maxLength="6"
                      required
                    />
                  </div>

                  <button
                    className="boton-principal"
                    type="submit"
                    disabled={cargando}
                  >
                    {cargando ? "Validando..." : "Validar código"}
                  </button>

                  <button
                    className="boton-secundario"
                    type="button"
                    onClick={solicitarCodigoRecuperacion}
                    disabled={cargando}
                  >
                    Reenviar código
                  </button>
                </form>
              )}

              {recoveryStep === 3 && (
                <form onSubmit={cambiarPasswordRecuperacion}>
                  <div className="step-title">
                    <h3>Crea una nueva contraseña</h3>

                    <p>La nueva contraseña debe tener mínimo 6 caracteres.</p>
                  </div>

                  <div className="grupo">
                    <label>Nueva contraseña</label>

                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Ingresa tu nueva contraseña"
                      value={formData.newPassword}
                      onChange={manejarCambio}
                      required
                    />

                    <small className={ayudaPasswordClass(formData.newPassword)}>
                      {ayudaPasswordTexto(formData.newPassword)}
                    </small>
                  </div>

                  <div className="grupo">
                    <label>Confirmar contraseña</label>

                    <input
                      type="password"
                      name="confirmNewPassword"
                      placeholder="Repite la nueva contraseña"
                      value={formData.confirmNewPassword}
                      onChange={manejarCambio}
                      required
                    />
                  </div>

                  <button
                    className="boton-principal"
                    type="submit"
                    disabled={cargando}
                  >
                    {cargando ? "Actualizando..." : "Cambiar contraseña"}
                  </button>
                </form>
              )}

              {recoveryStep === 4 && (
                <div className="recovery-final">
                  <div className="success-badge">✓</div>

                  <h3>Contraseña actualizada</h3>

                  <p>Ahora puedes iniciar sesión usando tu nueva contraseña.</p>

                  <button
                    className="boton-principal"
                    type="button"
                    onClick={() => cambiarModo("login")}
                  >
                    Ir al login
                  </button>
                </div>
              )}
            </div>
          )}

          {mensaje && (
            <div
              className={
                tipoMensaje === "exito" ? "mensaje exito" : "mensaje error"
              }
            >
              {mensaje}
            </div>
          )}
        </main>
      </div>

      {modalCodigo && (
        <div className="modal-fondo">
          <div className="modal">
            <div className="modal-icono">
              {formData.verificationMethod === "EMAIL" ? "✉" : "📱"}
            </div>

            <h2>Verificación de cuenta</h2>

            <p>
              {formData.verificationMethod === "EMAIL"
                ? "Enviamos un código de 6 dígitos a tu correo."
                : "SMS está en modo prueba. Revisa la consola del backend para ver el código."}
            </p>

            <p className="modal-destination">
              {formData.verificationMethod === "EMAIL"
                ? formData.email
                : formData.phone}
            </p>

            <div
              className={
                segundosRestantes === 0
                  ? "temporizador vencido"
                  : "temporizador"
              }
            >
              {segundosRestantes === 0
                ? "Código vencido"
                : `Tiempo restante: ${minutos}:${segundos
                    .toString()
                    .padStart(2, "0")}`}
            </div>

            <input
              className="codigo-input"
              type="text"
              name="code"
              placeholder="000000"
              value={formData.code}
              onChange={manejarCambio}
              maxLength="6"
            />

            {segundosRestantes === 0 && (
              <p className="error-texto texto-centro">
                El código venció. Puedes solicitar uno nuevo.
              </p>
            )}

            <button
              className="boton-principal"
              type="button"
              onClick={confirmarCodigo}
              disabled={cargando || segundosRestantes === 0}
            >
              {cargando ? "Verificando..." : "Confirmar registro"}
            </button>

            <button
              className="boton-secundario"
              type="button"
              onClick={reenviarCodigo}
              disabled={cargando}
            >
              {segundosRestantes === 0
                ? "Enviar nuevo código"
                : "Reenviar código"}
            </button>

            <button
              className="boton-cerrar"
              type="button"
              onClick={() => setModalCodigo(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
