/// <reference types="cypress" />

describe('Plantilla editing', () => {
  it('saves player details to localStorage', () => {
    cy.visit('/liga-master/plantilla');

    cy.get('[data-cy="edit-player"]').first().click();
    cy.get('[data-cy="player-name-input"]').clear().type('Updated Name');
    cy.get('[data-cy="save-player"]').click();

    cy.window().then((win) => {
      const players = win.localStorage.getItem('vz_players');
      expect(players).to.contain('Updated Name');
    });
  });

  it('filters players by search', () => {
    cy.visit('/liga-master/plantilla');

    cy.get('[data-cy="player-search"]').type('Juan');
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('td', 'Juan Pérez');
  });
});
