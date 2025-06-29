/// <reference types="cypress" />

describe('Admin club creation flow', () => {
  it('creates a new club from the admin panel', () => {
    // Confirm the home page loads
    cy.visit('/');
    cy.contains('LA VIRTUAL ZONE');

    // Log in as admin
    cy.visit('/login');
    cy.get('input[type="text"]').first().type('admin');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/usuario');

    // Create a DT user to assign to the club
    cy.visit('/admin/usuarios');
    cy.contains('button', 'Nuevo Usuario').click();
    cy.get('input[placeholder="Usuario"]').type('testdt');
    cy.get('input[placeholder="Email"]').type('testdt@example.com');
    cy.get('select').select('dt');
    cy.contains('button', 'Crear').click();
    cy.contains('td', 'testdt');

    // Create the club
    cy.visit('/admin/clubes');
    cy.contains('button', 'Nuevo Club').click();
    cy.get('input[placeholder="Nombre del club"]').type('Test Club');
    cy.get('select').select('testdt');
    cy.contains('button', 'Crear').click();

    // Verify the club appears in the table
    cy.contains('td', 'Test Club');
  });
});
