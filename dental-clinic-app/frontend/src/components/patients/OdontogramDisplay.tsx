interface OdontogramProps {
  teethStates?: Record<number, 'healthy' | 'filled' | 'treated' | 'missing' | 'implant'>;
}

/**
 * Odontogram: Visual representation of all 32 teeth with state indicators
 * Teeth are numbered 1-32 following the FDI notation
 * Upper right (1-8), Upper left (9-16), Lower left (17-24), Lower right (25-32)
 */
export function OdontogramDisplay({ teethStates = {} }: OdontogramProps) {
  const getToothColor = (toothNumber: number): string => {
    const state = teethStates[toothNumber];
    switch (state) {
      case 'healthy':
        return 'bg-green-100 border-green-400';
      case 'filled':
        return 'bg-blue-100 border-blue-400';
      case 'treated':
        return 'bg-yellow-100 border-yellow-400';
      case 'missing':
        return 'bg-red-100 border-red-400';
      case 'implant':
        return 'bg-purple-100 border-purple-400';
      default:
        return 'bg-gray-50 border-gray-300';
    }
  };

  const getToothLabel = (state?: string): string => {
    switch (state) {
      case 'healthy':
        return '✓';
      case 'filled':
        return '◆';
      case 'treated':
        return '◑';
      case 'missing':
        return '✕';
      case 'implant':
        return '→';
      default:
        return '';
    }
  };

  // Upper arch (teeth 1-16)
  const upperRight = Array.from({ length: 8 }, (_, i) => i + 1); // 1-8
  const upperLeft = Array.from({ length: 8 }, (_, i) => i + 9); // 9-16

  // Lower arch (teeth 17-32)
  const lowerLeft = Array.from({ length: 8 }, (_, i) => i + 17); // 17-24
  const lowerRight = Array.from({ length: 8 }, (_, i) => i + 25); // 25-32

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Dental Chart (Odontogram)</h3>
        
        {/* Legend */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-400 rounded"></div>
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border border-blue-400 rounded"></div>
            <span>Filled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-400 rounded"></div>
            <span>Treated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-400 rounded"></div>
            <span>Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-400 rounded"></div>
            <span>Implant</span>
          </div>
        </div>

        {/* Odontogram */}
        <div className="border border-gray-300 rounded p-4 bg-gray-50">
          {/* Upper Arch */}
          <div className="mb-8">
            <p className="text-xs text-gray-600 text-center mb-2 font-semibold">UPPER ARCH</p>
            
            {/* Upper Right */}
            <div className="flex justify-center gap-1 mb-2">
              {upperRight.map((tooth) => (
                <div
                  key={tooth}
                  className={`w-8 h-8 flex items-center justify-center border-2 rounded cursor-default text-xs font-semibold transition-colors ${getToothColor(
                    tooth
                  )}`}
                  title={`Tooth ${tooth}`}
                >
                  {getToothLabel(teethStates[tooth])}
                </div>
              ))}
            </div>

            {/* Upper Left (reversed display) */}
            <div className="flex justify-center gap-1">
              {upperLeft.reverse().map((tooth) => (
                <div
                  key={tooth}
                  className={`w-8 h-8 flex items-center justify-center border-2 rounded cursor-default text-xs font-semibold transition-colors ${getToothColor(
                    tooth
                  )}`}
                  title={`Tooth ${tooth}`}
                >
                  {getToothLabel(teethStates[tooth])}
                </div>
              ))}
            </div>
          </div>

          {/* Lower Arch */}
          <div>
            <p className="text-xs text-gray-600 text-center mb-2 font-semibold">LOWER ARCH</p>
            
            {/* Lower Left (reversed display) */}
            <div className="flex justify-center gap-1 mb-2">
              {lowerLeft.reverse().map((tooth) => (
                <div
                  key={tooth}
                  className={`w-8 h-8 flex items-center justify-center border-2 rounded cursor-default text-xs font-semibold transition-colors ${getToothColor(
                    tooth
                  )}`}
                  title={`Tooth ${tooth}`}
                >
                  {getToothLabel(teethStates[tooth])}
                </div>
              ))}
            </div>

            {/* Lower Right */}
            <div className="flex justify-center gap-1">
              {lowerRight.map((tooth) => (
                <div
                  key={tooth}
                  className={`w-8 h-8 flex items-center justify-center border-2 rounded cursor-default text-xs font-semibold transition-colors ${getToothColor(
                    tooth
                  )}`}
                  title={`Tooth ${tooth}`}
                >
                  {getToothLabel(teethStates[tooth])}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
