/// <reference types="cypress" />

const dtUser = {
  id: '3',
  username: 'entrenador',
  role: 'dt',
  xp: 500,
  clubId: 'club4',
  status: 'active',
  notifications: true,
  lastLogin: new Date().toISOString(),
  followers: 0,
  following: 0
};

describe('Plantilla editing', () => {
  it('edits player details', () => {
    cy.visit('/liga-master/plantilla');

    cy.get('[data-cy="edit-player"]').first().click();
    cy.get('[data-cy="player-name-input"]').clear().type('Updated Name');
    cy.get('[data-cy="save-player"]').click();

    cy.contains('Updated Name');
  });

  it('filters players by search', () => {
    cy.visit('/liga-master/plantilla');

    cy.get('[data-cy="player-search"]').type('Juan');
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('td', 'Juan Pérez');
  });
});
