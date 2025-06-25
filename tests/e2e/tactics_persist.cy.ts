/// <reference types="cypress" />

describe('Tactics pitch', () => {
  it('persists drag & drop layout to vz_tactics', () => {
    cy.visit('/liga-master/tacticas');

    cy.get('[data-cy="player"]').first().trigger('dragstart');
    cy.get('[data-cy="pitch-slot"]').eq(5).trigger('drop');

    cy.reload();
    cy.window().then((win) => {
      const data = win.localStorage.getItem('vz_tactics');
      expect(data).to.not.be.null;
    });
  });
});
