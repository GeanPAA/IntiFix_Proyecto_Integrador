package com.intifix.intifix_proyecto.service;
 
import com.intifix.intifix_proyecto.dto.request.ActualizarEstadoSolicitudRequest;
import com.intifix.intifix_proyecto.dto.request.ChatMensajeRequest;
import com.intifix.intifix_proyecto.dto.request.SolicitudRequest;
import com.intifix.intifix_proyecto.dto.response.ChatMensajeResponse;
import com.intifix.intifix_proyecto.dto.response.SeguimientoResponse;
import com.intifix.intifix_proyecto.dto.response.SolicitudResponse;
import com.intifix.intifix_proyecto.model.*;
import com.intifix.intifix_proyecto.repository.*;
 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
 
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
 
@Service
public class SolicitudService {
 
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Path UPLOAD_DIR    = Path.of("uploads", "evidencias");
    private static final Path AVATARS_DIR   = Path.of("uploads", "avatars");
 
    // Mapa de palabras clave de equipo → especialidades compatibles
    // Si el cliente escribe "laptop" o "pc", solo técnicos con esa especialidad pueden ser asignados
    private static final List<String[]> ESPECIALIDAD_MAP = List.of(
        new String[]{"Laptop y PC",             "laptop", "pc", "computadora", "computador", "notebook"},
        new String[]{"Celulares",               "celular", "smartphone", "teléfono", "movil", "móvil"},
        new String[]{"Electrodomésticos",       "lavadora", "refrigeradora", "microondas", "horno", "licuadora", "plancha"},
        new String[]{"Electricidad",            "electricidad", "cable", "enchufe", "interruptor", "tomacorriente"},
        new String[]{"Gasfitería",              "caño", "tubo", "desagüe", "inodoro", "lavatorio", "ducha"},
        new String[]{"Cerrajería",              "cerradura", "llave", "puerta", "chapa", "candado"},
        new String[]{"Aire acondicionado",      "aire", "acondicionado", "climatizador", "ventilador"},
        new String[]{"Cámaras de seguridad",    "cámara", "camara", "seguridad", "vigilancia", "dvr", "nvr"},
        new String[]{"Internet y redes",        "router", "internet", "red", "wifi", "cable de red", "switch"},
        new String[]{"Mantenimiento general",   "mantenimiento", "limpieza", "instalacion", "instalación"}
    );
 
    private final SolicitudReparacionRepository solicitudRepository;
    private final UserRepository userRepository;
    private final AdjuntoSolicitudRepository adjuntoRepository;
    private final HistorialEstadoSolicitudRepository historialRepository;
    private final ChatMensajeRepository chatRepository;
 
    public SolicitudService(
            SolicitudReparacionRepository solicitudRepository,
            UserRepository userRepository,
            AdjuntoSolicitudRepository adjuntoRepository,
            HistorialEstadoSolicitudRepository historialRepository,
            ChatMensajeRepository chatRepository
    ) {
        this.solicitudRepository = solicitudRepository;
        this.userRepository      = userRepository;
        this.adjuntoRepository   = adjuntoRepository;
        this.historialRepository = historialRepository;
        this.chatRepository      = chatRepository;
    }
 
    // =========================================================================
    // REGISTRAR SOLICITUD — con validación de especialidad del técnico
    // =========================================================================
 
    @Transactional
    public SolicitudResponse registrarSolicitud(String email, SolicitudRequest req) {
        User cliente = buscarUsuario(email);
 
        if (!"CLIENTE".equals(cliente.getRole())) {
            throw new RuntimeException("Solo los clientes pueden registrar solicitudes.");
        }
 
        if (req.modalidad == ModalidadServicio.DOMICILIO &&
                (req.direccion == null || req.direccion.trim().isBlank())) {
            throw new RuntimeException("La dirección es obligatoria para atención a domicilio.");
        }
 
        SolicitudReparacion solicitud = new SolicitudReparacion();
        solicitud.setCodigo(generarCodigoUnico());
        solicitud.setCliente(cliente);
        solicitud.setEquipo(req.equipo.trim());
        solicitud.setTitulo(req.titulo.trim());
        solicitud.setDescripcion(req.descripcion.trim());
        solicitud.setModalidad(req.modalidad);
        solicitud.setDireccion(req.direccion == null ? null : req.direccion.trim());
        solicitud.setEstado(EstadoSolicitud.REGISTRADA);
 
        // Si el cliente seleccionó un técnico preferido, validamos especialidad
        if (req.tecnicoId != null) {
            User tecnico = userRepository.findById(req.tecnicoId)
                    .orElseThrow(() -> new RuntimeException("El técnico seleccionado no existe."));
 
            if (!"TECNICO".equals(tecnico.getRole())) {
                throw new RuntimeException("El usuario seleccionado no es un técnico.");
            }
 
            if (!"APROBADO".equals(tecnico.getAccountStatus())) {
                throw new RuntimeException("El técnico seleccionado no está disponible actualmente.");
            }
 
            // Validar que el técnico tenga una especialidad compatible con el equipo
            validarCompatibilidadEspecialidad(req.equipo, tecnico);
 
            // Asignar el técnico preferido y pasar directamente a EN_REVISION
            solicitud.setTecnicoAsignado(tecnico);
            solicitud.setEstado(EstadoSolicitud.EN_REVISION);
        }
 
        SolicitudReparacion guardada = solicitudRepository.save(solicitud);
 
        String comentarioInicial = req.tecnicoId != null
            ? "Solicitud registrada con técnico preferido: " + guardada.getTecnicoAsignado().getName()
            : "Solicitud registrada por el cliente.";
 
        registrarHistorial(guardada, null, guardada.getEstado(), comentarioInicial, cliente);
 
        return SolicitudResponse.fromEntity(guardada);
    }
 
