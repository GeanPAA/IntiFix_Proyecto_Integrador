import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:8081/api/auth";
const ADMIN_URL = "http://localhost:8081/api/admin";
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

function App() {
  const [modo, setModo] = useState("registro");
  const [step, setStep] = useState(1);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");

  const [usuarioActual, setUsuarioActual] = useState(null);
  const [tecnicosPendientes, setTecnicosPendientes] = useState([]);

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

    if (formData.email.trim() === "") {
      setEmailEstado({ texto: "", tipo: "" });
      return;
    }

    if (!formData.email.includes("@")) {
      setEmailEstado({ texto: "Ingresa un correo válido", tipo: "error" });
      return;
    }

    const delay = setTimeout(() => {
      validarEmailDisponible(formData.email);
    }, 600);

    return () => clearTimeout(delay);
  }, [formData.email, modo]);

  useEffect(() => {
    if (modo !== "registro") return;

    if (formData.dni.trim() === "") {
      setDniEstado({ texto: "", tipo: "" });
      return;
    }

    if (formData.dni.length < 8) {
      setDniEstado({ texto: "El DNI debe tener 8 números", tipo: "error" });
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
        texto: "El teléfono debe tener 9 dígitos y empezar con 9",
        tipo: "error",
      });
      return;
    }

    const delay = setTimeout(() => {
      validarPhoneDisponible(formData.phone);
    }, 600);

    return () => clearTimeout(delay);
  }, [formData.phone, modo]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    if (name === "dni") {
      setFormData({ ...formData, dni: value.replace(/\D/g, "").slice(0, 8) });
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
      setFormData({ ...formData, code: value.replace(/\D/g, "").slice(0, 6) });
      return;
    }

    if (name === "recoveryCode") {
      setFormData({
        ...formData,
        recoveryCode: value.replace(/\D/g, "").slice(0, 6),
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

    if (actual.includes(value)) {
      setFormData({
        ...formData,
        [field]: actual.filter((item) => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...actual, value],
      });
    }
  };

  const validarEmailDisponible = async (email) => {
    try {
      const respuesta = await fetch(
        `${API_URL}/check-email?email=${encodeURIComponent(email)}`
      );

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        setEmailEstado({ texto, tipo: "error" });
      } else {
        setEmailEstado({ texto, tipo: "exito" });
      }
    } catch {
      setEmailEstado({
        texto: "No se pudo validar el correo. Revisa si el backend está encendido.",
        tipo: "error",
      });
    }
  };

  const validarDniDisponible = async (dni) => {
    try {
      const respuesta = await fetch(
        `${API_URL}/check-dni?dni=${encodeURIComponent(dni)}`
      );

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        setDniEstado({ texto, tipo: "error" });
      } else {
        setDniEstado({ texto, tipo: "exito" });
      }
    } catch {
      setDniEstado({
        texto: "No se pudo validar el DNI. Revisa si el backend está encendido.",
        tipo: "error",
      });
    }
  };

  const validarPhoneDisponible = async (phone) => {
    try {
      const respuesta = await fetch(
        `${API_URL}/check-phone?phone=${encodeURIComponent(phone)}`
      );

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        setPhoneEstado({ texto, tipo: "error" });
      } else {
        setPhoneEstado({ texto, tipo: "exito" });
      }
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

      if (dniEstado.tipo === "error") {
        throw new Error(dniEstado.texto);
      }

      if (!formData.email.includes("@")) {
        throw new Error("Ingresa un correo válido.");
      }

      if (emailEstado.tipo === "error") {
        throw new Error(emailEstado.texto);
      }

      if (!/^9[0-9]{8}$/.test(formData.phone)) {
        throw new Error("El teléfono debe tener 9 dígitos y empezar con 9.");
      }

      if (phoneEstado.tipo === "error") {
        throw new Error(phoneEstado.texto);
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
    name: formData.name,
    dni: formData.dni,
    email: formData.email,
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
        throw new Error(texto);
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
          email: formData.email,
          code: formData.code,
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto);
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
    e.preventDefault();
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
          email: formData.email,
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto);
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
          email: formData.email,
          codigo: formData.recoveryCode,
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto);
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
          email: formData.email,
          codigo: formData.recoveryCode,
          nuevaPassword: formData.newPassword,
        }),
      });

      const texto = await respuesta.text();

      if (!respuesta.ok) {
        throw new Error(texto);
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
      const respuesta = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
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

      setUsuarioActual(data);
      mostrarMensaje(
        "✅ " + (data.message || "Inicio de sesión correcto."),
        "exito"
      );

      if (data.role === "ADMIN") {
        cargarTecnicosPendientes();
      }
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    } finally {
      setCargando(false);
    }
  };

  const cerrarSesion = () => {
    setUsuarioActual(null);
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

      setTecnicosPendientes(data);
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
        throw new Error(texto);
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
        throw new Error(texto);
      }

      mostrarMensaje("✅ " + texto, "exito");
      cargarTecnicosPendientes();
    } catch (error) {
      mostrarMensaje("❌ " + error.message, "error");
    }
  };

  const minutos = Math.floor(segundosRestantes / 60);
  const segundos = segundosRestantes % 60;
  const totalSteps = formData.role === "TECNICO" ? 4 : 3;

  if (usuarioActual) {
    return (
      <div className="pagina">
        <div className="app-dashboard">
          <header className="dashboard-header">
            <div>
              <h1>IntiFix</h1>
              <p>
                Bienvenido, <strong>{usuarioActual.name}</strong>
              </p>
            </div>

            <div className="dashboard-user">
              <span>{usuarioActual.role}</span>
              <button onClick={cerrarSesion}>Cerrar sesión</button>
            </div>
          </header>

          {usuarioActual.role === "CLIENTE" && (
            <section className="dashboard-content">
              <div className="dashboard-title">
                <h2>Panel del Cliente</h2>
                <p>Desde aquí podrás gestionar tus solicitudes de servicio.</p>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Solicitar servicio</h3>
                  <p>Busca técnicos disponibles según especialidad y ubicación.</p>
                  <button>Próximamente</button>
                </div>

                <div className="dashboard-card">
                  <h3>Mis actividades</h3>
                  <p>Revisa el estado de tus solicitudes y servicios.</p>
                  <button>Próximamente</button>
                </div>
              </div>
            </section>
          )}

          {usuarioActual.role === "TECNICO" && (
            <section className="dashboard-content">
              <div className="dashboard-title">
                <h2>Panel del Técnico</h2>
                <p>Tu cuenta está aprobada. Ya puedes gestionar servicios.</p>
              </div>

              <div className="dashboard-grid">
                <div className="dashboard-card">
                  <h3>Servicios disponibles</h3>
                  <p>Consulta solicitudes relacionadas con tus especialidades.</p>
                  <button>Próximamente</button>
                </div>

                <div className="dashboard-card">
                  <h3>Mi perfil técnico</h3>
                  <p>Actualiza experiencia, disponibilidad y datos profesionales.</p>
                  <button>Próximamente</button>
                </div>
              </div>
            </section>
          )}

          {usuarioActual.role === "ADMIN" && (
            <section className="dashboard-content">
              <div className="dashboard-title">
                <h2>Panel Administrativo</h2>
                <p>Aprueba o rechaza solicitudes de técnicos.</p>
              </div>

              <button className="refresh-btn" onClick={cargarTecnicosPendientes}>
                Actualizar técnicos pendientes
              </button>

              <div className="admin-list">
                {tecnicosPendientes.length === 0 && (
                  <div className="dashboard-card">
                    <h3>No hay técnicos pendientes</h3>
                    <p>Cuando un técnico se registre aparecerá aquí.</p>
                  </div>
                )}

                {tecnicosPendientes.map((tecnico) => (
                  <div className="technician-card" key={tecnico.id}>
                    <div>
                      <h3>{tecnico.name}</h3>
                      <p><strong>DNI:</strong> {tecnico.dni}</p>
                      <p><strong>Correo:</strong> {tecnico.email}</p>
                      <p><strong>Teléfono:</strong> {tecnico.phone}</p>
                      <p><strong>Especialidades:</strong> {tecnico.specialties}</p>
                      <p><strong>Zona:</strong> {tecnico.serviceZone}</p>
                      <p><strong>Disponibilidad:</strong> {tecnico.availability}</p>
                    </div>

                    <div className="admin-actions">
                      <button
                        className="approve-btn"
                        onClick={() => aprobarTecnico(tecnico.id)}
                      >
                        Aprobar
                      </button>

                      <button
                        className="reject-btn"
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
        </div>
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
                        setFormData({
                          ...formData,
                          role: "TECNICO",
                        })
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
                        <small
                          className={
                            dniEstado.tipo === "exito"
                              ? "ayuda-campo exito-texto"
                              : "ayuda-campo error-texto"
                          }
                        >
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
                        <small
                          className={
                            phoneEstado.tipo === "exito"
                              ? "ayuda-campo exito-texto"
                              : "ayuda-campo error-texto"
                          }
                        >
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
                        <small
                          className={
                            emailEstado.tipo === "exito"
                              ? "ayuda-campo exito-texto"
                              : "ayuda-campo error-texto"
                          }
                        >
                          {emailEstado.tipo === "exito" ? "✓ " : "✕ "}
                          {emailEstado.texto}
                        </small>
                      )}
                    </div>

                    <div className="grupo full">
                      <label>Contraseña</label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={manejarCambio}
                      />
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
                      placeholder="Nueva contraseña"
                      value={formData.newPassword}
                      onChange={manejarCambio}
                      required
                    />
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