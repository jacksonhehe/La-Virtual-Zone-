import { useState, useEffect } from 'react';
import { Tournament } from '../../types';
import { useGlobalStore } from '../../store/globalStore';
import { generateId } from '../../../utils/id';
import StepBasics from './Steps/StepBasics';
import StepFormat from './Steps/StepFormat';
import StepSchedule from './Steps/StepSchedule';
import StepConfirm from './Steps/StepConfirm';

interface Props {
  onClose: () => void;
}

const STORAGE_KEY = 'wizard.tournament.draft';

const CreateTournamentWizard = ({ onClose }: Props) => {
  const addTournament = useGlobalStore(state => state.addTournament);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<Tournament>>({
    name: '',
    totalRounds: 1,
    status: 'upcoming',
  });

  useEffect(() => {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
      try {
        const parsed = JSON.parse(json);
        setData(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleFinish = () => {
    addTournament({
      id: generateId(),
      name: data.name || '',
      totalRounds: data.totalRounds || 1,
      status: (data.status as Tournament['status']) || 'upcoming',
      currentRound: 0,
    });
    localStorage.removeItem(STORAGE_KEY);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        {step === 0 && (
          <StepBasics data={data} onNext={d => { setData(d); setStep(1); }} />
        )}
        {step === 1 && (
          <StepFormat
            data={data}
            onBack={() => setStep(0)}
            onNext={d => { setData(d); setStep(2); }}
          />
        )}
        {step === 2 && (
          <StepSchedule
            data={data}
            onBack={() => setStep(1)}
            onNext={d => { setData(d); setStep(3); }}
          />
        )}
        {step === 3 && (
          <StepConfirm
            data={data}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  );
};

export default CreateTournamentWizard;
