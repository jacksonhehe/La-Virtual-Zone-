/// <reference types="cypress" />

describe('Admin match management', () => {
  it('creates and edits a match', () => {
    cy.visit('/admin/calendario');

    cy.contains('button', 'Programar Jornada').click();
    cy.get('select').first().select('Barcelona FC');
    cy.get('select').eq(1).select('Real Madrid');
    cy.get('input[type="date"]').type('2023-12-20');
    cy.get('input[type="time"]').type('20:00');
    cy.get('input[type="number"]').clear().type('1');
    cy.contains('button', 'Crear').click();

    cy.contains('div', 'Barcelona FC').parent().contains('Real Madrid');

    cy.contains('button', 'Editar').first().click();
    cy.get('select').first().select('PSG');
    cy.contains('button', 'Guardar').click();
    cy.contains('div', 'PSG');
  });
});
