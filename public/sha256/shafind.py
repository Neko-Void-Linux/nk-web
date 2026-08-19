import sys
import requests
import re

def extraer_sha256(url):
    try:
        respuesta = requests.get(url, timeout=10)
        respuesta.raise_for_status()
        html = respuesta.text
        
        coincidencia_hf = re.search(r'sha256:([a-f0-9]{64})', html, re.IGNORECASE)
        if coincidencia_hf:
            return coincidencia_hf.group(1)
            
        coincidencia_general = re.search(r'([a-f0-9]{64})', html, re.IGNORECASE)
        if coincidencia_general:
            return coincidencia_general.group(1)
            
        return "Sha256 not found"
        
    except requests.exceptions.RequestException as error:
        return f"Fail conexion: {error}"

if __name__ == "__main__":
    if len(sys.argv) == 2:
        url_ingresada = sys.argv[1]
    else:
        url_ingresada = input("Ingresa o pega la URL: ").strip()
        
    if not url_ingresada:
        print("Error: No se ingresó ninguna URL.")
        sys.exit(1)
        
    print(f"Scaning: {url_ingresada} ...")
    resultado = extraer_sha256(url_ingresada)
    print(f"\nEntry SHA256:\n{resultado}")