    /**
     * Valida que el tipo de equipo sea compatible con al menos una especialidad del técnico.
     * Lanza excepción con mensaje claro si no hay compatibilidad.
     */
    private void validarCompatibilidadEspecialidad(String equipo, User tecnico) {
        if (tecnico.getSpecialties() == null || tecnico.getSpecialties().isBlank()) {
            throw new RuntimeException(
                "El técnico " + tecnico.getName() + " no tiene especialidades registradas."
            );
        }
 
        String equipoLower = equipo.trim().toLowerCase();
        String especialidadesTecnico = tecnico.getSpecialties().toLowerCase();
 
        // Buscar qué especialidad(es) aplican al equipo ingresado
        List<String> especialidadesRequeridas = ESPECIALIDAD_MAP.stream()
            .filter(entry -> {
                // entry[0] = nombre especialidad, entry[1..] = palabras clave
                return Arrays.stream(entry, 1, entry.length)
                    .anyMatch(kw -> equipoLower.contains(kw));
            })
            .map(entry -> entry[0].toLowerCase())
            .toList();
 
        // Si el equipo no encaja en ninguna categoría conocida, permitimos (caso "Otro")
        if (especialidadesRequeridas.isEmpty()) {
            return;
        }
 
        // Verificar que el técnico tenga al menos una de las especialidades requeridas
        boolean compatible = especialidadesRequeridas.stream()
            .anyMatch(esp -> especialidadesTecnico.contains(esp));
 
        if (!compatible) {
            String requeridas = String.join(", ", especialidadesRequeridas);
            throw new RuntimeException(
                "El técnico " + tecnico.getName() + " no atiende equipos de tipo '" + equipo + "'. " +
                "Se requiere especialidad en: " + requeridas + ". " +
                "Sus especialidades son: " + tecnico.getSpecialties() + "."
            );
        }
    }
 
    // =========================================================================
    // SEGUIMIENTO — 3 fases visuales para el cliente
    // =========================================================================
 
    /**
     * Consulta pública por código: devuelve SeguimientoResponse con 3 fases.
     * NO requiere autenticación, cualquiera con el código puede consultar.
     * No expone datos personales.
     */
    public SeguimientoResponse consultarSeguimientoPorCodigo(String codigo) {
        SolicitudReparacion solicitud = solicitudRepository.findByCodigo(
                codigo.trim().toUpperCase()
        ).orElseThrow(() -> new RuntimeException("No existe una solicitud con ese código."));
 
        return SeguimientoResponse.fromEntity(solicitud);
    }
 
    // =========================================================================
    // CHAT
    // =========================================================================
 
    /** Lista todos los mensajes del chat de una solicitud (cliente, técnico o admin). */
    @Transactional
    public List<ChatMensajeResponse> listarMensajes(String email, Long solicitudId) {
        User usuario = buscarUsuario(email);
        SolicitudReparacion solicitud = buscarSolicitud(solicitudId);
        validarAcceso(usuario, solicitud);
 
        // Marcar como leídos los mensajes que NO envió el usuario actual
        chatRepository.marcarComoLeidos(solicitud, usuario);
 
        return chatRepository.findBySolicitudOrderByFechaEnvioAsc(solicitud)
                .stream()
                .map(ChatMensajeResponse::fromEntity)
                .toList();
    }
 
