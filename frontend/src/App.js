import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8081/api/auth";
const ADMIN_URL = "http://localhost:8081/api/admin";
const PROFILE_URL = "http://localhost:8081/api/profile";
const TECHNICIANS_URL = "http://localhost:8081/api/technicians";
const SOLICITUDES_URL = "http://localhost:8081/api/solicitudes";
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
  const [usuarioAdminSeleccionado, setUsuarioAdminSeleccionado] = useState(null);
  const [filtroUsuarioAdmin, setFiltroUsuarioAdmin] = useState("");
  const [filtroRolAdmin, setFiltroRolAdmin] = useState("TODOS");
  const [filtroEstadoAdmin, setFiltroEstadoAdmin] = useState("TODOS");

  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState("TODOS");
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const [resultadoSeguimiento, setResultadoSeguimiento] = useState(null);
  const [estadoNuevoSolicitud, setEstadoNuevoSolicitud] = useState("EN_REVISION");
  const [comentarioEstado, setComentarioEstado] = useState("");

  const [solicitudForm, setSolicitudForm] = useState({
    equipo: "",
    titulo: "",
    descripcion: "",
    modalidad: "TALLER",
    direccion: "",
  });

  const [emailEstado, setEmailEstado] = useState({ texto: "", tipo: "" });
  const [dniEstado, setDniEstado] = useState({ texto: "", tipo: "" });
  const [phoneEstado, setPhoneEstado] = useState({ texto: "", tipo: "" });

  const [modalCodigo, setModalCodigo] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(CODE_SECONDS);

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
        `${API_URL}/check-email?email=${encodeURIComponent(email)}`
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
          : { texto: "Correo disponible.", tipo: "exito" }
      );
    } catch {
      setEmailEstado({
        texto: "No se pudo validar el correo. Revisa si el backend está encendido.",
        tipo: "error",
      });
    }
  };

  const validarDniDisponible = async (dni) => {
    try {
      setDniEstado({ texto: "Validando DNI...", tipo: "validando" });

      const respuesta = await fetch(
        `${API_URL}/check-dni?dni=${encodeURIComponent(dni)}`
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
          : { texto: "DNI disponible.", tipo: "exito" }
      );
    } catch {
      setDniEstado({
        texto: "No se pudo validar el DNI. Revisa si el backend está encendido.",
        tipo: "error",
      });
    }
  };

  const validarPhoneDisponible = async (phone) => {
    try {
      setPhoneEstado({ texto: "Validando teléfono...", tipo: "validando" });

      const respuesta = await fetch(
        `${API_URL}/check-phone?phone=${encodeURIComponent(phone)}`
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
          : { texto: "Teléfono disponible.", tipo: "exito" }
      );
    } catch {
      setPhoneEstado({
        texto: "No se pudo validar el teléfono. Revisa si el backend está encendido.",
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

      if (dniEstado.tipo !== "exito") {
        throw new Error(dniEstado.texto || "Espera la validación del DNI.");
      }

      if (!formData.email.includes("@")) {
        throw new Error("Ingresa un correo válido.");
      }

      if (emailEstado.tipo !== "exito") {
        throw new Error(emailEstado.texto || "Espera la validación del correo.");
      }

      if (!/^9[0-9]{8}$/.test(formData.phone)) {
        throw new Error("El teléfono debe tener 9 dígitos y empezar con 9.");
      }

      if (phoneEstado.tipo !== "exito") {
        throw new Error(phoneEstado.texto || "Espera la validación del teléfono.");
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
        "exito"
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
          typeof data === "string" ? data : "No se pudo cargar el perfil."
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
          typeof data === "string" ? data : "No se pudo actualizar el perfil."
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
      "¿Seguro que deseas desactivar tu cuenta? Se cerrará tu sesión automáticamente."
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
          typeof data === "string" ? data : "No se pudo desactivar la cuenta."
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

      const respuesta = await fetch(`${SOLICITUDES_URL}/mis-solicitudes${query}`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudieron cargar las solicitudes."
        );
      }

      setSolicitudes(Array.isArray(data) ? data : []);
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
          typeof data === "string" ? data : "No se pudieron cargar las solicitudes."
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
        throw new Error("La dirección es obligatoria para atención a domicilio.");
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
        }),
      });

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo registrar la solicitud."
        );
      }

      mostrarMensaje(
        `✅ Solicitud registrada correctamente. Código: ${data.codigo}`,
        "exito"
      );

      setSolicitudForm({
        equipo: "",
        titulo: "",
        descripcion: "",
        modalidad: "TALLER",
        direccion: "",
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
          typeof data === "string" ? data : "No se pudo cargar el detalle."
        );
      }

      setSolicitudSeleccionada(data);
      setEstadoNuevoSolicitud(data.estado || "EN_REVISION");
      setComentarioEstado("");
      setVistaDashboard("detalleSolicitud");
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
        }
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo subir la evidencia."
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
        `${SOLICITUDES_URL}/codigo/${codigoSeguimiento.trim().toUpperCase()}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
          },
        }
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se encontró la solicitud."
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
        }
      );

      const data = await leerRespuesta(respuesta);

      if (!respuesta.ok) {
        throw new Error(
          typeof data === "string" ? data : "No se pudo actualizar el estado."
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
          typeof data === "string" ? data : "No se pudo reactivar la cuenta."
        );
      }

      mostrarMensaje(
        "✅ Cuenta reactivada correctamente. Ahora inicia sesión.",
        "exito"
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
    busqueda = filtroUsuarioAdmin
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
        throw new Error(typeof data === "string" ? data : "No se pudieron cargar los usuarios.");
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
        throw new Error(typeof data === "string" ? data : "No se pudo cargar el usuario.");
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
        throw new Error(typeof data === "string" ? data : "No se pudo actualizar el usuario.");
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
    setTecnicoSeleccionado(tecnico);
    setVistaDashboard("detalleTecnico");
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
    const inicialUsuario = usuarioActual.name
      ? usuarioActual.name.charAt(0).toUpperCase()
      : "U";

    return (
      <div className="dashboard-layout">
        <aside className="sidebar-pro">
          <div className="sidebar-logo">
            <div className="logo-icon">IF</div>

            <div>
              <h1>IntiFix</h1>
              <p>Servicios técnicos</p>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button
              className={vistaDashboard === "inicio" ? "active" : ""}
              onClick={() => setVistaDashboard("inicio")}
            >
              <span>🏠</span>
              Inicio
            </button>

            <button
              className={vistaDashboard === "perfil" ? "active" : ""}
              onClick={() => {
                setVistaDashboard("perfil");
                cargarPerfil();
              }}
            >
              <span>👤</span>
              Mi perfil
            </button>

            {usuarioActual.role === "CLIENTE" && (
              <button
                className={vistaDashboard === "tecnicos" ? "active" : ""}
                onClick={() => {
                  setVistaDashboard("tecnicos");
                  cargarTecnicosAprobados();
                }}
              >
                <span>🛠️</span>
                Técnicos
              </button>
            )}

            {usuarioActual.role === "CLIENTE" && (
              <>
                <button
                  className={vistaDashboard === "nuevaSolicitud" ? "active" : ""}
                  onClick={() => setVistaDashboard("nuevaSolicitud")}
                >
                  <span>📝</span>
                  Nueva solicitud
                </button>

                <button
                  className={vistaDashboard === "historial" ? "active" : ""}
                  onClick={() => {
                    setVistaDashboard("historial");
                    cargarMisSolicitudes();
                  }}
                >
                  <span>📋</span>
                  Historial
                </button>

                <button
                  className={vistaDashboard === "seguimiento" ? "active" : ""}
                  onClick={() => setVistaDashboard("seguimiento")}
                >
                  <span>🔎</span>
                  Seguimiento
                </button>
              </>
            )}

            {usuarioActual.role === "TECNICO" && (
              <button
                className={vistaDashboard === "solicitudesGestion" ? "active" : ""}
                onClick={() => {
                  setVistaDashboard("solicitudesGestion");
                  cargarSolicitudesGestion();
                }}
              >
                <span>📋</span>
                Solicitudes
              </button>
            )}

            {usuarioActual.role === "ADMIN" && (
              <button
                className={vistaDashboard === "solicitudesGestion" ? "active" : ""}
                onClick={() => {
                  setVistaDashboard("solicitudesGestion");
                  cargarSolicitudesGestion();
                }}
              >
                <span>📋</span>
                Solicitudes
              </button>
            )}

            {usuarioActual.role === "ADMIN" && (
              <>
                <button
                  className={vistaDashboard === "usuariosAdmin" || vistaDashboard === "detalleUsuarioAdmin" ? "active" : ""}
                  onClick={() => {
                    setVistaDashboard("usuariosAdmin");
                    cargarUsuariosAdmin();
                  }}
                >
                  <span>👥</span>
                  Usuarios
                </button>

                <button
                  className={vistaDashboard === "pendientes" ? "active" : ""}
                  onClick={() => {
                    setVistaDashboard("pendientes");
                    cargarTecnicosPendientes();
                  }}
                >
                  <span>✅</span>
                  Aprobaciones
                </button>
              </>
            )}
          </nav>

          <div className="sidebar-help">
            <span>💡</span>
            <h4>IntiFix Pro</h4>
            <p>Gestiona servicios técnicos de forma ordenada y segura.</p>
          </div>

          <div className="sidebar-footer">
            <button className="logout-side" onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="main-pro">
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
                  <img className="avatar-img" src={perfil.profileImageUrl} alt="Perfil" />
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
                    👤 Mi perfil
                  </button>
                  <button type="button" onClick={cerrarSesion}>
                    🚪 Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </header>

          {vistaDashboard === "inicio" && usuarioActual.role === "CLIENTE" && (
            <section className="content-pro">
              <div className="hero-dashboard">
                <div>
                  <span className="section-badge">Área del cliente</span>
                  <h1>Encuentra técnicos confiables cerca de ti</h1>
                  <p>
                    Revisa técnicos aprobados por IntiFix según especialidad,
                    zona de atención y disponibilidad.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="btn-pro primary"
                      onClick={() => {
                        setVistaDashboard("tecnicos");
                        cargarTecnicosAprobados();
                      }}
                    >
                      Buscar técnicos
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
                  <div className="hero-card-icon">🛠️</div>
                  <h3>Servicio rápido</h3>
                  <p>Técnicos validados y organizados para atención técnica.</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>🧰</span>

                  <div>
                    <h3>{tecnicosAprobados.length}</h3>
                    <p>Técnicos aprobados</p>
                  </div>
                </div>

                <div className="stat-card">
                  <span>📍</span>

                  <div>
                    <h3>Lima</h3>
                    <p>Zona principal</p>
                  </div>
                </div>

                <div className="stat-card">
                  <span>🔒</span>

                  <div>
                    <h3>Seguro</h3>
                    <p>Cuenta verificada</p>
                  </div>
                </div>
              </div>

              <div className="cards-pro-grid">
                <div className="feature-card">
                  <div className="feature-icon">🔎</div>

                  <h3>Registrar reparación</h3>

                  <p>
                    Reporta una falla, elige modalidad de atención y genera un
                    código único para hacer seguimiento.
                  </p>

                  <button
                    className="btn-pro primary"
                    onClick={() => setVistaDashboard("nuevaSolicitud")}
                  >
                    Nueva solicitud
                  </button>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">📋</div>

                  <h3>Mis solicitudes</h3>

                  <p>
                    Revisa tu historial de servicios, evidencias adjuntas y el
                    estado actual de cada reparación.
                  </p>

                  <button
                    className="btn-pro secondary"
                    type="button"
                    onClick={() => {
                      setVistaDashboard("historial");
                      cargarMisSolicitudes();
                    }}
                  >
                    Ver historial
                  </button>
                </div>
              </div>
            </section>
          )}

          {vistaDashboard === "inicio" && usuarioActual.role === "TECNICO" && (
            <section className="content-pro">
              <div className="hero-dashboard">
                <div>
                  <span className="section-badge">Área técnica</span>

                  <h1>Gestiona tu perfil profesional</h1>

                  <p>
                    Mantén actualizadas tus especialidades, zona de atención y
                    disponibilidad para recibir mejores solicitudes.
                  </p>

                  <div className="hero-actions">
                    <button
                      className="btn-pro primary"
                      onClick={() => {
                        setVistaDashboard("perfil");
                        cargarPerfil();
                      }}
                    >
                      Editar perfil técnico
                    </button>
                  </div>
                </div>

                <div className="hero-card">
                  <div className="hero-card-icon">👨‍🔧</div>

                  <h3>Perfil técnico</h3>

                  <p>Actualiza tu información profesional.</p>
                </div>
              </div>

              <div className="cards-pro-grid">
                <div className="feature-card">
                  <div className="feature-icon">🛠️</div>

                  <h3>Servicios disponibles</h3>

                  <p>Consulta solicitudes registradas y actualiza sus estados.</p>

                  <button
                    className="btn-pro primary"
                    type="button"
                    onClick={() => {
                      setVistaDashboard("solicitudesGestion");
                      cargarSolicitudesGestion();
                    }}
                  >
                    Ver solicitudes
                  </button>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">👤</div>

                  <h3>Mi perfil técnico</h3>

                  <p>Actualiza tus datos profesionales dentro de la plataforma.</p>

                  <button
                    className="btn-pro primary"
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

          {vistaDashboard === "inicio" && usuarioActual.role === "ADMIN" && (
            <section className="content-pro">
              <div className="hero-dashboard">
                <div>
                  <span className="section-badge">Administración</span>

                  <h1>Control de técnicos y usuarios</h1>

                  <p>
                    Administra solicitudes de técnicos y valida quién puede operar
                    dentro de IntiFix.
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
                  <div className="hero-card-icon">✅</div>

                  <h3>Validación</h3>

                  <p>Aprueba o rechaza técnicos registrados.</p>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <span>⏳</span>

                  <div>
                    <h3>{tecnicosPendientes.length}</h3>
                    <p>Pendientes</p>
                  </div>
                </div>

                <div className="stat-card">
                  <span>🛡️</span>

                  <div>
                    <h3>Admin</h3>
                    <p>Rol activo</p>
                  </div>
                </div>

                <div className="stat-card">
                  <span>🔐</span>

                  <div>
                    <h3>Seguro</h3>
                    <p>Acceso protegido</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {vistaDashboard === "perfil" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Cuenta</span>
                  <h1>Mi perfil</h1>
                  <p>Actualiza tu información personal, correo, dirección e imagen.</p>
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
                      onChange={(e) => setPerfilForm({ ...perfilForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-row-pro">
                    <label>Correo electrónico</label>
                    <input
                      type="email"
                      value={perfilForm.email}
                      onChange={(e) =>
                        setPerfilForm({ ...perfilForm, email: e.target.value.trim().toLowerCase() })
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
                      placeholder="Ejemplo: Av. Los Olivos 123, Lima"
                      value={perfilForm.address}
                      onChange={(e) => setPerfilForm({ ...perfilForm, address: e.target.value })}
                    />
                  </div>

                  <div className="form-row-pro">
                    <label>Imagen de perfil URL</label>
                    <input
                      type="url"
                      placeholder="https://.../foto.png"
                      value={perfilForm.profileImageUrl}
                      onChange={(e) =>
                        setPerfilForm({ ...perfilForm, profileImageUrl: e.target.value })
                      }
                    />
                    <small className="ayuda-campo info-texto">
                      Pega una URL de imagen. Luego se verá en tu perfil y avatar superior.
                    </small>
                  </div>

                  {usuarioActual.role === "TECNICO" && (
                    <>
                      <div className="form-row-pro">
                        <label>Especialidades</label>
                        <input
                          type="text"
                          value={perfilForm.specialties}
                          onChange={(e) =>
                            setPerfilForm({ ...perfilForm, specialties: e.target.value })
                          }
                        />
                      </div>

                      <div className="form-row-pro">
                        <label>Zona de atención</label>
                        <input
                          type="text"
                          value={perfilForm.serviceZone}
                          onChange={(e) =>
                            setPerfilForm({ ...perfilForm, serviceZone: e.target.value })
                          }
                        />
                      </div>

                      <div className="form-row-pro">
                        <label>Disponibilidad</label>
                        <input
                          type="text"
                          value={perfilForm.availability}
                          onChange={(e) =>
                            setPerfilForm({ ...perfilForm, availability: e.target.value })
                          }
                        />
                      </div>
                    </>
                  )}

                  <button className="btn-pro primary full" type="submit" disabled={cargando}>
                    {cargando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </form>

                <div className="profile-summary">
                  {perfil?.profileImageUrl ? (
                    <img className="profile-photo-large" src={perfil.profileImageUrl} alt="Perfil" />
                  ) : (
                    <div className="profile-avatar-large">{inicialUsuario}</div>
                  )}

                  <h3>{perfil?.name || usuarioActual.name}</h3>
                  <p>{perfil?.email || usuarioActual.email}</p>

                  <div className="profile-info-list">
                    <div>
                      <span>Teléfono</span>
                      <strong>{perfil?.phone || "No registrado"}</strong>
                    </div>
                    <div>
                      <span>Dirección</span>
                      <strong>{perfil?.address || "No registrado"}</strong>
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
                          <strong>{perfil?.specialties || "No registrado"}</strong>
                        </div>
                        <div>
                          <span>Zona</span>
                          <strong>{perfil?.serviceZone || "No registrado"}</strong>
                        </div>
                        <div>
                          <span>Disponibilidad</span>
                          <strong>{perfil?.availability || "No registrado"}</strong>
                        </div>
                      </>
                    )}
                  </div>

                  <button className="btn-pro secondary full" type="button" onClick={() => cargarPerfil()}>
                    Actualizar perfil
                  </button>

                  {usuarioActual.role !== "ADMIN" && (
                    <button
                      className="btn-pro danger full danger-margin"
                      type="button"
                      onClick={eliminarMiCuenta}
                      disabled={cargando}
                    >
                      Eliminar / desactivar mi cuenta
                    </button>
                  )}

                  {usuarioActual.role === "ADMIN" && (
                    <div className="security-note">
                      <strong>Administrador:</strong> Puedes gestionar clientes y técnicos desde el módulo Usuarios.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {vistaDashboard === "tecnicos" && usuarioActual.role === "CLIENTE" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Directorio técnico</span>

                  <h1>Técnicos aprobados</h1>

                  <p>Encuentra técnicos validados según especialidad y zona.</p>
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
                  placeholder="Buscar por nombre, zona, especialidad o disponibilidad..."
                  value={filtroTecnico}
                  onChange={(e) => setFiltroTecnico(e.target.value)}
                />
              </div>

              <div className="technicians-grid-pro">
                {tecnicosFiltrados.length === 0 && (
                  <div className="empty-state-pro">
                    <div>🕓</div>

                    <h3>No hay técnicos aprobados</h3>

                    <p>Cuando el administrador apruebe técnicos, aparecerán aquí.</p>
                  </div>
                )}

                {tecnicosFiltrados.map((tecnico) => (
                  <div className="technician-pro-card" key={tecnico.id}>
                    <div className="technician-head">
                      <div className="avatar-tech">
                        {tecnico.name ? tecnico.name.charAt(0).toUpperCase() : "T"}
                      </div>

                      <div>
                        <h3>{tecnico.name}</h3>
                        <span>Disponible</span>
                      </div>
                    </div>

                    <div className="tech-info">
                      <p>
                        <strong>Correo:</strong> {tecnico.email}
                      </p>

                      <p>
                        <strong>Teléfono:</strong> {tecnico.phone}
                      </p>

                      <p>
                        <strong>Especialidades:</strong>{" "}
                        {tecnico.specialties || "No registrado"}
                      </p>

                      <p>
                        <strong>Zona:</strong>{" "}
                        {tecnico.serviceZone || "No registrado"}
                      </p>

                      <p>
                        <strong>Disponibilidad:</strong>{" "}
                        {tecnico.availability || "No registrado"}
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

          {vistaDashboard === "detalleTecnico" && tecnicoSeleccionado && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Perfil técnico</span>
                  <h1>{tecnicoSeleccionado.name}</h1>
                  <p>Información profesional del técnico seleccionado.</p>
                </div>
                <button className="btn-pro secondary" type="button" onClick={() => setVistaDashboard("tecnicos")}>
                  Volver
                </button>
              </div>

              <div className="profile-layout">
                <div className="profile-summary tecnico-detail-card">
                  {tecnicoSeleccionado.profileImageUrl ? (
                    <img className="profile-photo-large" src={tecnicoSeleccionado.profileImageUrl} alt="Técnico" />
                  ) : (
                    <div className="profile-avatar-large">
                      {tecnicoSeleccionado.name ? tecnicoSeleccionado.name.charAt(0).toUpperCase() : "T"}
                    </div>
                  )}
                  <h3>{tecnicoSeleccionado.name}</h3>
                  <p>{tecnicoSeleccionado.email}</p>

                  <div className="profile-info-list">
                    <div><span>Teléfono</span><strong>{tecnicoSeleccionado.phone || "No registrado"}</strong></div>
                    <div><span>Especialidades</span><strong>{tecnicoSeleccionado.specialties || "No registrado"}</strong></div>
                    <div><span>Zona</span><strong>{tecnicoSeleccionado.serviceZone || "No registrado"}</strong></div>
                    <div><span>Disponibilidad</span><strong>{tecnicoSeleccionado.availability || "No registrado"}</strong></div>
                    <div><span>Dirección</span><strong>{tecnicoSeleccionado.address || "No registrado"}</strong></div>
                  </div>
                </div>

                <div className="profile-form">
                  <h3>Solicitar atención</h3>
                  <p className="info-texto">
                    Usa este perfil como referencia y registra una solicitud para que el equipo de IntiFix gestione el servicio.
                  </p>
                  <button
                    className="btn-pro primary full"
                    type="button"
                    onClick={() => {
                      setSolicitudForm({
                        ...solicitudForm,
                        titulo: `Servicio con ${tecnicoSeleccionado.name}`,
                      });
                      setVistaDashboard("nuevaSolicitud");
                    }}
                  >
                    Crear solicitud para este servicio
                  </button>
                </div>
              </div>
            </section>
          )}

          {vistaDashboard === "nuevaSolicitud" && usuarioActual.role === "CLIENTE" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Solicitud</span>
                  <h1>Registrar reparación</h1>
                  <p>
                    Completa los datos del equipo, describe la falla y elige cómo
                    deseas recibir la atención.
                  </p>
                </div>
              </div>

              <form className="profile-form solicitud-form solicitud-form-pro" onSubmit={registrarSolicitud}>
                <div className="request-type-grid">
                  {["Laptop", "Celular", "Impresora", "PC", "Tablet", "Otro"].map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      className={solicitudForm.equipo.toLowerCase().includes(tipo.toLowerCase()) ? "request-type-card selected" : "request-type-card"}
                      onClick={() => setSolicitudForm({ ...solicitudForm, equipo: tipo })}
                    >
                      <span>{tipo === "Laptop" ? "💻" : tipo === "Celular" ? "📱" : tipo === "Impresora" ? "🖨️" : tipo === "PC" ? "🖥️" : tipo === "Tablet" ? "📲" : "🧰"}</span>
                      {tipo}
                    </button>
                  ))}
                </div>

                <div className="form-row-pro">
                  <label>Equipo tecnológico</label>
                  <input
                    type="text"
                    placeholder="Ejemplo: Laptop Lenovo, celular Samsung, impresora HP"
                    value={solicitudForm.equipo}
                    onChange={(e) =>
                      setSolicitudForm({ ...solicitudForm, equipo: e.target.value })
                    }
                  />
                </div>

                <div className="form-row-pro">
                  <label>Título de la falla</label>
                  <input
                    type="text"
                    placeholder="Ejemplo: No enciende, pantalla rota, equipo lento"
                    value={solicitudForm.titulo}
                    onChange={(e) =>
                      setSolicitudForm({ ...solicitudForm, titulo: e.target.value })
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
                    <button
                      type="button"
                      className={solicitudForm.modalidad === "TALLER" ? "modalidad-card selected" : "modalidad-card"}
                      onClick={() => setSolicitudForm({ ...solicitudForm, modalidad: "TALLER" })}
                    >
                      <span>🏪</span>
                      <strong>Llevar al taller</strong>
                      <small>El cliente lleva el equipo al punto de atención.</small>
                    </button>
                    <button
                      type="button"
                      className={solicitudForm.modalidad === "DOMICILIO" ? "modalidad-card selected" : "modalidad-card"}
                      onClick={() => setSolicitudForm({ ...solicitudForm, modalidad: "DOMICILIO" })}
                    >
                      <span>🏠</span>
                      <strong>Atención a domicilio</strong>
                      <small>El técnico atiende en la dirección indicada.</small>
                    </button>
                  </div>
                </div>

                {solicitudForm.modalidad === "DOMICILIO" && (
                  <div className="form-row-pro">
                    <label>Dirección de atención</label>
                    <input
                      type="text"
                      placeholder="Ejemplo: Av. Los Próceres 123, San Juan de Lurigancho"
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

                <button className="btn-pro primary full" type="submit" disabled={cargando}>
                  {cargando ? "Registrando..." : "Registrar solicitud"}
                </button>
              </form>
            </section>
          )}

          {vistaDashboard === "historial" && usuarioActual.role === "CLIENTE" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Historial</span>
                  <h1>Mis solicitudes</h1>
                  <p>
                    Consulta tus servicios registrados, filtra por estado y revisa
                    el detalle de cada reparación.
                  </p>
                </div>

                <button
                  className="btn-pro primary"
                  type="button"
                  onClick={() => cargarMisSolicitudes()}
                >
                  Actualizar
                </button>
              </div>

              <div className="search-panel-pro solicitud-filter">
                <label>Filtrar por estado</label>
                <select
                  value={filtroEstadoSolicitud}
                  onChange={(e) => {
                    setFiltroEstadoSolicitud(e.target.value);
                    cargarMisSolicitudes(e.target.value);
                  }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="REGISTRADA">Registrada</option>
                  <option value="EN_REVISION">En revisión</option>
                  <option value="ASIGNADA">Asignada</option>
                  <option value="EN_PROCESO">En proceso</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>

              <div className="technicians-grid-pro">
                {solicitudes.length === 0 && (
                  <div className="empty-state-pro">
                    <div>📭</div>
                    <h3>No hay solicitudes registradas</h3>
                    <p>Cuando registres una reparación aparecerá aquí.</p>
                  </div>
                )}

                {solicitudes.map((solicitud) => (
                  <div className="technician-pro-card solicitud-card" key={solicitud.id}>
                    <div className="technician-head">
                      <div className="avatar-tech">🧾</div>
                      <div>
                        <h3>{solicitud.titulo}</h3>
                        <span className={`estado-badge estado-${solicitud.estado}`}>
                          {solicitud.estado}
                        </span>
                      </div>
                    </div>

                    <div className="tech-info">
                      <p>
                        <strong>Código:</strong> {solicitud.codigo}
                      </p>
                      <p>
                        <strong>Equipo:</strong> {solicitud.equipo}
                      </p>
                      <p>
                        <strong>Modalidad:</strong> {solicitud.modalidad}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {solicitud.fechaRegistro
                          ? new Date(solicitud.fechaRegistro).toLocaleString()
                          : "No registrada"}
                      </p>
                    </div>

                    <button
                      className="btn-pro primary full"
                      type="button"
                      onClick={() => verDetalleSolicitud(solicitud.id)}
                    >
                      Ver detalle
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {vistaDashboard === "seguimiento" && usuarioActual.role === "CLIENTE" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Seguimiento</span>
                  <h1>Consultar estado</h1>
                  <p>Ingresa el código generado al registrar tu solicitud.</p>
                </div>
              </div>

              <form className="profile-form seguimiento-form" onSubmit={consultarEstadoSolicitud}>
                <div className="form-row-pro">
                  <label>Código de solicitud</label>
                  <input
                    type="text"
                    placeholder="Ejemplo: IFX-1234ABCD"
                    value={codigoSeguimiento}
                    onChange={(e) => setCodigoSeguimiento(e.target.value)}
                  />
                </div>

                <button className="btn-pro primary full" type="submit">
                  Consultar estado
                </button>
              </form>

              {resultadoSeguimiento && (
                <div className="profile-summary seguimiento-card">
                  <span className="section-badge">Resultado</span>
                  <h3>{resultadoSeguimiento.titulo}</h3>

                  <div className="profile-info-list">
                    <div>
                      <span>Código</span>
                      <strong>{resultadoSeguimiento.codigo}</strong>
                    </div>

                    <div>
                      <span>Estado actual</span>
                      <strong>{resultadoSeguimiento.estado}</strong>
                    </div>

                    <div>
                      <span>Equipo</span>
                      <strong>{resultadoSeguimiento.equipo}</strong>
                    </div>

                    <div>
                      <span>Modalidad</span>
                      <strong>{resultadoSeguimiento.modalidad}</strong>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {vistaDashboard === "solicitudesGestion" &&
            (usuarioActual.role === "ADMIN" || usuarioActual.role === "TECNICO") && (
              <section className="content-pro">
                <div className="page-heading">
                  <div>
                    <span className="section-badge">Gestión</span>
                    <h1>Solicitudes de reparación</h1>
                    <p>
                      Revisa solicitudes registradas, filtra por estado y actualiza
                      el avance del servicio.
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

                <div className="search-panel-pro solicitud-filter">
                  <label>Filtrar por estado</label>
                  <select
                    value={filtroEstadoSolicitud}
                    onChange={(e) => {
                      setFiltroEstadoSolicitud(e.target.value);
                      cargarSolicitudesGestion(e.target.value);
                    }}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="REGISTRADA">Registrada</option>
                    <option value="EN_REVISION">En revisión</option>
                    <option value="ASIGNADA">Asignada</option>
                    <option value="EN_PROCESO">En proceso</option>
                    <option value="FINALIZADA">Finalizada</option>
                    <option value="CANCELADA">Cancelada</option>
                  </select>
                </div>

                <div className="technicians-grid-pro">
                  {solicitudes.length === 0 && (
                    <div className="empty-state-pro">
                      <div>📭</div>
                      <h3>No hay solicitudes</h3>
                      <p>Cuando los clientes registren servicios aparecerán aquí.</p>
                    </div>
                  )}

                  {solicitudes.map((solicitud) => (
                    <div className="technician-pro-card solicitud-card" key={solicitud.id}>
                      <div className="technician-head">
                        <div className="avatar-tech">🧾</div>
                        <div>
                          <h3>{solicitud.titulo}</h3>
                          <span className={`estado-badge estado-${solicitud.estado}`}>
                            {solicitud.estado}
                          </span>
                        </div>
                      </div>

                      <div className="tech-info">
                        <p>
                          <strong>Código:</strong> {solicitud.codigo}
                        </p>
                        <p>
                          <strong>Cliente:</strong> {solicitud.clienteNombre}
                        </p>
                        <p>
                          <strong>Equipo:</strong> {solicitud.equipo}
                        </p>
                        <p>
                          <strong>Modalidad:</strong> {solicitud.modalidad}
                        </p>
                      </div>

                      <button
                        className="btn-pro primary full"
                        type="button"
                        onClick={() => verDetalleSolicitud(solicitud.id)}
                      >
                        Gestionar
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {vistaDashboard === "detalleSolicitud" && solicitudSeleccionada && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Detalle</span>
                  <h1>{solicitudSeleccionada.titulo}</h1>
                  <p>Código: {solicitudSeleccionada.codigo}</p>
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
                  Volver
                </button>
              </div>

              <div className="profile-layout">
                <div className="profile-summary detalle-solicitud">
                  <h3>Información de la solicitud</h3>

                  <div className="profile-info-list">
                    <div>
                      <span>Estado</span>
                      <strong>{solicitudSeleccionada.estado}</strong>
                    </div>

                    <div>
                      <span>Equipo</span>
                      <strong>{solicitudSeleccionada.equipo}</strong>
                    </div>

                    <div>
                      <span>Cliente</span>
                      <strong>
                        {solicitudSeleccionada.clienteNombre || "No registrado"}
                      </strong>
                    </div>

                    <div>
                      <span>Correo</span>
                      <strong>
                        {solicitudSeleccionada.clienteCorreo || "No registrado"}
                      </strong>
                    </div>

                    <div>
                      <span>Modalidad</span>
                      <strong>{solicitudSeleccionada.modalidad}</strong>
                    </div>

                    <div>
                      <span>Dirección</span>
                      <strong>{solicitudSeleccionada.direccion || "No aplica"}</strong>
                    </div>
                  </div>

                  <p className="detalle-descripcion">
                    {solicitudSeleccionada.descripcion}
                  </p>
                </div>

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
                            onChange={(e) => setArchivoEvidencia(e.target.files[0])}
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
                            onChange={(e) => setEstadoNuevoSolicitud(e.target.value)}
                          >
                            <option value="REGISTRADA">Registrada</option>
                            <option value="EN_REVISION">En revisión</option>
                            <option value="ASIGNADA">Asignada</option>
                            <option value="EN_PROCESO">En proceso</option>
                            <option value="FINALIZADA">Finalizada</option>
                            <option value="CANCELADA">Cancelada</option>
                          </select>
                        </div>

                        <div className="form-row-pro">
                          <label>Comentario</label>
                          <textarea
                            placeholder="Ejemplo: Solicitud revisada y asignada para diagnóstico."
                            value={comentarioEstado}
                            onChange={(e) => setComentarioEstado(e.target.value)}
                          />
                        </div>

                        <button
                          className="btn-pro success full"
                          type="submit"
                          disabled={cargando}
                        >
                          {cargando ? "Actualizando..." : "Guardar cambio de estado"}
                        </button>
                      </form>
                    </>
                  )}

                  <h3>Evidencias</h3>

                  {(!solicitudSeleccionada.adjuntos ||
                    solicitudSeleccionada.adjuntos.length === 0) && (
                    <p className="ayuda-campo info-texto">
                      Aún no hay evidencias adjuntas.
                    </p>
                  )}

                  {solicitudSeleccionada.adjuntos?.map((adjunto) => (
                    <div className="evidencia-item" key={adjunto.id}>
                      <span>🖼️ {adjunto.nombreArchivo}</span>
                      <a
                        href={`http://localhost:8081${adjunto.urlArchivo}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver imagen
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="profile-form historial-box">
                <h3>Historial de cambios</h3>

                {(!solicitudSeleccionada.historial ||
                  solicitudSeleccionada.historial.length === 0) && (
                  <p className="info-texto">No hay historial registrado.</p>
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
            </section>
          )}

          {vistaDashboard === "usuariosAdmin" && usuarioActual.role === "ADMIN" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Administración</span>
                  <h1>Gestión de usuarios</h1>
                  <p>Visualiza clientes, técnicos y administradores. Activa, desactiva o banea cuentas.</p>
                </div>
                <button className="btn-pro primary" type="button" onClick={() => cargarUsuariosAdmin()}>
                  Actualizar
                </button>
              </div>

              <div className="search-panel-pro admin-users-filter">
                <div className="form-row-pro">
                  <label>Buscar usuario</label>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo, DNI o teléfono"
                    value={filtroUsuarioAdmin}
                    onChange={(e) => setFiltroUsuarioAdmin(e.target.value)}
                  />
                </div>
                <div className="form-row-pro">
                  <label>Rol</label>
                  <select value={filtroRolAdmin} onChange={(e) => setFiltroRolAdmin(e.target.value)}>
                    <option value="TODOS">Todos</option>
                    <option value="CLIENTE">Clientes</option>
                    <option value="TECNICO">Técnicos</option>
                    <option value="ADMIN">Administradores</option>
                  </select>
                </div>
                <div className="form-row-pro">
                  <label>Estado</label>
                  <select value={filtroEstadoAdmin} onChange={(e) => setFiltroEstadoAdmin(e.target.value)}>
                    <option value="TODOS">Todos</option>
                    <option value="APROBADO">Activo / aprobado</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="INACTIVO">Inactivo</option>
                    <option value="BANEADO">Baneado</option>
                    <option value="ELIMINADO">Eliminado</option>
                  </select>
                </div>
                <button
                  className="btn-pro primary full"
                  type="button"
                  onClick={() => cargarUsuariosAdmin(filtroRolAdmin, filtroEstadoAdmin, filtroUsuarioAdmin)}
                >
                  Aplicar filtros
                </button>
              </div>

              <div className="users-table-pro">
                {usuariosAdmin.length === 0 && (
                  <div className="empty-state-pro">
                    <div>👥</div>
                    <h3>No hay usuarios para mostrar</h3>
                    <p>Prueba cambiando los filtros o actualizando la lista.</p>
                  </div>
                )}

                {usuariosAdmin.map((user) => (
                  <div className="user-admin-row" key={user.id}>
                    <div className="user-admin-main">
                      {user.profileImageUrl ? (
                        <img className="avatar-img" src={user.profileImageUrl} alt="Usuario" />
                      ) : (
                        <div className="avatar-user">{user.name ? user.name.charAt(0).toUpperCase() : "U"}</div>
                      )}
                      <div>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                        <small>DNI: {user.dni} | Tel: {user.phone}</small>
                      </div>
                    </div>
                    <div className="user-admin-tags">
                      <span>{user.role}</span>
                      <span className={`estado-badge estado-${user.accountStatus}`}>{user.accountStatus}</span>
                    </div>
                    <div className="user-admin-actions">
                      <button className="btn-pro secondary" type="button" onClick={() => verPerfilUsuarioAdmin(user.id)}>
                        Ver perfil
                      </button>
                      <button className="btn-pro success" type="button" onClick={() => cambiarEstadoUsuarioAdmin(user.id, "APROBADO")}>Activar</button>
                      <button className="btn-pro secondary" type="button" onClick={() => cambiarEstadoUsuarioAdmin(user.id, "INACTIVO")}>Desactivar</button>
                      <button className="btn-pro danger" type="button" onClick={() => cambiarEstadoUsuarioAdmin(user.id, "BANEADO", "¿Banear esta cuenta?")}>Banear</button>
                      <button className="btn-pro danger" type="button" onClick={() => cambiarEstadoUsuarioAdmin(user.id, "ELIMINADO", "¿Marcar esta cuenta como eliminada?")}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {vistaDashboard === "detalleUsuarioAdmin" && usuarioActual.role === "ADMIN" && usuarioAdminSeleccionado && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Perfil de usuario</span>
                  <h1>{usuarioAdminSeleccionado.name}</h1>
                  <p>Información completa del usuario seleccionado.</p>
                </div>
                <button className="btn-pro secondary" type="button" onClick={() => setVistaDashboard("usuariosAdmin")}>
                  Volver
                </button>
              </div>

              <div className="profile-layout">
                <div className="profile-summary">
                  {usuarioAdminSeleccionado.profileImageUrl ? (
                    <img className="profile-photo-large" src={usuarioAdminSeleccionado.profileImageUrl} alt="Usuario" />
                  ) : (
                    <div className="profile-avatar-large">
                      {usuarioAdminSeleccionado.name ? usuarioAdminSeleccionado.name.charAt(0).toUpperCase() : "U"}
                    </div>
                  )}
                  <h3>{usuarioAdminSeleccionado.name}</h3>
                  <p>{usuarioAdminSeleccionado.email}</p>
                  <div className="profile-info-list">
                    <div><span>DNI</span><strong>{usuarioAdminSeleccionado.dni}</strong></div>
                    <div><span>Teléfono</span><strong>{usuarioAdminSeleccionado.phone}</strong></div>
                    <div><span>Rol</span><strong>{usuarioAdminSeleccionado.role}</strong></div>
                    <div><span>Estado</span><strong>{usuarioAdminSeleccionado.accountStatus}</strong></div>
                    <div><span>Dirección</span><strong>{usuarioAdminSeleccionado.address || "No registrado"}</strong></div>
                    <div><span>Especialidades</span><strong>{usuarioAdminSeleccionado.specialties || "No registrado"}</strong></div>
                    <div><span>Zona</span><strong>{usuarioAdminSeleccionado.serviceZone || "No registrado"}</strong></div>
                    <div><span>Disponibilidad</span><strong>{usuarioAdminSeleccionado.availability || "No registrado"}</strong></div>
                  </div>
                </div>

                <div className="profile-form">
                  <h3>Acciones administrativas</h3>
                  <button className="btn-pro success full" type="button" onClick={() => cambiarEstadoUsuarioAdmin(usuarioAdminSeleccionado.id, "APROBADO")}>Activar cuenta</button>
                  <button className="btn-pro secondary full danger-margin" type="button" onClick={() => cambiarEstadoUsuarioAdmin(usuarioAdminSeleccionado.id, "INACTIVO")}>Desactivar cuenta</button>
                  <button className="btn-pro danger full danger-margin" type="button" onClick={() => cambiarEstadoUsuarioAdmin(usuarioAdminSeleccionado.id, "BANEADO", "¿Seguro que deseas banear esta cuenta?")}>Banear cuenta</button>
                  <button className="btn-pro danger full danger-margin" type="button" onClick={() => cambiarEstadoUsuarioAdmin(usuarioAdminSeleccionado.id, "ELIMINADO", "¿Seguro que deseas eliminar esta cuenta?")}>Eliminar cuenta</button>
                </div>
              </div>
            </section>
          )}

          {vistaDashboard === "pendientes" && usuarioActual.role === "ADMIN" && (
            <section className="content-pro">
              <div className="page-heading">
                <div>
                  <span className="section-badge">Revisión administrativa</span>

                  <h1>Técnicos pendientes</h1>

                  <p>Aprueba o rechaza solicitudes de técnicos registrados.</p>
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

                    <h3>No hay técnicos pendientes</h3>

                    <p>Cuando un técnico se registre aparecerá aquí.</p>
                  </div>
                )}

                {tecnicosPendientes.map((tecnico) => (
                  <div className="technician-pro-card" key={tecnico.id}>
                    <div className="technician-head">
                      <div className="avatar-tech">
                        {tecnico.name ? tecnico.name.charAt(0).toUpperCase() : "T"}
                      </div>

                      <div>
                        <h3>{tecnico.name}</h3>
                        <span>Pendiente</span>
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

                      <p>
                        <strong>Disponibilidad:</strong> {tecnico.availability}
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

          {mensaje && (
            <div className={tipoMensaje === "exito" ? "mensaje exito" : "mensaje error"}>
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
                        formData.role === "CLIENTE" ? "role-card selected" : "role-card"
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
                        formData.role === "TECNICO" ? "role-card selected" : "role-card"
                      }
                      onClick={() => setFormData({ ...formData, role: "TECNICO" })}
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

                      <p>Recibirás el código en {formData.email || "tu correo"}.</p>
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
                            formData.specialties.includes(item) ? "chip selected" : "chip"
                          }
                          onClick={() => toggleArrayItem("specialties", item)}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="wizard-section">
                    <label className="section-label">Ubicación de atención</label>

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

              <button className="boton-principal" type="submit" disabled={cargando}>
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

                  <button className="boton-principal" type="submit" disabled={cargando}>
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

                  <button className="boton-principal" type="submit" disabled={cargando}>
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

                  <button className="boton-principal" type="submit" disabled={cargando}>
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
            <div className={tipoMensaje === "exito" ? "mensaje exito" : "mensaje error"}>
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
                segundosRestantes === 0 ? "temporizador vencido" : "temporizador"
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
              {segundosRestantes === 0 ? "Enviar nuevo código" : "Reenviar código"}
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