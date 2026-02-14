import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

const presetColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#0f172a', // slate
];

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(value || '#3b82f6');

  const handleColorSelect = (color: string) => {
    onChange(color);
    setCustomColor(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onChange(color);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-20 h-8 p-1"
          disabled={disabled}
        >
          <div
            className="w-full h-full rounded border"
            style={{ backgroundColor: value || '#3b82f6' }}
          />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-4" align="start">
        <div className="space-y-4">
          <Label className="text-sm font-medium">Choose Color</Label>
          
          {/* Preset Colors */}
          <div className="grid grid-cols-5 gap-2">
            {presetColors.map((color) => (
              <button
                key={color}
                type="button"
                className="w-10 h-10 rounded border-2 border-transparent hover:border-gray-300 transition-colors relative"
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              >
                {value === color && (
                  <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow" />
                )}
              </button>
            ))}
          </div>
          
          {/* Custom Color Input */}
          <div className="space-y-2">
            <Label htmlFor="custom-color" className="text-xs text-muted-foreground">
              Custom Color (HEX)
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-color"
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#000000"
                className="flex-1 text-sm"
                pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => handleColorSelect(customColor)}
                className="px-3"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
