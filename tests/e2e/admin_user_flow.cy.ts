/// <reference types="cypress" />

describe('Admin user management flow', () => {
  it('creates a new user from the admin panel', () => {
    cy.visit('/login');

    cy.get('input[type="text"]').first().type('admin');
    cy.get('input[type="password"]').type('password');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/usuario');

    cy.visit('/admin/usuarios');

    cy.contains('button', 'Nuevo Usuario').click();
    cy.get('input[placeholder="Usuario"]').type('testuser');
    cy.get('input[placeholder="Email"]').type('testuser@example.com');
    cy.get('select').select('user');
    cy.contains('button', 'Crear').click();

    cy.contains('td', 'testuser');
  });
});
