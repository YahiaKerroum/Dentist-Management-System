import { useState } from 'react';

interface TeethSelectorProps {
    selectedTeeth: number[];
    onChange: (teeth: number[]) => void;
}

export function TeethSelector({ selectedTeeth, onChange }: TeethSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    const quadrants = [
        { name: 'Upper Right', teeth: [1, 2, 3, 4, 5, 6, 7, 8] },
        { name: 'Upper Left', teeth: [9, 10, 11, 12, 13, 14, 15, 16] },
        { name: 'Lower Left', teeth: [17, 18, 19, 20, 21, 22, 23, 24] },
        { name: 'Lower Right', teeth: [25, 26, 27, 28, 29, 30, 31, 32] }
    ];

    const toggleTooth = (tooth: number) => {
        if (selectedTeeth.includes(tooth)) {
            onChange(selectedTeeth.filter(t => t !== tooth));
        } else {
            onChange([...selectedTeeth, tooth].sort((a, b) => a - b));
        }
    };

    const clearAll = () => {
        onChange([]);
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Teeth Involved
            </label>
            
            {/* Selected Teeth Display */}
            <div 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px] flex items-center justify-between"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedTeeth.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                    {selectedTeeth.length === 0 
                        ? 'Click to select teeth' 
                        : `Selected: ${selectedTeeth.join(', ')}`}
                </span>
                <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
            </div>

            {/* Teeth Grid */}
            {isOpen && (
                <div className="mt-2 p-4 border border-gray-300 rounded-lg bg-white shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">
                            {selectedTeeth.length} tooth selected
                        </span>
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {quadrants.map((quadrant) => (
                            <div key={quadrant.name}>
                                <h4 className="text-xs font-semibold text-gray-600 mb-2">
                                    {quadrant.name}
                                </h4>
                                <div className="grid grid-cols-8 gap-2">
                                    {quadrant.teeth.map((tooth) => (
                                        <button
                                            key={tooth}
                                            type="button"
                                            onClick={() => toggleTooth(tooth)}
                                            className={`
                                                h-10 rounded-lg text-sm font-medium transition-colors
                                                ${selectedTeeth.includes(tooth)
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }
                                            `}
                                        >
                                            {tooth}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        Done
                    </button>
                </div>
            )}

            <p className="text-xs text-gray-500 mt-1">
                Click to open dental chart and select teeth (1-32)
            </p>
        </div>
    );
}