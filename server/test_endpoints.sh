#!/bin/bash

BASE_URL="http://localhost"
TOKEN=""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local expected=$4
    local description=$5

    if [ -n "$data" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$url" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$url" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN")
    fi

    if [ "$response" = "$expected" ]; then
        echo -e "  ${GREEN}✓${NC} [$method] $url → $response  $description"
    else
        echo -e "  ${RED}✗${NC} [$method] $url → $response (esperado: $expected)  $description"
    fi
}

test_endpoint_save() {
    local method=$1
    local url=$2
    local data=$3
    local expected=$4
    local description=$5
    local var_name=$6

    if [ -n "$data" ]; then
        result=$(curl -s -X "$method" "$BASE_URL$url" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data")
    else
        result=$(curl -s -X "$method" "$BASE_URL$url" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN")
    fi

    status=$(echo "$result" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    http_code=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$url" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$data" 2>/dev/null)

    if [ -n "$status" ]; then
        eval "$var_name=$status"
        echo -e "  ${GREEN}✓${NC} [$method] $url → id=$status  $description"
    else
        echo -e "  ${RED}✗${NC} [$method] $url → fallo  $description"
        echo "    Response: $result"
    fi
}

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   TEST DE ENDPOINTS - MICROSERVICIOS           ${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# ═══════════════════════════════════════════════
# AUTH SERVICE
# ═══════════════════════════════════════════════
echo -e "${YELLOW}▸ AUTH SERVICE${NC}"

# Registro
echo -e "  ${CYAN}Registro${NC}"
test_endpoint "POST" "/api/auth/register/" \
    '{"username":"testuser","email":"test@test.com","password":"testpass123","role":"admin"}' \
    "201" "Registrar usuario"

# Login
echo -e "  ${CYAN}Login${NC}"
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login/" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"testpass123"}')

TOKEN=$(echo "$login_response" | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
REFRESH=$(echo "$login_response" | grep -o '"refresh":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "  ${GREEN}✓${NC} [POST] /api/auth/login/ → Token obtenido"
else
    echo -e "  ${RED}✗${NC} [POST] /api/auth/login/ → No se obtuvo token"
    echo "    Response: $login_response"
    echo -e "\n${RED}No se puede continuar sin token. Abortando.${NC}"
    exit 1
fi

# Refresh token
echo -e "  ${CYAN}Token${NC}"
test_endpoint "POST" "/api/auth/token/refresh/" \
    "{\"refresh\":\"$REFRESH\"}" \
    "200" "Refresh token"

# Usuarios
echo -e "  ${CYAN}Usuarios${NC}"
test_endpoint "GET" "/api/auth/users/" "" "200" "Listar usuarios"
test_endpoint "GET" "/api/auth/users/1/" "" "200" "Obtener usuario por ID"
test_endpoint "PUT" "/api/auth/users/1/update/" \
    '{"username":"testuser","email":"updated@test.com","role":"admin"}' \
    "200" "Actualizar usuario"

echo ""

# ═══════════════════════════════════════════════
# INVENTORY SERVICE - Categorías
# ═══════════════════════════════════════════════
echo -e "${YELLOW}▸ INVENTORY SERVICE${NC}"

echo -e "  ${CYAN}Categorías de Productos${NC}"
test_endpoint_save "POST" "/api/inventory/categories/" \
    '{"name":"Electrónica","description":"Productos electrónicos"}' \
    "201" "Crear categoría" "CATEGORY_ID"

test_endpoint "GET" "/api/inventory/categories/" "" "200" "Listar categorías"

test_endpoint "PUT" "/api/inventory/categories/$CATEGORY_ID/" \
    '{"name":"Electrónica Actualizada","description":"Descripción actualizada"}' \
    "200" "Actualizar categoría"

# Productos
echo -e "  ${CYAN}Productos${NC}"
test_endpoint_save "POST" "/api/inventory/products/" \
    "{\"name\":\"Laptop\",\"description\":\"Laptop gaming\",\"price\":1500.00,\"stock\":20,\"min_stock\":5,\"category\":$CATEGORY_ID}" \
    "201" "Crear producto" "PRODUCT_ID"

test_endpoint "GET" "/api/inventory/products/" "" "200" "Listar productos"
test_endpoint "GET" "/api/inventory/products/$PRODUCT_ID/" "" "200" "Obtener producto por ID"

test_endpoint "PUT" "/api/inventory/products/$PRODUCT_ID/update/" \
    "{\"name\":\"Laptop Pro\",\"description\":\"Laptop gaming pro\",\"price\":1800.00,\"stock\":20,\"min_stock\":5,\"category\":$CATEGORY_ID}" \
    "200" "Actualizar producto"

# Stock
echo -e "  ${CYAN}Stock${NC}"
test_endpoint "PUT" "/api/inventory/products/$PRODUCT_ID/stock/" \
    '{"quantity":5,"action":"restock"}' \
    "200" "Restock +5"

test_endpoint "PUT" "/api/inventory/products/$PRODUCT_ID/stock/" \
    '{"quantity":3,"action":"discount"}' \
    "200" "Discount -3"

# Movimientos de producto
echo -e "  ${CYAN}Movimientos de Producto${NC}"
test_endpoint_save "POST" "/api/inventory/products/movements/" \
    "{\"product\":$PRODUCT_ID,\"quantity\":10,\"type_of\":\"stock_in\",\"description\":\"compra\"}" \
    "201" "Crear movimiento entrada" "MOVEMENT_ID"

test_endpoint "GET" "/api/inventory/products/movements/" "" "200" "Listar movimientos"

test_endpoint "PUT" "/api/inventory/products/movements/$MOVEMENT_ID/" \
    "{\"product\":$PRODUCT_ID,\"quantity\":8,\"type_of\":\"stock_in\",\"description\":\"compra ajustada\"}" \
    "200" "Actualizar movimiento"

test_endpoint "DELETE" "/api/inventory/products/movements/$MOVEMENT_ID/" "" "200" "Eliminar movimiento"

# Categorías de materias primas
echo -e "  ${CYAN}Categorías de Materias Primas${NC}"
test_endpoint_save "POST" "/api/inventory/raw-materials/categories/" \
    '{"name":"Metales","description":"Materiales metálicos"}' \
    "201" "Crear categoría MP" "RM_CATEGORY_ID"

test_endpoint "GET" "/api/inventory/raw-materials/categories/" "" "200" "Listar categorías MP"

# Materias primas
echo -e "  ${CYAN}Materias Primas${NC}"
test_endpoint_save "POST" "/api/inventory/raw-materials/" \
    "{\"name\":\"Aluminio\",\"description\":\"Lámina de aluminio\",\"category\":$RM_CATEGORY_ID,\"quantity\":100,\"unit\":\"kg\",\"price\":25.50}" \
    "201" "Crear materia prima" "RM_ID"

test_endpoint "GET" "/api/inventory/raw-materials/" "" "200" "Listar materias primas"
test_endpoint "GET" "/api/inventory/raw-materials/$RM_ID/" "" "200" "Obtener MP por ID"

test_endpoint "PUT" "/api/inventory/raw-materials/$RM_ID/update/" \
    "{\"name\":\"Aluminio Premium\",\"description\":\"Lámina premium\",\"category\":$RM_CATEGORY_ID,\"quantity\":100,\"unit\":\"kg\",\"price\":30.00}" \
    "200" "Actualizar materia prima"

# Movimientos de materias primas
echo -e "  ${CYAN}Movimientos de Materias Primas${NC}"
test_endpoint_save "POST" "/api/inventory/raw-materials/movements/" \
    "{\"raw_material\":$RM_ID,\"quantity\":50,\"type_of\":\"stock_in\",\"description\":\"compra inicial\"}" \
    "201" "Crear movimiento MP" "RM_MOV_ID"

test_endpoint "GET" "/api/inventory/raw-materials/movements/" "" "200" "Listar movimientos MP"

test_endpoint "PUT" "/api/inventory/raw-materials/movements/$RM_MOV_ID/" \
    "{\"raw_material\":$RM_ID,\"quantity\":40,\"type_of\":\"stock_in\",\"description\":\"ajuste\"}" \
    "200" "Actualizar movimiento MP"

test_endpoint "DELETE" "/api/inventory/raw-materials/movements/$RM_MOV_ID/" "" "200" "Eliminar movimiento MP"

echo ""

# ═══════════════════════════════════════════════
# SALES SERVICE - Ventas
# ═══════════════════════════════════════════════
echo -e "${YELLOW}▸ SALES SERVICE${NC}"

echo -e "  ${CYAN}Ventas${NC}"
test_endpoint_save "POST" "/api/sales/sales/" \
    "{\"product_id\":$PRODUCT_ID,\"quantity\":2,\"description\":\"venta de prueba\"}" \
    "201" "Crear venta" "SALE_ID"

test_endpoint "GET" "/api/sales/sales/" "" "200" "Listar ventas"
test_endpoint "GET" "/api/sales/sales/$SALE_ID/" "" "200" "Obtener venta por ID"

test_endpoint "PUT" "/api/sales/sales/$SALE_ID/update/" \
    '{"quantity":3,"description":"venta actualizada"}' \
    "200" "Actualizar venta"

# Categorías de gastos
echo -e "  ${CYAN}Categorías de Gastos${NC}"
test_endpoint_save "POST" "/api/sales/categories/" \
    '{"name":"Servicios","description":"Gastos de servicios"}' \
    "201" "Crear categoría gasto" "EXP_CATEGORY_ID"

test_endpoint "GET" "/api/sales/categories/" "" "200" "Listar categorías gastos"

test_endpoint "PUT" "/api/sales/categories/$EXP_CATEGORY_ID/" \
    '{"name":"Servicios Básicos","description":"Agua, luz, internet"}' \
    "200" "Actualizar categoría gasto"

# Gastos
echo -e "  ${CYAN}Gastos${NC}"
test_endpoint_save "POST" "/api/sales/expenses/" \
    "{\"name\":\"Luz\",\"description\":\"Recibo de luz\",\"category_id\":$EXP_CATEGORY_ID,\"quantity\":1,\"unit_price\":500.00}" \
    "201" "Crear gasto" "EXPENSE_ID"

test_endpoint "GET" "/api/sales/expenses/" "" "200" "Listar gastos"
test_endpoint "GET" "/api/sales/expenses/$EXPENSE_ID/" "" "200" "Obtener gasto por ID"

test_endpoint "PUT" "/api/sales/expenses/$EXPENSE_ID/update/" \
    "{\"name\":\"Luz actualizado\",\"description\":\"Recibo junio\",\"category_id\":$EXP_CATEGORY_ID,\"quantity\":1,\"unit_price\":550.00}" \
    "200" "Actualizar gasto"

echo ""

# ═══════════════════════════════════════════════
# LIMPIEZA
# ═══════════════════════════════════════════════
echo -e "${YELLOW}▸ LIMPIEZA${NC}"

test_endpoint "DELETE" "/api/sales/expenses/$EXPENSE_ID/delete/" "" "200" "Eliminar gasto"
test_endpoint "DELETE" "/api/sales/categories/$EXP_CATEGORY_ID/" "" "200" "Eliminar categoría gasto"
test_endpoint "DELETE" "/api/sales/sales/$SALE_ID/delete/" "" "200" "Eliminar venta"
test_endpoint "DELETE" "/api/inventory/products/$PRODUCT_ID/delete/" "" "200" "Eliminar producto"
test_endpoint "DELETE" "/api/inventory/categories/$CATEGORY_ID/" "" "200" "Eliminar categoría producto"
test_endpoint "DELETE" "/api/inventory/raw-materials/$RM_ID/delete/" "" "200" "Eliminar materia prima"
test_endpoint "DELETE" "/api/inventory/raw-materials/categories/$RM_CATEGORY_ID/" "" "200" "Eliminar categoría MP"
test_endpoint "DELETE" "/api/auth/users/1/delete/" "" "204" "Eliminar usuario"

echo ""
echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}   TEST COMPLETADO                              ${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""
