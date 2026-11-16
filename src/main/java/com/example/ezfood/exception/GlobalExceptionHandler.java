
package com.example.ezfood.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PessimisticLockingFailureException.class)
    public ResponseEntity<Map<String, Object>> concorrencia(PessimisticLockingFailureException ex) {
        return montarErro(HttpStatus.CONFLICT, "Operação concorrente. Tente novamente.");
    }

    @ExceptionHandler({MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Map<String, Object>> parametroInvalido(Exception ex) {
        return montarErro(HttpStatus.BAD_REQUEST, "Parâmetro obrigatório ausente ou inválido.");
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> rotaNaoEncontrada(NoResourceFoundException ex) {
        return montarErro(HttpStatus.NOT_FOUND, "Rota não encontrada.");
    }

    // 404 - Registro não encontrado
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> naoEncontrado(
            NoSuchElementException ex) {

        return montarErro(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    // 400 - Dados inválidos
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> argumentoInvalido(
            IllegalArgumentException ex) {

        return montarErro(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    // 409 - Conflito com regra de negócio
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> regraNegocio(
            IllegalStateException ex) {

        return montarErro(HttpStatus.CONFLICT, ex.getMessage());
    }

    // 400 - Erros de validação dos DTOs
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validacao(
            MethodArgumentNotValidException ex) {

        String mensagem = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erro ->
                        erro.getField() + ": " + erro.getDefaultMessage()
                )
                .collect(Collectors.joining("; "));

        return montarErro(HttpStatus.BAD_REQUEST, mensagem);
    }

    // 400 - JSON inválido ou status desconhecido
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> jsonInvalido(
            HttpMessageNotReadableException ex) {

        return montarErro(
                HttpStatus.BAD_REQUEST,
                "JSON inválido ou valor incompatível com o esperado."
        );
    }

    // 409 - Violação de integridade no banco
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> integridade(
            DataIntegrityViolationException ex) {

        return montarErro(
                HttpStatus.CONFLICT,
                "Conflito de integridade dos dados."
        );
    }

    // Formato padrão dos erros
    private ResponseEntity<Map<String, Object>> montarErro(
            HttpStatus status,
            String mensagem) {

        Map<String, Object> resposta = Map.of(
                "dataHora", LocalDateTime.now().toString(),
                "status", status.value(),
                "erro", status.getReasonPhrase(),
                "mensagem", mensagem
        );

        return ResponseEntity.status(status).body(resposta);
    }
}