    /** Envía un mensaje en el chat de una solicitud. */
    @Transactional
    public ChatMensajeResponse enviarMensaje(String email, Long solicitudId, ChatMensajeRequest req) {
        User remitente = buscarUsuario(email);
        SolicitudReparacion solicitud = buscarSolicitud(solicitudId);
        validarAcceso(remitente, solicitud);
 
        if (solicitud.getEstado() == EstadoSolicitud.FINALIZADA ||
            solicitud.getEstado() == EstadoSolicitud.CANCELADA) {
            throw new RuntimeException("No se puede enviar mensajes en una solicitud finalizada o cancelada.");
        }
 
        ChatMensaje mensaje = new ChatMensaje();
        mensaje.setSolicitud(solicitud);
        mensaje.setRemitente(remitente);
        mensaje.setContenido(req.contenido.trim());
 
        return ChatMensajeResponse.fromEntity(chatRepository.save(mensaje));
    }
 
    /** Cantidad de mensajes no leídos en una solicitud para el usuario actual. */
    public long contarNoLeidos(String email, Long solicitudId) {
        User usuario = buscarUsuario(email);
        SolicitudReparacion solicitud = buscarSolicitud(solicitudId);
        validarAcceso(usuario, solicitud);
        return chatRepository.contarNoLeidos(solicitud, usuario);
    }
 
    // =========================================================================
    // SUBIR FOTO DE PERFIL
    // =========================================================================
 
    /**
     * Sube una foto de perfil al servidor y actualiza la URL del usuario.
     * Retorna la URL pública de la imagen.
     */
    @Transactional
    public String subirFotoPerfil(String email, MultipartFile archivo) {
        User usuario = buscarUsuario(email);
 
        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException("Debes seleccionar una imagen.");
        }
 
