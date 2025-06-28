import React from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Table from '../components/ui/Table';

const tableData = {
  headers: ['Name', 'Role', 'Points'],
  data: [
    ['Player 1', 'Mid', 120],
    ['Player 2', 'Support', 95],
  ],
};

const StyleGuide = () => {
  return (
    <div className="space-y-s-6 p-s-6">
      <h1 className="text-3xl font-heading text-vz-accent">UI Style Guide</h1>

      <section>
        <h2 className="font-heading mb-s-2">Buttons</h2>
        <div className="flex gap-s-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </div>
      </section>

      <section>
        <h2 className="font-heading mb-s-2">Badges</h2>
        <div className="flex gap-s-2">
          <Badge>Default</Badge>
          <Badge className="bg-neon-red">Alert</Badge>
        </div>
      </section>

      <section>
        <h2 className="font-heading mb-s-2">Cards</h2>
        <Card>
          <p className="text-sm">This is a simple card using the design system.</p>
        </Card>
      </section>

      <section>
        <h2 className="font-heading mb-s-2">Table</h2>
        <Table headers={tableData.headers} data={tableData.data} />
      </section>
    </div>
  );
};

export default StyleGuide;
