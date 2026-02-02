
export const FormCaducidades = ({ setFormData, formData, handleSubmit, crudLoading, resetForm}) => {

    return (<form id="clientForm" onSubmit={handleSubmit}>
                    <h2>Actualizar Fechas del Cliente</h2>
                    
                    <div>
                        <label htmlFor="clientId">ID de Cliente</label>
                        <input type="text" id="clientId" value={formData.id || ''} disabled />
                    </div>
                    
                    <div>
                        <label htmlFor="nombreReadOnly">Nombre de Cliente</label>
                        <input type="text" id="nombreReadOnly" value={formData.nombre_de_cliente} disabled />
                    </div>

                  
                    <div>
                        <label htmlFor="fecha_caducidad">Fecha de Caducidad Actual</label>
                        <input type="date" id="fecha_caducidad" value={formData.fecha_de_caducidad} disabled /> 
                    </div>

                    <div>
                        <label htmlFor="nueva_fecha_de_caducidad">Nueva Fecha de Caducidad (Editable)</label>
                        <input 
                            type="date" 
                            id="nueva_fecha_de_caducidad" 
                            value={formData.nueva_fecha_de_caducidad}
                            onChange={(e) => setFormData(prev => ({ ...prev, nueva_fecha_de_caducidad: e.target.value }))}
                            disabled={!formData.id || crudLoading}
                        />
                    </div>
                    
                    <button type="submit" id="saveButton" disabled={!formData.id || crudLoading}>
                        {crudLoading ? 'Guardando...' : formData.id ? 'Aplicar Nueva Fecha' : 'Selecciona un Cliente para Actualizar'}
                    </button>
                    {formData.id && (
                        <button type="button" id="cancelButton" onClick={resetForm} disabled={crudLoading}>
                            Cancelar
                        </button>
                    )}
                </form>)
}