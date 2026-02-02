
export const FormClientes = ({ handleChange, formData, handleSubmit, isUpdating, resetForm}) => {

    return (<form id="clientForm" onSubmit={handleSubmit}>
                    <h2>Datos del Cliente</h2>
                    <input type="hidden" id="clientId" value={formData.id || ''} />
                    
                    <div>
                        <label htmlFor="nombre">Nombre de Cliente</label>
                        <input type="text" id="nombre" value={formData.nombre} onChange={handleChange} required />
                    </div>
                    
                    <div>
                        <label htmlFor="fecha_caducidad">Fecha de Caducidad</label>
                        <input type="date" id="fecha_caducidad" value={formData.fecha_caducidad || ''} onChange={handleChange} />
                    </div>

                    <div>
                        <label htmlFor="nueva_fecha_caducidad">Nueva Fecha de Caducidad</label>
                        <input type="date" id="nueva_fecha_caducidad" value={formData.nueva_fecha_caducidad || ''} onChange={handleChange} />
                    </div>
                    
                    <div>
                        <label htmlFor="soporte">Soporte</label>
                        <select id="soporte" value={formData.soporte} onChange={handleChange}>
                            <option value="Básico">Básico</option>
                            <option value="Estándar">Estándar</option>
                            <option value="Premium">Premium</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="prioridad">Prioridad</label>
                        <select id="prioridad" value={formData.prioridad} onChange={handleChange}>
                            <option value="Baja">Baja</option>
                            <option value="Media">Media</option>
                            <option value="Alta">Alta</option>
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="estado">Estado</label>
                        <select id="estado" value={formData.estado} onChange={handleChange}>
                            <option value="N/A">N/A</option>
                            <option value="Pedido">Pedido</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Listo">Listo</option>
                        </select>
                    </div>
                    
                    <button type="submit" id="saveButton">
                        {isUpdating ? 'Actualizar' : 'Guardar'}
                    </button>
                    {isUpdating && (
                        <button type="button" id="cancelButton" onClick={resetForm}>
                            Cancelar
                        </button>
                    )}
                </form>)
}