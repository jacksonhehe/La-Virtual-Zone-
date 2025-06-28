import { UserPlus, Settings, Trophy } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus size={32} className="text-primary" />,
    title: '1. Regístrate',
    // TODO mock
    description: 'Crea tu cuenta gratuita y configura tu perfil.'
  },
  {
    icon: <Settings size={32} className="text-primary" />,
    title: '2. Gestiona tu club',
    // TODO mock
    description: 'Administra fichajes, tácticas y finanzas.'
  },
  {
    icon: <Trophy size={32} className="text-primary" />,
    title: '3. Compite y gana',
    // TODO mock
    description: 'Participa en torneos y alcanza la gloria.'
  }
];

const HowItWorks = () => {
  return (
    <div className="bg-gray-900 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">¿Cómo funciona?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.title} className="text-center">
              {step.icon}
              <h3 className="font-bold mt-4">{step.title}</h3>
              <p className="text-gray-400 mt-2">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
