/**
 * js/app.js
 * MediSync Forensics - Core Application Logic
 */

const app = {
    state: {
        auditorMode: false,
        currentView: 'login',
        vulnData: null
    },

    // Referencias al DOM
    elements: {
        body: document.body,
        checkbox: document.getElementById('auditor-checkbox'),
        modal: document.getElementById('forensic-modal'),
        views: document.querySelectorAll('.view'),
        navBtns: document.querySelectorAll('.nav-btn')
    },

    // Inicializar la aplicación
    async init() {
        try {
            // Cargar el JSON local (Requiere Live Server o GitHub Pages)
            const response = await fetch('./data/ley1581.json');
            if (!response.ok) throw new Error('Error en petición HTTP');
            
            const data = await response.json();
            this.state.vulnData = data.vulnerabilidades;
            console.log("Datos de la Ley 1581 cargados correctamente.");
        } catch (error) {
            console.error("Error al cargar ley1581.json:", error);
            alert("Advertencia: No se pudo cargar el archivo JSON. Si estás abriendo el archivo localmente (file://), debes usar una extensión como 'Live Server' en VS Code para que funcione la petición Fetch.");
        }

        // Sincronizar UI
        this.elements.checkbox.checked = this.state.auditorMode;
    },

    // Alternar el Modo Auditor
   // Alternar el Modo Auditor
    toggleAuditorMode() {
        // Leemos el estado directamente del checkbox (evita el bug del doble clic)
        this.state.auditorMode = this.elements.checkbox.checked;
        
        const legendVuln = document.getElementById('legend-vuln');
        const legendFlow = document.getElementById('legend-flow');
        const vulnerableNodes = document.querySelectorAll('.vulnerable-node');
        
        if (this.state.auditorMode) {
            // Activar
            this.elements.body.classList.add('auditor-mode');
            if (legendVuln) legendVuln.style.display = 'flex';
            if (legendFlow) legendFlow.style.display = 'flex';
            vulnerableNodes.forEach(node => node.classList.add('vulnerable'));
        } else {
            // Desactivar
            this.elements.body.classList.remove('auditor-mode');
            if (legendVuln) legendVuln.style.display = 'none';
            if (legendFlow) legendFlow.style.display = 'none';
            vulnerableNodes.forEach(node => node.classList.remove('vulnerable'));
        }
    },

    // Navegación entre vistas
    navigate(viewName) {
        this.state.currentView = viewName;
        
        // Ocultar todas las vistas y mostrar la activa
        this.elements.views.forEach(view => {
            view.classList.remove('active');
            if (view.id === `view-${viewName}`) {
                view.classList.add('active');
            }
        });

        // Actualizar estado de los botones de navegación
        this.elements.navBtns.forEach(btn => {
            btn.classList.remove('active');
            // Mapeo simple por ID
            if (btn.id.includes(viewName.substring(0, 4))) {
                btn.classList.add('active');
            }
        });
        
        // Scroll arriba
        window.scrollTo(0,0);
    },

    // Gestión del Modal
    openModal(vulnId) {
        if (!this.state.vulnData) {
            alert("Los datos legales aún no han cargado.");
            return;
        }

        const vuln = this.state.vulnData[vulnId];
        if (!vuln) {
            console.error("Vulnerabilidad no encontrada en el JSON:", vulnId);
            return;
        }

        // Inyectar datos en el DOM del Modal
        document.getElementById('modal-title').textContent = vuln.titulo;
        document.getElementById('modal-article').innerHTML = `<i class="fa-solid ${vuln.icono}"></i> ${vuln.articulo}`;
        
        // Ajustar color del badge según severidad
        const badge = document.getElementById('modal-badge');
        badge.innerHTML = `<i class="fa-solid fa-gavel"></i> Ley 1581 - Severidad: ${vuln.severidad}`;
        
        if (vuln.severidad === 'CRÍTICA') {
            badge.style.color = 'var(--accent-danger)';
            badge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            badge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
        } else {
            badge.style.color = 'var(--accent-warning)';
            badge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            badge.style.borderColor = 'rgba(245, 158, 11, 0.2)';
        }

        // Textos descriptivos
        document.getElementById('modal-tech-desc').textContent = vuln.resumen_tecnico;
        document.getElementById('modal-tech-code').textContent = vuln.detalle_tecnico;
        document.getElementById('modal-legal-desc').textContent = vuln.impacto_legal;
        document.getElementById('modal-legal-quote').textContent = `"${vuln.articulo_texto}"`;
        document.getElementById('modal-sanction-desc').textContent = vuln.sancion_potencial;
        document.getElementById('modal-recom-desc').textContent = vuln.recomendacion;

        // Mostrar Modal
        this.elements.modal.classList.add('open');
    },

    closeModal(event) {
        // Cierra si se hace clic fuera de la caja del modal, o si se llama sin evento (desde el botón X o tecla ESC)
        if (!event || event.target === this.elements.modal) {
            this.elements.modal.classList.remove('open');
        }
    },

    // Interacción específica para la vista de Arquitectura
    handleNodeClick(vulnId) {
        // Solo abre el modal si el modo auditor está encendido
        if (this.state.auditorMode) {
            this.openModal(vulnId);
        }
    }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    
    // Escuchar tecla ESC para cerrar el modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') app.closeModal();
    });
});