/// <reference types="cypress" />

describe('Tactics pitch', () => {
  it('persists player positions to vz_tactics', () => {
    cy.visit('/liga-master/tacticas');

    // Example drag action assuming draggable players and pitch slots exist
    cy.get('[data-cy="player"]').first().as('drag');
    cy.get('[data-cy="pitch-slot"]').first().as('drop');
    cy.get('@drag').trigger('dragstart');
    cy.get('@drop').trigger('drop');
    cy.get('@drop').find('[data-cy="player"]').should('exist');

    cy.reload();
    cy.window().then((win) => {
      const data = win.localStorage.getItem('vz_tactics');
      expect(data).to.not.be.null;
    });
  });
});