        String tipo = archivo.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) {
            throw new RuntimeException("Solo se permiten imágenes (jpg, png, webp).");
        }
 
        if (archivo.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("La imagen no debe superar 5 MB.");
        }
 
        try {
            Files.createDirectories(AVATARS_DIR);
 
            String extension = obtenerExtension(archivo.getOriginalFilename());
            // Nombre determinista por usuario: evita acumulación de archivos huérfanos
            String nombreArchivo = "avatar_" + usuario.getId() + extension;
            Path destino = AVATARS_DIR.resolve(nombreArchivo);
 
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
 
            String urlPublica = "/uploads/avatars/" + nombreArchivo;
            usuario.setProfileImageUrl(urlPublica);
            userRepository.save(usuario);
 
            return urlPublica;
        } catch (Exception e) {
            throw new RuntimeException("No se pudo subir la foto de perfil: " + e.getMessage());
        }
    }
 
    // =========================================================================
    // Métodos existentes (sin cambios en lógica principal)
    // =========================================================================
 
    public List<SolicitudResponse> listarMisSolicitudes(String email, String estado) {
        User cliente = buscarUsuario(email);
        List<SolicitudReparacion> solicitudes;
 
        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) {
            solicitudes = solicitudRepository.findByClienteOrderByFechaRegistroDesc(cliente);
        } else {
            solicitudes = solicitudRepository.findByClienteAndEstadoOrderByFechaRegistroDesc(
                    cliente, EstadoSolicitud.valueOf(estado.toUpperCase()));
        }
 
        return solicitudes.stream().map(SolicitudResponse::fromEntity).toList();
    }
 
    public List<SolicitudResponse> listarSolicitudesAdmin(String estado) {
        List<SolicitudReparacion> solicitudes;
 
        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) {
            solicitudes = solicitudRepository.findAllByOrderByFechaRegistroDesc();
        } else {
            solicitudes = solicitudRepository.findByEstadoOrderByFechaRegistroDesc(
                    EstadoSolicitud.valueOf(estado.toUpperCase()));
        }
 
        return solicitudes.stream().map(SolicitudResponse::fromEntity).toList();
    }
 
    /** @deprecated Usar consultarSeguimientoPorCodigo() para la vista del cliente */
    public SolicitudResponse consultarPorCodigo(String codigo) {
        SolicitudReparacion solicitud = solicitudRepository.findByCodigo(
                codigo.trim().toUpperCase()
        ).orElseThrow(() -> new RuntimeException("No existe una solicitud con ese código."));
        return SolicitudResponse.fromEntity(solicitud);
    }
 
    public SolicitudResponse obtenerDetalle(String email, Long id) {
        User usuario = buscarUsuario(email);
        SolicitudReparacion solicitud = buscarSolicitud(id);
        validarAcceso(usuario, solicitud);
        return SolicitudResponse.fromEntity(solicitud);
    }
 
    @Transactional
    public SolicitudResponse actualizarEstado(String email, Long id, ActualizarEstadoSolicitudRequest req) {
        User responsable = buscarUsuario(email);
 
        if (!"ADMIN".equals(responsable.getRole()) && !"TECNICO".equals(responsable.getRole())) {
            throw new RuntimeException("No tienes permisos para actualizar el estado.");
        }
 
        SolicitudReparacion solicitud = buscarSolicitud(id);
        EstadoSolicitud anterior = solicitud.getEstado();
        solicitud.setEstado(req.estadoNuevo);
 
        // Si se asigna técnico al cambiar a ASIGNADA
        if (req.estadoNuevo == EstadoSolicitud.ASIGNADA && req.tecnicoId != null) {
            User tecnico = userRepository.findById(req.tecnicoId)
                    .orElseThrow(() -> new RuntimeException("Técnico no encontrado."));
            solicitud.setTecnicoAsignado(tecnico);
        }
 
        SolicitudReparacion actualizada = solicitudRepository.save(solicitud);
 
        String comentario = (req.comentario == null || req.comentario.isBlank())
                ? "Cambio de estado realizado."
                : req.comentario.trim();
 
        registrarHistorial(actualizada, anterior, req.estadoNuevo, comentario, responsable);
 
        return SolicitudResponse.fromEntity(actualizada);
    }
 
    @Transactional
    public SolicitudResponse subirEvidencia(String email, Long solicitudId, MultipartFile archivo) {
        User usuario = buscarUsuario(email);
        SolicitudReparacion solicitud = buscarSolicitud(solicitudId);
        validarAcceso(usuario, solicitud);
 
        if (archivo == null || archivo.isEmpty()) {
            throw new RuntimeException("Debes seleccionar un archivo.");
        }
 
        String tipo = archivo.getContentType();
        if (tipo == null || !tipo.startsWith("image/")) {
            throw new RuntimeException("Solo se permiten imágenes.");
        }
 
        if (archivo.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("El archivo no debe superar 5 MB.");
        }
 
        try {
            Files.createDirectories(UPLOAD_DIR);
            String extension  = obtenerExtension(archivo.getOriginalFilename());
            String nombreSeguro = UUID.randomUUID() + extension;
            Path destino = UPLOAD_DIR.resolve(nombreSeguro);
            Files.copy(archivo.getInputStream(), destino, StandardCopyOption.REPLACE_EXISTING);
 
            AdjuntoSolicitud adjunto = new AdjuntoSolicitud();
            adjunto.setSolicitud(solicitud);
            adjunto.setNombreArchivo(archivo.getOriginalFilename());
            adjunto.setTipoArchivo(tipo);
            adjunto.setTamanoBytes(archivo.getSize());
            adjunto.setUrlArchivo("/uploads/evidencias/" + nombreSeguro);
            adjuntoRepository.save(adjunto);
 
            return SolicitudResponse.fromEntity(solicitud);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo subir la evidencia.");
        }
    }
 
    // =========================================================================
    // Helpers privados
    // =========================================================================
 
    private void registrarHistorial(SolicitudReparacion solicitud, EstadoSolicitud anterior,
                                    EstadoSolicitud nuevo, String comentario, User responsable) {
        HistorialEstadoSolicitud historial = new HistorialEstadoSolicitud();
        historial.setSolicitud(solicitud);
        historial.setEstadoAnterior(anterior);
        historial.setEstadoNuevo(nuevo);
        historial.setComentario(comentario);
        historial.setResponsable(responsable);
        historialRepository.save(historial);
        solicitud.getHistorialEstados().add(historial);
    }
 
    private void validarAcceso(User usuario, SolicitudReparacion solicitud) {
        boolean esClienteDueno = "CLIENTE".equals(usuario.getRole())
                && solicitud.getCliente().getId().equals(usuario.getId());
        boolean esAdminOTecnico = "ADMIN".equals(usuario.getRole()) || "TECNICO".equals(usuario.getRole());
 
        if (!esClienteDueno && !esAdminOTecnico) {
            throw new RuntimeException("No tienes permisos para acceder a esta solicitud.");
        }
    }
 
    private User buscarUsuario(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
    }
 
    private SolicitudReparacion buscarSolicitud(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));
    }
 
    private String generarCodigoUnico() {
        String codigo;
        do {
            codigo = "IFX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (solicitudRepository.existsByCodigo(codigo));
        return codigo;
    }
 
    private String obtenerExtension(String nombre) {
        if (nombre == null || !nombre.contains(".")) return ".jpg";
        return nombre.substring(nombre.lastIndexOf(".")).toLowerCase();
    }
}