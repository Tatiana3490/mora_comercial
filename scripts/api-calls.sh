#!/bin/bash

###############################################################################
# Mora Comercial API - Ejemplos curl
# 
# Este script contiene ejemplos de llamadas a la API para:
# - Login (obtener token)
# - Refrescar token
# - Obtener perfil del usuario autenticado
# - Crear usuario (ADMIN only)
# - Listar usuarios
# - Actualizar usuario
# - Eliminar usuario (ADMIN only)
# - Listar auditoría (ADMIN only)
#
# Requisitos: curl instalado, backend corriendo en http://localhost:8000
#
# Uso: 
#   1. Ejecutar la función deseada, p.ej: bash api-calls.sh login
#   2. O editar variables base_url, admin_email, admin_password
#   3. O llamar cada función directamente en una terminal
###############################################################################

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables base
BASE_URL="http://localhost:8000/api/v1"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="AdminPass123"
COMERCIAL_EMAIL="comercial@example.com"
COMERCIAL_PASSWORD="ComercialPass123"

# Para almacenar tokens obtenidos
ACCESS_TOKEN=""
REFRESH_TOKEN=""

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

###############################################################################
# 1. LOGIN - Obtener access token
###############################################################################
login() {
    echo_info "Iniciando sesión con $ADMIN_EMAIL..."
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -F "username=$ADMIN_EMAIL" \
        -F "password=$ADMIN_PASSWORD")
    
    echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
    
    # Extraer token si la respuesta es válida (opcional)
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // empty' 2>/dev/null)
    if [ -n "$ACCESS_TOKEN" ]; then
        echo_success "Token obtenido: $ACCESS_TOKEN"
        echo "export ACCESS_TOKEN='$ACCESS_TOKEN'" > /tmp/api_token.sh
    fi
}

###############################################################################
# 2. REFRESH TOKEN - Obtener nuevo access token
###############################################################################
refresh_token() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_error "ACCESS_TOKEN no está definido. Ejecuta login primero."
        return 1
    fi
    
    echo_info "Refrescando token..."
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh-token" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo "$RESPONSE" | jq '.' || echo "$RESPONSE"
    
    ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token // empty' 2>/dev/null)
    if [ -n "$ACCESS_TOKEN" ]; then
        echo_success "Nuevo token: $ACCESS_TOKEN"
    fi
}

###############################################################################
# 3. GET /usuarios/me - Obtener perfil del usuario autenticado
###############################################################################
get_me() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    echo_info "Obteniendo perfil del usuario autenticado..."
    
    curl -s -X GET "$BASE_URL/usuarios/me" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

###############################################################################
# 4. GET /usuarios - Listar todos los usuarios
###############################################################################
list_users() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    echo_info "Listando usuarios..."
    
    curl -s -X GET "$BASE_URL/usuarios/" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

###############################################################################
# 5. POST /usuarios - Crear nuevo usuario (ADMIN only)
###############################################################################
create_user() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    # Parámetros (puedes cambiarlos)
    NOMBRE="${1:-Nuevo Comercial}"
    EMAIL="${2:-comercial$(date +%s)@example.com}"
    PASSWORD="${3:-ComercialPass123}"
    ROL="${4:-COMERCIAL}"
    
    echo_info "Creando usuario: $EMAIL con rol $ROL..."
    
    curl -s -X POST "$BASE_URL/usuarios/" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "nombre": "'"$NOMBRE"'",
            "email": "'"$EMAIL"'",
            "password": "'"$PASSWORD"'",
            "rol": "'"$ROL"'"
        }' | jq '.'
}

###############################################################################
# 6. GET /usuarios/{id} - Obtener usuario por ID
###############################################################################
get_user() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    USER_ID="${1:-1}"
    echo_info "Obteniendo usuario con ID $USER_ID..."
    
    curl -s -X GET "$BASE_URL/usuarios/$USER_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

###############################################################################
# 7. PUT /usuarios/{id} - Actualizar usuario
###############################################################################
update_user() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    USER_ID="${1:-1}"
    NOMBRE="${2:-Usuario Actualizado}"
    
    echo_info "Actualizando usuario $USER_ID..."
    
    curl -s -X PUT "$BASE_URL/usuarios/$USER_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "nombre": "'"$NOMBRE"'"
        }' | jq '.'
}

###############################################################################
# 8. DELETE /usuarios/{id} - Eliminar usuario (ADMIN only)
###############################################################################
delete_user() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    USER_ID="${1:-2}"
    
    echo_info "Eliminando usuario $USER_ID..."
    
    curl -s -X DELETE "$BASE_URL/usuarios/$USER_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN"
    
    echo ""
    echo_success "Usuario $USER_ID eliminado"
}

