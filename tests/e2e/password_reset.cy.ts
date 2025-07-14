/// <reference types="cypress" />

describe('Password recovery flow', () => {
  const email = 'usuario@test.com';

  it('resets password with valid token', () => {
    cy.visit('/recuperar-password');
    cy.get('input[type="email"]').type(email);
    cy.contains('button', 'Enviar enlace').click();
    const token = 'dummy-token';
    cy.visit(`/reset/${token}`);
    cy.get('input[type="password"]').first().type('nueva123');
    cy.get('input[type="password"]').eq(1).type('nueva123');
    cy.contains('button', 'Restablecer').click();
    cy.url().should('include', '/login');
  });

  it('shows error with invalid token', () => {
    cy.visit('/reset/invalid');
    cy.get('input[type="password"]').first().type('pass123');
    cy.get('input[type="password"]').eq(1).type('pass123');
    cy.contains('button', 'Restablecer').click();
    cy.contains('Token inválido o expirado');
  });
});
