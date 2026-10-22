// src/tools/media/precision-crop/DimensionInput.tsx
import { useState, useCallback } from 'react';
import { Container } from '@/core/components/ui/Container';
import { Card } from '@/core/components/ui/Card';
import { Input } from '@/core/components/ui/Input';
import { Motion } from '@/core/motion/motion';
import { buttonMotion } from '@/core/motion/compositions/buttonMotion';

export type Unit = 'px' | 'mm' | 'cm' | 'inch';

const SUPPORTED_UNITS: Unit[] = ['px', 'mm', 'cm', 'inch'];

interface DimensionInputProperties {
  initialWidth?: number;
  initialHeight?: number;
  onSizeChange?: (
    widthPixels: number,
    heightPixels: number,
    rawWidth: number,
    rawHeight: number,
    selectedUnit: Unit,
    dpiValue: number
  ) => void;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  padding?: number;
}

const convertToPixels = (value: number, fromUnit: Unit, dpiValue: number): number => {
  switch (fromUnit) {
    case 'px':   return value;
    case 'inch': return value * dpiValue;
    case 'cm':   return (value / 2.54) * dpiValue;
    case 'mm':   return (value / 25.4) * dpiValue;
    default:     return value;
  }
};

export const DimensionInput: React.FC<DimensionInputProperties> = ({
  initialWidth = 1,
  initialHeight = 1,
  onSizeChange,
  className = '',
  minWidth = 260,
  minHeight = 200,
  padding = 0,
}) => {
  const [rawWidthValue, setRawWidthValue] = useState(initialWidth);
  const [rawHeightValue, setRawHeightValue] = useState(initialHeight);
  const [selectedUnit, setSelectedUnit] = useState<Unit>('px');
  const [dpiValue, setDpiValue] = useState(96);

  const notifySizeChange = useCallback(
    (currentRawWidth: number, currentRawHeight: number, currentUnit: Unit, currentDpi: number) => {
      if (!onSizeChange) return;
      const calculatedWidthPx = convertToPixels(currentRawWidth, currentUnit, currentDpi);
      const calculatedHeightPx = convertToPixels(currentRawHeight, currentUnit, currentDpi);
      onSizeChange(calculatedWidthPx, calculatedHeightPx, currentRawWidth, currentRawHeight, currentUnit, currentDpi);
    },
    [onSizeChange]
  );

  const handleUnitChange = (newUnit: Unit) => {
    setSelectedUnit(newUnit);
    notifySizeChange(rawWidthValue, rawHeightValue, newUnit, dpiValue);
  };

  const handleWidthChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(changeEvent.target.value);
    if (changeEvent.target.value === '' || isNaN(numericValue)) return;
    if (numericValue <= 0) {
      window.alert('Width cannot be 0 or negative. Setting to 1.');
      setRawWidthValue(1);
      notifySizeChange(1, rawHeightValue, selectedUnit, dpiValue);
      return;
    }
    setRawWidthValue(numericValue);
    notifySizeChange(numericValue, rawHeightValue, selectedUnit, dpiValue);
  };

  const handleHeightChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseFloat(changeEvent.target.value);
    if (changeEvent.target.value === '' || isNaN(numericValue)) return;
    if (numericValue <= 0) {
      window.alert('Height cannot be 0 or negative. Setting to 1.');
      setRawHeightValue(1);
      notifySizeChange(rawWidthValue, 1, selectedUnit, dpiValue);
      return;
    }
    setRawHeightValue(numericValue);
    notifySizeChange(rawWidthValue, numericValue, selectedUnit, dpiValue);
  };

  const handleDpiChange = (changeEvent: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseInt(changeEvent.target.value, 10);
    if (!isNaN(numericValue) && numericValue > 0) {
      setDpiValue(numericValue);
      notifySizeChange(rawWidthValue, rawHeightValue, selectedUnit, numericValue);
    }
  };

  const handleFocus = (focusEvent: React.FocusEvent<HTMLInputElement>) => focusEvent.target.select();

  return (
    <div style={{ minWidth, minHeight, padding }} className={`flex-1 ${className}`}>
      <Container className="px-0 h-full">
        <Card className="p-4 flex flex-col h-full w-full">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Dimension Input
          </h3>

          <div className="flex items-center gap-3 mb-3">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
              DPI
            </label>
            <Input
              type="number"
              value={dpiValue}
              onChange={handleDpiChange}
              onFocus={handleFocus}
              min="1"
              max="1200"
              fullWidth
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              Unit
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {SUPPORTED_UNITS.map((unitOption) => (
                <Motion
                  key={unitOption}
                  preset={buttonMotion}
                  as="button"
                  onClick={() => handleUnitChange(unitOption)}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-lg
                    transition-all duration-200
                    ${selectedUnit === unitOption
                      ? 'bg-blue-500 text-white shadow-sm scale-[1.02]'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {unitOption.toUpperCase()}
                </Motion>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Width ({selectedUnit})
              </label>
              <Input
                type="number"
                value={rawWidthValue}
                onChange={handleWidthChange}
                onFocus={handleFocus}
                min="1"
                step="any"
                fullWidth
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Height ({selectedUnit})
              </label>
              <Input
                type="number"
                value={rawHeightValue}
                onChange={handleHeightChange}
                onFocus={handleFocus}
                min="1"
                step="any"
                fullWidth
              />
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
};