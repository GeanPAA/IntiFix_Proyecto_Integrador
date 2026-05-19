import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8081/api/auth";
const ADMIN_URL = "http://localhost:8081/api/admin";
const PROFILE_URL = "http://localhost:8081/api/profile";
const TECHNICIANS_URL = "http://localhost:8081/api/technicians";
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
    phone: "",
    specialties: "",
    serviceZone: "",
    availability: "",
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
    setFiltroTecnico("");
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
        phone: data.phone || "",
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
          phone: perfilForm.phone.trim(),
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

            {usuarioActual.role === "ADMIN" && (
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

            <div className="topbar-actions">
              <div className="search-topbar">
                <span>🔍</span>
                <input type="text" placeholder="Buscar en IntiFix..." />
              </div>

              <div className="user-chip">
                <div className="avatar-user">{inicialUsuario}</div>

                <div>
                  <strong>{usuarioActual.name}</strong>
                  <small>{usuarioActual.role}</small>
                </div>
              </div>
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
                      onClick={() => {
                        setVistaDashboard("perfil");
                        cargarPerfil();
                      }}
                    >
                      Ver mi perfil
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

                  <h3>Solicitar servicio</h3>

                  <p>
                    Busca técnicos disponibles según especialidad, ubicación y
                    disponibilidad.
                  </p>

                  <button
                    className="btn-pro primary"
                    onClick={() => {
                      setVistaDashboard("tecnicos");
                      cargarTecnicosAprobados();
                    }}
                  >
                    Ver técnicos aprobados
                  </button>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">📋</div>

                  <h3>Mis actividades</h3>

                  <p>
                    Próximamente podrás revisar solicitudes, historial y servicios
                    pendientes.
                  </p>

                  <button className="btn-pro disabled" type="button">
                    Próximamente
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

                  <p>Consulta solicitudes relacionadas con tus especialidades.</p>

                  <button className="btn-pro disabled" type="button">
                    Próximamente
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

                  <p>Gestiona tu información personal dentro de IntiFix.</p>
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
                  <div className="profile-avatar-large">{inicialUsuario}</div>

                  <h3>{perfil?.name || usuarioActual.name}</h3>

                  <p>{perfil?.email || usuarioActual.email}</p>

                  <div className="profile-info-list">
                    <div>
                      <span>Teléfono</span>
                      <strong>{perfil?.phone || "No registrado"}</strong>
                    </div>

                    <div>
                      <span>Rol</span>
                      <strong>{perfil?.role || usuarioActual.role}</strong>
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

                  <button
                    className="btn-pro secondary full"
                    type="button"
                    onClick={() => cargarPerfil()}
                  >
                    Actualizar perfil
                  </button>

                  <div className="security-note">
                    <strong>Nota:</strong> La desactivación de cuentas debe
                    manejarla el administrador para evitar bajas accidentales.
                  </div>
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

                    <button className="btn-pro primary full" type="button">
                      Ver detalles
                    </button>
                  </div>
                ))}
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