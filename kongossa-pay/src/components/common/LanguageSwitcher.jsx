import React from 'react';
import { useTranslation } from '@/components/common/LanguageProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'ar', name: 'العربية' },
  { code: 'zh', name: '中文' },
  { code: 'pt', name: 'Português' },
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useTranslation();

  return (
    <Select value={language} onValueChange={changeLanguage}>
      <SelectTrigger className="w-full justify-start gap-3">
        <Globe className="w-5 h-5 text-slate-500" />
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}