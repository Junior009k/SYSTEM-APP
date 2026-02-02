
export const FormNotification = ({ handleInputChange, formData, handleSearchClick, crudLoading, handleSubmit,resetForm}) => {

    return (<div className="card" id="form-panel">
                        <h2>
                            {formData.id ? 'Editar Configuración' : 'Configurar Notificación'}
                        </h2>
                        <form id="clientForm" onSubmit={handleSubmit}>
                            <input type="hidden" id="clientId" value={formData.id || ''} />
    
                            {/* Buscador de Cliente por ID o Nombre */}
                            <div className="form-group">
                                <label htmlFor="searchClient">Buscar Cliente (ID o Nombre)</label>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <input 
                                        type="text" 
                                        id="searchClient" 
                                        placeholder="Escriba y presione Enter para cargar..." 
                                        value={formData.searchClient}
                                        onChange={handleInputChange}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearchClick();
                                            }
                                        }}
                                    />
                                    <button type="button" id="searchButton" className="btn-primary" style={{ flexGrow: 0, width: '80px' }} onClick={handleSearchClick} disabled={crudLoading}>
                                        Cargar
                                    </button>
                                </div>
                            </div>
    
                            {/* Detalles del Cliente Cargado */}
                            {formData.id && (
                                <div id="clientDetails" style={{ border: '1px solid #007bff55', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                                    <p style={{ margin: '0' }}><strong>Cliente Actual:</strong> <span id="currentClientName">{formData.nombre_de_cliente}</span></p>
                                    <p style={{ margin: '5px 0 0 0' }}><strong>ID Cliente:</strong> <span id="currentClientId">{formData.id}</span></p>
                                </div>
                            )}
    
                            {/* Input para el Nombre del Cliente (Obligatorio) */}
                            <div className="form-group">
                                <label htmlFor="nombre_de_cliente">Nombre del Cliente (*)</label>
                                <input 
                                    type="text" 
                                    id="nombre_de_cliente" 
                                    placeholder="Nombre completo o razón social" 
                                    value={formData.nombre_de_cliente} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
    
                            {/* Input para el Correo de Notificación (Múltiples) */}
                            <div className="form-group">
                                <label htmlFor="email_notificacion">Correos Electrónicos de Notificación (*)</label>
                                <input 
                                    type="text" 
                                    id="email_notificacion" 
                                    placeholder="ejemplo1@dominio.com, ejemplo2@otro.com" 
                                    value={formData.email_notificacion} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                                <small style={{ color: '#6c757d' }}>Separe múltiples correos con una coma (,).</small>
                            </div>
    
    
                            {/* SECCIÓN DE CONFIGURACIÓN DE NOTIFICACIONES */}
                            <h3 style={{ margin: '20px 0 10px 0', color: '#007bff', borderBottom: '1px solid #007bff33', paddingBottom: '5px' }}>Configuración de Notificación</h3>
                            
                            {/* 1. Habilitar Notificación */}
                            <div className="form-group checkbox-group">
                                <input 
                                    type="checkbox" 
                                    id="habilitar_notificacion" 
                                    checked={formData.habilitar_notificacion} 
                                    onChange={handleInputChange}
                                    style={{ width: 'auto', marginRight: '5px' }}
                                />
                                <label htmlFor="habilitar_notificacion" style={{ marginBottom: 0 }}>Habilitar Notificación por Correo</label>
                            </div>
    
                            {/* Grid para Umbral y Frecuencia */}
                            <div className="notification-config-grid" style={{ opacity: formData.habilitar_notificacion ? 1 : 0.6 }}>
                                {/* 2. Umbral de Días */}
                                <div className="form-group">
                                    <label htmlFor="umbral_dias_notificacion">Umbral (Días Restantes)</label>
                                    <input 
                                        type="number" 
                                        id="umbral_dias_notificacion" 
                                        value={formData.umbral_dias_notificacion} 
                                        onChange={handleInputChange} 
                                        min="1" 
                                        max="365"
                                        disabled={!formData.habilitar_notificacion}
                                    />
                                    <small style={{ color: '#6c757d' }}>Notificar si quedan X días o menos.</small>
                                </div>
    
                                {/* 3. Frecuencia de Notificación */}
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label htmlFor="frecuencia_notificacion">Frecuencia de Notificación</label>
                                    <select 
                                        id="frecuencia_notificacion" 
                                        value={formData.frecuencia_notificacion} 
                                        onChange={handleInputChange}
                                        disabled={!formData.habilitar_notificacion}
                                    >
                                        <option value="Diario">Diario</option>
                                        <option value="Semanal">Semanal</option>
                                        <option value="Mensual">Mensual (30 días)</option>
                                        <option value="Trimestral">Trimestral (90 días)</option>
                                    </select>
                                </div>
                            </div>
    
                            {/* Input para Plantilla de Correo Personalizada */}
                            <div className="form-group">
                                <label htmlFor="plantilla_correo">Plantilla de Correo Personalizada (Opcional)</label>
                                <textarea 
                                    id="plantilla_correo" 
                                    rows="5" 
                                    placeholder="Estimado/a [NOMBRE_CLIENTE], Su contrato [ID_CONTRATO] caducará en [DIAS_RESTANTES] días. Por favor, contacte con nosotros."
                                    value={formData.plantilla_correo} 
                                    onChange={handleInputChange}
                                ></textarea>
                                <small style={{ color: '#6c757d' }}>Utilice `[NOMBRE_CLIENTE]`, `[ID_CONTRATO]` y `[DIAS_RESTANTES]` como placeholders.</small>
                            </div>
    
                            {/* Botones de Acción */}
                            <div className="button-group">
                                <button type="submit" id="saveButton" className="btn-primary" disabled={crudLoading || (!formData.id && !formData.nombre_de_cliente)}>
                                    {formData.id ? 'Actualizar Configuración' : 'Crear Cliente'}
                                </button>
                                {(formData.id || formData.nombre_de_cliente) && (
                                    <button type="button" id="cancelButton" className="btn-secondary" onClick={resetForm} disabled={crudLoading} style={{ flexGrow: 1 }}>
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
    )
}