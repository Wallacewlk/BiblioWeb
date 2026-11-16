@echo off
setlocal
cd /d "%~dp0"
if not exist "docs\vvts\evidencias" mkdir "docs\vvts\evidencias"
echo ==========================================
echo VVTS - TESTES UNITARIOS (sem servidor)
echo ==========================================
node --test tests/unit/auth-and-books.test.js tests/unit/loans.test.js > "docs\vvts\evidencias\unitarios.txt" 2>&1
set UNIT_RESULT=%ERRORLEVEL%
type "docs\vvts\evidencias\unitarios.txt"
echo.
if not "%UNIT_RESULT%"=="0" (
  echo ERRO nos testes unitarios. Corrija antes de prosseguir.
  exit /b %UNIT_RESULT%
)
echo ==========================================
echo VVTS - TESTES DE INTEGRACAO
 echo Inicie npm start em OUTRO terminal antes de continuar.
echo ==========================================
node --test tests/integration/api.test.js > "docs\vvts\evidencias\integracao.txt" 2>&1
set INT_RESULT=%ERRORLEVEL%
type "docs\vvts\evidencias\integracao.txt"
echo.
if not "%INT_RESULT%"=="0" (
  echo Falha na integracao. Confira servidor local, .env e logs.
  exit /b %INT_RESULT%
)
echo Todos os testes novos passaram. Guarde os logs em docs\vvts\evidencias\.
exit /b 0
