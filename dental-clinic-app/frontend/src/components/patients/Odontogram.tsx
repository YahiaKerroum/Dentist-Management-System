import { useState, useEffect } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { PatientToothRecord, ToothStatus, TOOTH_STATUS_CONFIG, TOOTH_STATUS_OPTIONS } from '../../types/tooth';
import { TEETH_QUADRANTS } from '../../types/treatment';
import { Button } from '../ui/Button';

interface OdontogramProps {
  teeth: PatientToothRecord[];
  loading: boolean;
  error?: string;
  onSave: (toothNumber: number, status: ToothStatus, notes: string) => Promise<void>;
}

function Tooth({
  toothNumber,
  record,
  isSelected,
  onClick,
}: {
  toothNumber: number;
  record?: PatientToothRecord;
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = TOOTH_STATUS_CONFIG[record?.status ?? 'HEALTHY'];
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Tooth ${toothNumber}${record ? ` — ${config.label}` : ''}`}
      className={`flex h-10 w-8 flex-col items-center justify-center rounded-t-lg rounded-b-sm border-2 text-[11px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm ${
        isSelected ? 'border-primary-600 ring-2 ring-primary-200' : config.border
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M12 2c-3 0-5 1.5-5 4.5 0 3 1 6 1.5 9 .3 1.8.9 3.5 2 3.5s1.4-1.9 1.5-3c.1-1 .5-1 1 0 .1 1.1.4 3 1.5 3s1.7-1.7 2-3.5c.5-3 1.5-6 1.5-9C17 3.5 15 2 12 2z"
          className={config.fill}
        />
      </svg>
      <span className="text-surface-500">{toothNumber}</span>
    </button>
  );
}

export function Odontogram({ teeth, loading, error, onSave }: OdontogramProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [statusDraft, setStatusDraft] = useState<ToothStatus>('HEALTHY');
  const [notesDraft, setNotesDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const byNumber = new Map(teeth.map((t) => [t.toothNumber, t]));

  useEffect(() => {
    if (selectedTooth === null) return;
    const existing = byNumber.get(selectedTooth);
    setStatusDraft(existing?.status ?? 'HEALTHY');
    setNotesDraft(existing?.notes ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTooth]);

  const handleSelect = (toothNumber: number) => {
    setSelectedTooth(toothNumber === selectedTooth ? null : toothNumber);
  };

  const handleSave = async () => {
    if (selectedTooth === null) return;
    setSaving(true);
    try {
      await onSave(selectedTooth, statusDraft, notesDraft);
      setSelectedTooth(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return <div className="rounded-lg border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-surface-200 bg-white p-5">
        <div className="flex flex-col items-center gap-2">
          {/* Upper arch */}
          <div className="flex items-end gap-1">
            {TEETH_QUADRANTS.upperRight.map((n) => (
              <Tooth key={n} toothNumber={n} record={byNumber.get(n)} isSelected={selectedTooth === n} onClick={() => handleSelect(n)} />
            ))}
            <div className="mx-1 h-8 w-px bg-surface-300" />
            {TEETH_QUADRANTS.upperLeft.map((n) => (
              <Tooth key={n} toothNumber={n} record={byNumber.get(n)} isSelected={selectedTooth === n} onClick={() => handleSelect(n)} />
            ))}
          </div>
          <p className="text-xs text-surface-400">Upper Arch</p>
          <div className="my-1 h-px w-full bg-surface-100" />
          <p className="text-xs text-surface-400">Lower Arch</p>
          {/* Lower arch */}
          <div className="flex items-start gap-1">
            {TEETH_QUADRANTS.lowerLeft.map((n) => (
              <Tooth key={n} toothNumber={n} record={byNumber.get(n)} isSelected={selectedTooth === n} onClick={() => handleSelect(n)} />
            ))}
            <div className="mx-1 h-8 w-px bg-surface-300" />
            {TEETH_QUADRANTS.lowerRight.map((n) => (
              <Tooth key={n} toothNumber={n} record={byNumber.get(n)} isSelected={selectedTooth === n} onClick={() => handleSelect(n)} />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 border-t border-surface-100 pt-4">
          {TOOTH_STATUS_OPTIONS.map((status) => {
            const config = TOOTH_STATUS_CONFIG[status];
            return (
              <div key={status} className="flex items-center gap-1.5 text-xs text-surface-500">
                <span className={`h-2.5 w-2.5 rounded-full ${config.swatch}`} />
                {config.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline editor */}
      {selectedTooth !== null && (
        <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-surface-900">Tooth #{selectedTooth}</p>
            <button onClick={() => setSelectedTooth(null)} className="text-surface-400 hover:text-surface-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-surface-700">Condition</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as ToothStatus)}
                className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
              >
                {TOOTH_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {TOOTH_STATUS_CONFIG[status].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-surface-700">Notes</label>
              <input
                type="text"
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                placeholder="Optional notes..."
                className="w-full rounded-lg border border-surface-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:shadow-focus"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <Button onClick={handleSave} disabled={saving} isLoading={saving} size="sm">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
