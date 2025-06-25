/// <reference types="cypress" />

describe('Push notifications', () => {
  it('shows toast after generating report', () => {
    cy.visit('/liga-master');
    cy.get('[aria-label="Descargar informe mensual"]').click();
    cy.contains('Informe descargado').should('be.visible');
  });
});
