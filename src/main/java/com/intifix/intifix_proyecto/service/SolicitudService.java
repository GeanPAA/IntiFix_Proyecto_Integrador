package com.intifix.intifix_proyecto.service;

import com.intifix.intifix_proyecto.dto.request.ActualizarEstadoSolicitudRequest;
import com.intifix.intifix_proyecto.dto.request.SolicitudRequest;
import com.intifix.intifix_proyecto.dto.response.SolicitudResponse;
import com.intifix.intifix_proyecto.model.AdjuntoSolicitud;
import com.intifix.intifix_proyecto.model.EstadoSolicitud;
import com.intifix.intifix_proyecto.model.HistorialEstadoSolicitud;
import com.intifix.intifix_proyecto.model.ModalidadServicio;
import com.intifix.intifix_proyecto.model.SolicitudReparacion;
import com.intifix.intifix_proyecto.model.User;
import com.intifix.intifix_proyecto.repository.AdjuntoSolicitudRepository;
import com.intifix.intifix_proyecto.repository.HistorialEstadoSolicitudRepository;
import com.intifix.intifix_proyecto.repository.SolicitudReparacionRepository;
import com.intifix.intifix_proyecto.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class SolicitudService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    private static final Path UPLOAD_DIR = Path.of("uploads", "evidencias");

    private final SolicitudReparacionRepository solicitudRepository;
    private final UserRepository userRepository;
    private final AdjuntoSolicitudRepository adjuntoRepository;
    private final HistorialEstadoSolicitudRepository historialRepository;

    public SolicitudService(
            SolicitudReparacionRepository solicitudRepository,
            UserRepository userRepository,
            AdjuntoSolicitudRepository adjuntoRepository,
            HistorialEstadoSolicitudRepository historialRepository
    ) {
        this.solicitudRepository = solicitudRepository;
        this.userRepository = userRepository;
        this.adjuntoRepository = adjuntoRepository;
        this.historialRepository = historialRepository;
    }

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

        SolicitudReparacion guardada = solicitudRepository.save(solicitud);

        registrarHistorial(
                guardada,
                null,
                EstadoSolicitud.REGISTRADA,
                "Solicitud registrada por el cliente.",
                cliente
        );

        return SolicitudResponse.fromEntity(guardada);
    }

    public List<SolicitudResponse> listarMisSolicitudes(String email, String estado) {
        User cliente = buscarUsuario(email);

        List<SolicitudReparacion> solicitudes;

        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) {
            solicitudes = solicitudRepository.findByClienteOrderByFechaRegistroDesc(cliente);
        } else {
            solicitudes = solicitudRepository.findByClienteAndEstadoOrderByFechaRegistroDesc(
                    cliente,
                    EstadoSolicitud.valueOf(estado.toUpperCase())
            );
        }

        return solicitudes.stream()
                .map(SolicitudResponse::fromEntity)
                .toList();
    }

    public List<SolicitudResponse> listarSolicitudesAdmin(String estado) {
        List<SolicitudReparacion> solicitudes;

        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado)) {
            solicitudes = solicitudRepository.findAllByOrderByFechaRegistroDesc();
        } else {
            solicitudes = solicitudRepository.findByEstadoOrderByFechaRegistroDesc(
                    EstadoSolicitud.valueOf(estado.toUpperCase())
            );
        }

        return solicitudes.stream()
                .map(SolicitudResponse::fromEntity)
                .toList();
    }

    public SolicitudResponse consultarPorCodigo(String codigo) {
        SolicitudReparacion solicitud = solicitudRepository.findByCodigo(
                        codigo.trim().toUpperCase()
                )
                .orElseThrow(() -> new RuntimeException("No existe una solicitud con ese código."));

        return SolicitudResponse.fromEntity(solicitud);
    }

    public SolicitudResponse obtenerDetalle(String email, Long id) {
        User usuario = buscarUsuario(email);

        SolicitudReparacion solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        validarAcceso(usuario, solicitud);

        return SolicitudResponse.fromEntity(solicitud);
    }

    @Transactional
    public SolicitudResponse actualizarEstado(
            String email,
            Long id,
            ActualizarEstadoSolicitudRequest req
    ) {
        User responsable = buscarUsuario(email);

        if (!"ADMIN".equals(responsable.getRole()) && !"TECNICO".equals(responsable.getRole())) {
            throw new RuntimeException("No tienes permisos para actualizar el estado.");
        }

        SolicitudReparacion solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        EstadoSolicitud anterior = solicitud.getEstado();

        solicitud.setEstado(req.estadoNuevo);

        SolicitudReparacion actualizada = solicitudRepository.save(solicitud);

        String comentario = req.comentario == null || req.comentario.isBlank()
                ? "Cambio de estado realizado."
                : req.comentario.trim();

        registrarHistorial(
                actualizada,
                anterior,
                req.estadoNuevo,
                comentario,
                responsable
        );

        return SolicitudResponse.fromEntity(actualizada);
    }

    @Transactional
    public SolicitudResponse subirEvidencia(
            String email,
            Long solicitudId,
            MultipartFile archivo
    ) {
        User usuario = buscarUsuario(email);

        SolicitudReparacion solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

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

            String extension = obtenerExtension(archivo.getOriginalFilename());
            String nombreSeguro = UUID.randomUUID() + extension;
            Path destino = UPLOAD_DIR.resolve(nombreSeguro);

            Files.copy(
                    archivo.getInputStream(),
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
            );

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

    private void registrarHistorial(
            SolicitudReparacion solicitud,
            EstadoSolicitud anterior,
            EstadoSolicitud nuevo,
            String comentario,
            User responsable
    ) {
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
        boolean esClienteDueno =
                "CLIENTE".equals(usuario.getRole()) &&
                        solicitud.getCliente().getId().equals(usuario.getId());

        boolean esAdminOTecnico =
                "ADMIN".equals(usuario.getRole()) ||
                        "TECNICO".equals(usuario.getRole());

        if (!esClienteDueno && !esAdminOTecnico) {
            throw new RuntimeException("No tienes permisos para ver esta solicitud.");
        }
    }

    private User buscarUsuario(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado."));
    }

    private String generarCodigoUnico() {
        String codigo;

        do {
            codigo = "IFX-" + UUID.randomUUID()
                    .toString()
                    .substring(0, 8)
                    .toUpperCase();
        } while (solicitudRepository.existsByCodigo(codigo));

        return codigo;
    }

    private String obtenerExtension(String nombre) {
        if (nombre == null || !nombre.contains(".")) {
            return ".jpg";
        }

        return nombre.substring(nombre.lastIndexOf(".")).toLowerCase();
    }
}