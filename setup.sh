#!/bin/bash

# 🚀 Script de Setup do Kanban de Ideias
# Este script automatiza a configuração inicial do projeto

set -e  # Exit on any error

echo "🎯 Iniciando setup do Kanban de Ideias..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
check_node() {
    print_status "Verificando Node.js..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js não encontrado. Por favor, instale Node.js 20+ primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    REQUIRED_VERSION="20.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        print_error "Node.js versão $NODE_VERSION encontrada. Versão 20+ é necessária."
        exit 1
    fi
    
    print_success "Node.js $NODE_VERSION encontrado ✓"
}

# Verificar se npm está instalado
check_npm() {
    print_status "Verificando npm..."
    if ! command -v npm &> /dev/null; then
        print_error "npm não encontrado. Por favor, instale npm primeiro."
        exit 1
    fi
    print_success "npm encontrado ✓"
}

# Instalar dependências do backend
setup_backend() {
    print_status "Configurando backend..."
    
    cd backend
    
    # Copiar arquivo de configuração
    if [ ! -f .env ]; then
        cp config.example .env
        print_success "Arquivo .env criado a partir do exemplo"
    else
        print_warning "Arquivo .env já existe, mantendo configuração atual"
    fi
    
    # Instalar dependências
    print_status "Instalando dependências do backend..."
    npm install
    
    # Gerar cliente Prisma
    print_status "Gerando cliente Prisma..."
    npm run db:generate
    
    # Executar migrações
    print_status "Executando migrações do banco..."
    npm run db:push
    
    # Popular banco com dados de exemplo
    print_status "Populando banco com dados de exemplo..."
    npm run db:seed
    
    cd ..
    print_success "Backend configurado com sucesso ✓"
}

# Instalar dependências do frontend
setup_frontend() {
    print_status "Configurando frontend..."
    
    # Copiar arquivo de configuração
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Arquivo .env criado a partir do exemplo"
    else
        print_warning "Arquivo .env já existe, mantendo configuração atual"
    fi
    
    # Instalar dependências
    print_status "Instalando dependências do frontend..."
    npm install
    
    print_success "Frontend configurado com sucesso ✓"
}

# Verificar estrutura de arquivos
check_structure() {
    print_status "Verificando estrutura de arquivos..."
    
    REQUIRED_FILES=(
        "backend/package.json"
        "backend/prisma/schema.prisma"
        "package.json"
        "src/main.tsx"
    )
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            print_error "Arquivo necessário não encontrado: $file"
            exit 1
        fi
    done
    
    print_success "Estrutura de arquivos verificada ✓"
}

# Mostrar informações finais
show_final_info() {
    echo ""
    echo "🎉 Setup concluído com sucesso!"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Para iniciar o backend:"
    echo "   ${YELLOW}cd backend && npm run dev${NC}"
    echo ""
    echo "2. Para iniciar o frontend (em outro terminal):"
    echo "   ${YELLOW}npm run dev${NC}"
    echo ""
    echo "3. Acesse a aplicação:"
    echo "   ${GREEN}Frontend: http://localhost:5173${NC}"
    echo "   ${GREEN}Backend API: http://localhost:3001/api${NC}"
    echo "   ${GREEN}Documentação: http://localhost:3001/docs${NC}"
    echo ""
    echo "🔑 Credenciais de teste:"
    echo "   Email: ana.silva@empresa.com"
    echo "   Senha: 123456"
    echo ""
    echo "📚 Documentação:"
    echo "   README.md - Guia completo"
    echo "   docs/ARQUITETURA.md - Arquitetura técnica"
    echo ""
    echo "🐛 Problemas? Verifique os logs ou abra uma issue no GitHub"
    echo ""
}

# Função principal
main() {
    echo "🚀 Kanban de Ideias - Setup Automático"
    echo "======================================"
    echo ""
    
    check_node
    check_npm
    check_structure
    setup_backend
    setup_frontend
    show_final_info
}

# Executar setup
main "$@"