###############################################################################
# 9. GET /audits - Listar auditoría (ADMIN only)
###############################################################################
list_audits() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    echo_info "Listando registros de auditoría..."
    
    # Parámetros opcionales: ?actor_email=...&action=create_user&limit=20
    curl -s -X GET "$BASE_URL/audits/?limit=20" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

###############################################################################
# 10. GET /audits/{log_id} - Obtener registro de auditoría
###############################################################################
get_audit() {
    if [ -z "$ACCESS_TOKEN" ]; then
        echo_warning "ACCESS_TOKEN no definido. Ejecutando login..."
        login
    fi
    
    LOG_ID="${1:-1}"
    echo_info "Obteniendo registro de auditoría $LOG_ID..."
    
    curl -s -X GET "$BASE_URL/audits/$LOG_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
}

###############################################################################
# FLUJO COMPLETO DE PRUEBA
###############################################################################
test_flow() {
    echo_info "===== FLUJO COMPLETO DE PRUEBA ====="
    echo ""
    
    echo_info "1. Login como ADMIN"
    login
    echo ""
    
    echo_info "2. Obtener perfil del usuario actual"
    get_me
    echo ""
    
    echo_info "3. Listar usuarios"
    list_users
    echo ""
    
    echo_info "4. Crear nuevo usuario"
    create_user "Test Usuario" "test@example.com" "TestPass123" "COMERCIAL"
    echo ""
    
    echo_info "5. Listar auditoría (últimas 10 entradas)"
    curl -s -X GET "$BASE_URL/audits/?limit=10" \
        -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
    echo ""
    
    echo_success "===== FIN DEL FLUJO ====="
}

###############################################################################
# MOSTRAR USO
###############################################################################
show_help() {
    cat << EOF
${GREEN}Mora Comercial API - Script de pruebas curl${NC}

${YELLOW}Uso:${NC}
  bash api-calls.sh [comando] [parámetros]

${YELLOW}Comandos disponibles:${NC}
  login                    - Iniciar sesión (obtener access token)
  refresh-token            - Refrescar token (requiere ACCESS_TOKEN)
  me                       - Obtener perfil del usuario autenticado
  list-users               - Listar todos los usuarios
  create-user [nombre] [email] [password] [rol]
                           - Crear nuevo usuario (ADMIN only)
  get-user [id]            - Obtener usuario por ID
  update-user [id] [nombre]
                           - Actualizar usuario
  delete-user [id]         - Eliminar usuario (ADMIN only)
  list-audits              - Listar registros de auditoría (ADMIN only)
  get-audit [id]           - Obtener registro de auditoría
  test-flow                - Ejecutar flujo completo de prueba
  help                     - Mostrar esta ayuda

${YELLOW}Variables de entorno:${NC}
  BASE_URL                 - URL base de la API (default: http://localhost:8000/api/v1)
  ADMIN_EMAIL              - Email del usuario admin (default: admin@example.com)
  ADMIN_PASSWORD           - Contraseña del admin (default: AdminPass123)
  ACCESS_TOKEN             - Token JWT (se obtiene al hacer login)

${YELLOW}Ejemplo:${NC}
  # Login
  bash api-calls.sh login
  
  # Obtener token en variable
  export ACCESS_TOKEN=<token_obtenido>
  
  # Crear usuario
  bash api-calls.sh create-user "Mi Usuario" "user@example.com" "Pass123" "COMERCIAL"
  
  # Listar auditoría
  bash api-calls.sh list-audits
  
  # Flujo completo
  bash api-calls.sh test-flow

EOF
}

###############################################################################
# MAIN - Procesar argumentos
###############################################################################
COMMAND="${1:-help}"

case "$COMMAND" in
    login)
        login
        ;;
    refresh-token|refresh)
        refresh_token
        ;;
    me|profile)
        get_me
        ;;
    list-users|users)
        list_users
        ;;
    create-user|create)
        create_user "$2" "$3" "$4" "$5"
        ;;
    get-user|get)
        get_user "$2"
        ;;
    update-user|update)
        update_user "$2" "$3"
        ;;
    delete-user|delete)
        delete_user "$2"
        ;;
    list-audits|audits)
        list_audits
        ;;
    get-audit|audit)
        get_audit "$2"
        ;;
    test-flow|test)
        test_flow
        ;;
    help|-h|--help)
        show_help
        ;;
    *)
        echo_error "Comando desconocido: $COMMAND"
        show_help
        exit 1
        ;;
esac
