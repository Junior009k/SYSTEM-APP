from flask import Flask, request, Response
import xml.etree.ElementTree as ET

# Inicializa la aplicación Flask
app = Flask(__name__)

# Namespace principal que espera la aplicación cliente
NAMESPACE_TEM = "http://tempuri.org/"

# Datos de Contribuyente Ficticio para respuesta exitosa
RNC_EXITOSO = "40225511704"
NOMBRE_CONTRIBUYENTE = "PABLO FERRERAS"

# =============================================================================
# 1. GENERACIÓN DE RESPUESTAS MOCK
# =============================================================================

def generate_successful_soap_response(rnc_cedula: str) -> str:
    """
    Genera una respuesta SOAP simulada de éxito (Error Code 0).
    """
    return f"""
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="{NAMESPACE_TEM}">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:DatosDelContribuyenteResponse>
         <tem:DatosDelContribuyenteResult>
            <tem:string>{rnc_cedula}</tem:string> 
            <tem:string>{NOMBRE_CONTRIBUYENTE}</tem:string> 
            <tem:string>1</tem:string> 
         </tem:DatosDelContribuyenteResult>
      </tem:DatosDelContribuyenteResponse>
   </soapenv:Body>
</soapenv:Envelope>
"""

def generate_error_soap_response(rnc_cedula: str, error_code: str) -> str:
    """
    Genera una respuesta SOAP simulada de error (e.g., Contribuyente no encontrado).
    """
    return f"""
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="{NAMESPACE_TEM}">
   <soapenv:Header/>
   <soapenv:Body>
      <tem:DatosDelContribuyenteResponse>
         <tem:DatosDelContribuyenteResult>
            <tem:string>{rnc_cedula}</tem:string> 
            <tem:string></tem:string> 
            <tem:string>{error_code}</tem:string>  
         </tem:DatosDelContribuyenteResult>
      </tem:DatosDelContribuyenteResponse>
   </soapenv:Body>
</soapenv:Envelope>
"""

# =============================================================================
# 2. ENDPOINT DEL SERVIDOR MOCK
# =============================================================================

@app.route('/ServicioConsulta.asmx', methods=['POST'])
def handle_soap_request():
    """
    Simula la lógica del endpoint /ServicioConsulta.asmx (operación DatosDelContribuyente).
    """
    try:
        # Flask obtiene el cuerpo de la solicitud como bytes.
        xml_request = request.data.decode('utf-8')
        
        # Analizar el XML entrante
        # Registrar el namespace para que ET.fromstring lo reconozca
        ET.register_namespace('soapenv', 'http://schemas.xmlsoap.org/soap/envelope/')
        ET.register_namespace('tem', NAMESPACE_TEM)
        
        root = ET.fromstring(xml_request)
        # Buscar el nodo <tem:RNC_CEDULA> dentro de <tem:DatosDelContribuyente>
        # Se usa XPath con namespace para una búsqueda precisa
        rnc_node = root.find(
            f".//{{{NAMESPACE_TEM}}}RNC_Cedula"
        )
        
        if rnc_node is None or not rnc_node.text:
            print("Error: RNC_Cedula no encontrado en el body SOAP.")
            return Response("Error: RNC_CEDULA no encontrado en el body SOAP.", status=400, mimetype='text/xml')
            
        rnc_cedula = rnc_node.text.strip()
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Petición recibida para RNC/CÉDULA: {rnc_cedula}")

        # Lógica de Mocking: Simular éxito o error
        if rnc_cedula == RNC_EXITOSO:
            soap_response = generate_successful_soap_response(rnc_cedula)
        else:
            # Cualquier otro RNC/Cédula devuelve error 1
            soap_response = generate_error_soap_response(rnc_cedula, "1") 

        # Crear y retornar la respuesta HTTP
        return Response(
            soap_response,
            mimetype='text/xml',
            status=200 # El servicio SOAP típicamente devuelve 200 incluso con errores lógicos
        )

    except ET.ParseError:
        return Response("Error: Cuerpo XML de la solicitud inválido.", status=400, mimetype='text/xml')
    except Exception as e:
        print(f"Error inesperado en el mock server: {e}")
        return Response("Error interno del servidor mock.", status=500, mimetype='text/xml')

# =============================================================================
# 3. EJECUCIÓN DEL SERVIDOR
# =============================================================================

if __name__ == '__main__':
    from datetime import datetime
    print("-" * 50)
    print("🚀 Iniciando DGII SOAP Mock Server con Flask...")
    print(f"Endpoint del Mock: http://192.168.145.200:5000/ServicioConsulta.asmx")
    print(f"RNC de Éxito: {RNC_EXITOSO} -> Retornará {NOMBRE_CONTRIBUYENTE} y Código 0")
    print(f"Cualquier otro RNC -> Retornará Código 1 (Error)")
    print("-" * 50)
    # Ejecuta el servidor en el puerto 5000
    app.run(host="0.0.0.0",port=5000, debug=False)